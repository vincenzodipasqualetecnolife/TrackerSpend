from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel


class TransactionOut(BaseModel):
    id: int
    provider: str
    account_id: str
    transaction_id: str
    description: str
    merchant_name: str | None
    amount: Decimal
    currency: str
    category: str
    booking_date: date
    created_at: datetime

    class Config:
        from_attributes = True


