from datetime import datetime, date, timezone
from decimal import Decimal
from sqlalchemy import String, Integer, DateTime, Date, Numeric, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.core.db import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    provider: Mapped[str] = mapped_column(String(50), default="nordigen", index=True)
    account_id: Mapped[str] = mapped_column(String(128), index=True)
    transaction_id: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    description: Mapped[str] = mapped_column(String)
    merchant_name: Mapped[str] = mapped_column(String, nullable=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    currency: Mapped[str] = mapped_column(String(3))
    category: Mapped[str] = mapped_column(String(64), index=True)
    booking_date: Mapped[date] = mapped_column(Date, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    __table_args__ = (
        UniqueConstraint("transaction_id", name="uq_transaction_id"),
    )


