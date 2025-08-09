from __future__ import annotations

import secrets
from datetime import timedelta
from typing import Any, Dict, List

import requests
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import encrypt_string, decrypt_string, utcnow
from app.models.connection import BankConnection


# Provider migration: implement the same interface but using
# GoCardless Bank Account Data (ex Nordigen) API.


def _get_access_token_pair() -> Dict[str, str]:
    settings = get_settings()
    url = f"{settings.ng_base_url}/api/v2/token/new/"
    data = {"secret_id": settings.ng_secret_id, "secret_key": settings.ng_secret_key}
    resp = requests.post(url, json=data, timeout=30)
    resp.raise_for_status()
    tok = resp.json()
    return {"access": tok["access"], "refresh": tok.get("refresh", "")}


def build_authorize_url(state: str | None = None, institution_id: str | None = None) -> str:
    settings = get_settings()
    if state is None:
        state = secrets.token_urlsafe(16)
    tokens = _get_access_token_pair()
    headers = {"Authorization": f"Bearer {tokens['access']}"}

    institution = institution_id or settings.ng_institution_id
    if not institution:
        raise RuntimeError("NORDIGEN_INSTITUTION_ID not configured.")

    init_body = {
        "redirect": settings.ng_redirect_uri,
        "institution_id": institution,
        "user_language": settings.ng_user_language,
        "reference": state,
    }
    resp = requests.post(f"{settings.ng_base_url}/api/v2/requisitions/", json=init_body, headers=headers, timeout=30)
    resp.raise_for_status()
    rq = resp.json()
    # Persist requisition id and reference temporary in DB row (create if needed)
    # Tokens will be fetched and stored at callback
    # We store them on the single-connection row
    from sqlalchemy.orm import Session
    from app.core.db import SessionLocal  # type: ignore
    from app.models.connection import BankConnection

    with SessionLocal() as db:  # type: ignore[attr-defined]
        conn = db.query(BankConnection).first()
        if conn is None:
            conn = BankConnection(
                provider="nordigen",
                access_token_encrypted=encrypt_string(""),
                refresh_token_encrypted=encrypt_string(""),
                scope="",
                requisition_id=rq.get("id"),
                reference=state,
                expires_at=utcnow(),
            )
            db.add(conn)
        else:
            conn.requisition_id = rq.get("id")
            conn.reference = state
        db.commit()
    return rq["link"]  # URL da aprire nel browser


def exchange_code_for_token(db: Session, code: str | None = None) -> BankConnection:
    # Nordigen non restituisce un code OAuth; il backend viene richiamato
    # con "ref" (reference) e la requisition già creata contiene i consensi.
    # Manteniamo la firma ma non utilizziamo "code".
    settings = get_settings()
    tokens = _get_access_token_pair()

    # Salviamo i token come se fossero access/refresh del provider
    connection = db.query(BankConnection).first()
    if connection is None:
        connection = BankConnection(
            provider="nordigen",
            access_token_encrypted=encrypt_string(tokens["access"]),
            refresh_token_encrypted=encrypt_string(tokens.get("refresh", "")),
            scope="accounts transactions",
            expires_at=utcnow() + timedelta(seconds=3600),
        )
        db.add(connection)
    else:
        connection.provider = "nordigen"
        connection.access_token_encrypted = encrypt_string(tokens["access"])
        connection.refresh_token_encrypted = encrypt_string(tokens.get("refresh", ""))
        connection.scope = "accounts transactions"
        connection.expires_at = utcnow() + timedelta(seconds=3600)

    db.commit()
    db.refresh(connection)
    return connection


def _refresh_access_token(db: Session, connection: BankConnection) -> BankConnection:
    # Con token short-lived potremmo rigenerare l'access token
    tokens = _get_access_token_pair()
    connection.access_token_encrypted = encrypt_string(tokens["access"])
    connection.refresh_token_encrypted = encrypt_string(tokens.get("refresh", ""))
    connection.expires_at = utcnow() + timedelta(seconds=3600)
    db.commit()
    db.refresh(connection)
    return connection


def _get_valid_access_token(db: Session) -> str:
    connection = db.query(BankConnection).first()
    if connection is None:
        raise RuntimeError("No bank connection configured. Complete OAuth first.")
    if connection.expires_at <= utcnow():
        connection = _refresh_access_token(db, connection)
    return decrypt_string(connection.access_token_encrypted)


def fetch_accounts(db: Session) -> List[Dict[str, Any]]:
    settings = get_settings()
    token = _get_valid_access_token(db)
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{settings.ng_base_url}/api/v2/accounts/", headers=headers, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    # Normalizza: restituiamo una lista di dict con chiave account_id
    results: List[Dict[str, Any]] = []
    for acc in data:
        acc_id = acc.get("id") or acc.get("account_id") or acc.get("resourceId")
        if acc_id:
            results.append({"account_id": acc_id})
    return results


def fetch_transactions_for_account(db: Session, account_id: str, from_date: str, to_date: str) -> List[Dict[str, Any]]:
    settings = get_settings()
    token = _get_valid_access_token(db)
    headers = {"Authorization": f"Bearer {token}"}
    url = f"{settings.ng_base_url}/api/v2/accounts/{account_id}/transactions/?date_from={from_date}&date_to={to_date}"
    resp = requests.get(url, headers=headers, timeout=60)
    resp.raise_for_status()
    data = resp.json()
    # Normalizza al formato atteso dal resto del codice
    booked = data.get("booked", []) or data.get("transactions", {}).get("booked", [])
    pending = data.get("pending", []) or data.get("transactions", {}).get("pending", [])
    results: List[Dict[str, Any]] = []
    for t in booked + pending:
        results.append({
            "transaction_id": t.get("transactionId") or t.get("internalTransactionId") or t.get("id"),
            "description": t.get("remittanceInformationUnstructured") or t.get("description") or "",
            "merchant_name": None,
            "amount": float(t.get("transactionAmount", {}).get("amount") or t.get("amount", 0)),
            "currency": t.get("transactionAmount", {}).get("currency") or t.get("currency") or "EUR",
            "booking_date": (t.get("bookingDate") or t.get("bookingDateTime", "").split("T")[0] or from_date),
        })
    return results


