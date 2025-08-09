from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from .config import get_settings


class Base(DeclarativeBase):
    pass


settings = get_settings()

# For SQLite in dev, enable check_same_thread=False
engine = create_engine(
    settings.sqlalchemy_database_uri,
    connect_args={"check_same_thread": False} if settings.use_sqlite else {},
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def init_db() -> None:
    from app.models import connection, transaction  # noqa: F401
    Base.metadata.create_all(bind=engine)


