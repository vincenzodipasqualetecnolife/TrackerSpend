from fastapi import Header, HTTPException, status, Depends
from app.core.config import get_settings


def require_api_key(x_api_key: str | None = Header(default=None)) -> None:
    settings = get_settings()
    if settings.api_key and x_api_key == settings.api_key:
        return
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key")


def get_db():
    from app.core.db import SessionLocal

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


