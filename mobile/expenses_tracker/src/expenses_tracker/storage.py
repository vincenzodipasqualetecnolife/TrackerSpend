from __future__ import annotations

try:
    from toga.hardware import SecureStorage
except Exception:  # desktop dev fallback
    SecureStorage = None


class SecureStore:
    def __init__(self, service: str = "expenses-tracker"):
        self.service = service
        self._storage = SecureStorage(service=service) if SecureStorage else None
        self._memory: dict[str, str] = {}

    def set(self, key: str, value: str) -> None:
        if self._storage:
            self._storage.set(key, value)
        else:
            self._memory[key] = value

    def get(self, key: str) -> str | None:
        if self._storage:
            return self._storage.get(key)
        return self._memory.get(key)


secure_store = SecureStore()


