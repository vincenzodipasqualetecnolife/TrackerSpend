from fastapi import APIRouter, Depends, HTTPException, Response, Request, Query
from fastapi.responses import RedirectResponse, HTMLResponse, JSONResponse
from sqlalchemy.orm import Session

from app.api.deps import require_api_key, get_db
from app.services.truelayer import build_authorize_url, exchange_code_for_token

router = APIRouter(prefix="/auth", tags=["auth"]) 


@router.get("/login", dependencies=[Depends(require_api_key)])
def get_login_url(institution_id: str | None = Query(default=None)) -> JSONResponse:
    url = build_authorize_url(institution_id=institution_id)
    return JSONResponse({"authorize_url": url})


@router.get("/login/web")
def login_web() -> RedirectResponse:
    url = build_authorize_url()
    return RedirectResponse(url=url)


@router.get("/callback")
def auth_callback(request: Request, code: str | None = None, ref: str | None = None, error: str | None = None, db: Session = Depends(get_db)) -> Response:
    if error:
        raise HTTPException(status_code=400, detail=error)
    # Nordigen flow does not send an OAuth code; accept either code or ref
    if not code and not ref:
        raise HTTPException(status_code=400, detail="Missing authorization code or reference")
    exchange_code_for_token(db, code)
    html = """
    <html>
      <head><title>Connected</title></head>
      <body>
        <h2>Bank account linked successfully.</h2>
        <p>You can now return to the app.</p>
      </body>
    </html>
    """
    return HTMLResponse(content=html)


