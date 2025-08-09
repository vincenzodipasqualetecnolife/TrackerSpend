from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import requests

from app.api.deps import require_api_key, get_db
from app.core.config import get_settings
from app.services.truelayer import _get_valid_access_token


router = APIRouter(prefix="/openbanking", tags=["openbanking"], dependencies=[Depends(require_api_key)])


@router.get("/institutions")
def list_institutions(country: str = Query(default="IT")) -> list[dict]:
    settings = get_settings()
    from app.services.truelayer import _get_access_token_pair
    tokens = _get_access_token_pair()
    headers = {"Authorization": f"Bearer {tokens['access']}"}
    resp = requests.get(f"{settings.ng_base_url}/api/v2/institutions/?country={country}", headers=headers, timeout=30)
    resp.raise_for_status()
    return resp.json()


@router.get("/accounts/{account_id}/details")
def account_details(account_id: str, db: Session = Depends(get_db)) -> dict:
    settings = get_settings()
    token = _get_valid_access_token(db)
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{settings.ng_base_url}/api/v2/accounts/{account_id}/details/", headers=headers, timeout=30)
    resp.raise_for_status()
    return resp.json()


@router.get("/accounts/{account_id}/balances")
def account_balances(account_id: str, db: Session = Depends(get_db)) -> dict:
    settings = get_settings()
    token = _get_valid_access_token(db)
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{settings.ng_base_url}/api/v2/accounts/{account_id}/balances/", headers=headers, timeout=30)
    resp.raise_for_status()
    return resp.json()


@router.delete("/requisition/{requisition_id}")
def revoke_requisition(requisition_id: str) -> dict:
    settings = get_settings()
    from app.services.truelayer import _get_access_token_pair
    tokens = _get_access_token_pair()
    headers = {"Authorization": f"Bearer {tokens['access']}"}
    resp = requests.delete(f"{settings.ng_base_url}/api/v2/requisitions/{requisition_id}/", headers=headers, timeout=30)
    if resp.status_code not in (200, 204):
        raise HTTPException(resp.status_code, resp.text)
    return {"revoked": True}


