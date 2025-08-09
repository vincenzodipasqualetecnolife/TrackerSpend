from __future__ import annotations

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.db import init_db
from app.api.routes import auth as auth_routes
from app.api.routes import transactions as tx_routes
from app.api.routes import openbanking as ob_routes
from app.api.routes import dashboard as dash_routes


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.use_sqlite:
        init_db()
    yield


app = FastAPI(title="AI Tracker Backend", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


app.include_router(auth_routes.router)
app.include_router(tx_routes.router)
app.include_router(dash_routes.router)
app.include_router(ob_routes.router)


