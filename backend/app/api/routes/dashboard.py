from __future__ import annotations

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_api_key, get_db
from app.models.transaction import Transaction
from app.schemas.dashboard import DashboardOut
from app.utils.categorize import summarize_by_category, monthly_spending

router = APIRouter(prefix="/dashboard", tags=["dashboard"], dependencies=[Depends(require_api_key)])


@router.get("", response_model=DashboardOut)
def get_dashboard(db: Session = Depends(get_db)) -> DashboardOut:
    rows: List[dict] = [
        {
            "category": t.category,
            "amount": float(t.amount),
            "booking_date": t.booking_date.isoformat(),
        }
        for t in db.query(Transaction).all()
    ]
    return DashboardOut(
        totals_by_category=summarize_by_category(rows),
        monthly_spending=monthly_spending(rows),
        meta={"count": len(rows)},
    )


