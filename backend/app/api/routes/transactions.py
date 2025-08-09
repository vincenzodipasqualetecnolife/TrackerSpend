from __future__ import annotations

from datetime import date, timedelta
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_api_key, get_db
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionOut
from app.services.truelayer import fetch_accounts, fetch_transactions_for_account
from app.utils.categorize import categorize

router = APIRouter(prefix="/transactions", tags=["transactions"], dependencies=[Depends(require_api_key)])


@router.get("", response_model=List[TransactionOut])
def list_transactions(db: Session = Depends(get_db)) -> List[TransactionOut]:
    items = db.query(Transaction).order_by(Transaction.booking_date.desc(), Transaction.id.desc()).limit(500).all()
    return items  # FastAPI will serialize via Pydantic


@router.post("/sync")
def sync_transactions(db: Session = Depends(get_db)) -> dict:
    # Define time window for sync
    to_d = date.today()
    from_d = to_d - timedelta(days=90)
    accounts = fetch_accounts(db)
    inserted = 0
    for acc in accounts:
        acc_id = acc.get("account_id")
        if not acc_id:
            continue
        results = fetch_transactions_for_account(db, acc_id, from_d.isoformat(), to_d.isoformat())
        for t in results:
            tx_id = t.get("transaction_id")
            if not tx_id:
                continue
            # Insert if not exists
            exists = db.query(Transaction).filter(Transaction.transaction_id == tx_id).first()
            if exists:
                continue
            description = t.get("description") or ""
            merchant = t.get("merchant_name")
            amount = t.get("amount")
            currency = t.get("currency") or "EUR"
            booking_date_str = t.get("booking_date") or t.get("timestamp", "").split("T")[0]
            from datetime import date as _date
            try:
                booking_date = _date.fromisoformat(booking_date_str)
            except Exception:
                continue
            category = categorize(description, merchant)
            tx = Transaction(
                provider="nordigen",
                account_id=acc_id,
                transaction_id=tx_id,
                description=description,
                merchant_name=merchant,
                amount=amount,
                currency=currency,
                category=category,
                booking_date=booking_date,
            )
            db.add(tx)
            inserted += 1
    db.commit()
    return {"inserted": inserted}


