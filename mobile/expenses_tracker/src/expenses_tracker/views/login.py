import toga
from toga.style import Pack
from toga.style.pack import COLUMN

from ..api_client import api_client
from ..storage import secure_store


class LoginView(toga.Box):
    def __init__(self, app: toga.App):
        super().__init__(style=Pack(direction=COLUMN, padding=10, flex=1))
        self.app = app

        self.backend_url_input = toga.TextInput(placeholder="Backend URL (es: http://localhost:8000)")
        self.api_key_input = toga.TextInput(placeholder="API Key")

        saved_url = secure_store.get("backend_url")
        saved_key = secure_store.get("api_key")
        if saved_url:
            self.backend_url_input.value = saved_url
        if saved_key:
            self.api_key_input.value = saved_key

        self.login_button = toga.Button("Connetti Banca", on_press=self.on_login)
        self.continue_button = toga.Button("Vai alla Dashboard", on_press=self.on_continue)

        self.add(self.backend_url_input)
        self.add(self.api_key_input)
        self.add(self.login_button)
        self.add(self.continue_button)

    def on_login(self, widget):
        base = self.backend_url_input.value.strip()
        key = self.api_key_input.value.strip()
        if not base or not key:
            return
        api_client.configure(base, key)
        secure_store.set("backend_url", base)
        secure_store.set("api_key", key)
        api_client.open_oauth_login()

    def on_continue(self, widget):
        base = self.backend_url_input.value.strip()
        key = self.api_key_input.value.strip()
        if not base or not key:
            return
        api_client.configure(base, key)
        secure_store.set("backend_url", base)
        secure_store.set("api_key", key)
        self.app.navigate_to_dashboard()


