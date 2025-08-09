import toga
from toga.style import Pack
from toga.style.pack import COLUMN

from ..api_client import api_client
from ..charts import pie_chart


class DashboardView(toga.Box):
    def __init__(self, app: toga.App):
        super().__init__(style=Pack(direction=COLUMN, padding=10, flex=1))
        self.app = app
        self.refresh_button = toga.Button("Sync", on_press=self.on_sync)
        self.to_tx_button = toga.Button("Transazioni", on_press=self.on_go_tx)
        self.image = toga.ImageView()
        self.add(self.refresh_button)
        self.add(self.to_tx_button)
        self.add(self.image)

    def refresh(self):
        try:
            data = api_client.get("/dashboard")
            png = pie_chart(data.get("totals_by_category", {}))
            self.image.image = toga.Image(data=png)
        except Exception:
            pass

    def on_sync(self, widget):
        try:
            api_client.post("/transactions/sync")
        except Exception:
            pass
        self.refresh()

    def on_go_tx(self, widget):
        self.app.navigate_to_transactions()


