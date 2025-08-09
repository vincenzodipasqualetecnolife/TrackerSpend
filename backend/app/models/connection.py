from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.core.db import Base


class BankConnection(Base):
    __tablename__ = "bank_connections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    provider: Mapped[str] = mapped_column(String(50), default="nordigen", index=True)
    access_token_encrypted: Mapped[str] = mapped_column(String, nullable=False)
    refresh_token_encrypted: Mapped[str] = mapped_column(String, nullable=False)
    scope: Mapped[str] = mapped_column(String, nullable=True)
    # Nordigen requisition tracking
    requisition_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    reference: Mapped[str | None] = mapped_column(String, nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


