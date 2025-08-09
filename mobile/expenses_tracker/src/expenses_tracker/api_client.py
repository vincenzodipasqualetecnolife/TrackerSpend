from __future__ import annotations

import json
import webbrowser
from typing import Any, Dict
import requests


class ApiClient:
    def __init__(self):
        self.base_url: str | None = None
        self.api_key: str | None = None

    def configure(self, base_url: str, api_key: str) -> None:
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key

    def _headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["X-API-Key"] = self.api_key
        return headers

    def get(self, path: str) -> Any:
        assert self.base_url
        resp = requests.get(f"{self.base_url}{path}", headers=self._headers(), timeout=30)
        resp.raise_for_status()
        return resp.json()

    def post(self, path: str, data: Dict[str, Any] | None = None) -> Any:
        assert self.base_url
        resp = requests.post(f"{self.base_url}{path}", headers=self._headers(), json=data or {}, timeout=30)
        resp.raise_for_status()
        return resp.json()

    def open_oauth_login(self) -> None:
        # open web flow handled by backend; in real mobile app use platform WebView
        assert self.base_url
        # First get the authorize URL (with API key)
        data = self.get("/auth/login")
        url = data.get("authorize_url")
        if url:
            webbrowser.open(url)


api_client = ApiClient()


