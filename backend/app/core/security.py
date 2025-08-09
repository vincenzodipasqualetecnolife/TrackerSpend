from datetime import datetime, timezone
from typing import Optional
from cryptography.fernet import Fernet, InvalidToken
from .config import get_settings


_fernet: Optional[Fernet] = None


def get_fernet() -> Fernet:
    global _fernet
    if _fernet is None:
        key = (get_settings().secret_key or "").strip()
        if not key:
            raise RuntimeError("SECRET_KEY not configured. Generate a Fernet key and set it in .env")
        # Expect a base64 urlsafe 32-byte key (44 chars). Generate with: from cryptography.fernet import Fernet; Fernet.generate_key()
        _fernet = Fernet(key.encode())
    return _fernet  # type: ignore[return-value]


def encrypt_string(plaintext: str) -> str:
    f = get_fernet()
    return f.encrypt(plaintext.encode()).decode()


def decrypt_string(ciphertext: str) -> str:
    f = get_fernet()
    try:
        return f.decrypt(ciphertext.encode()).decode()
    except InvalidToken as exc:
        raise RuntimeError("Unable to decrypt stored secret. SECRET_KEY may be incorrect.") from exc


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


