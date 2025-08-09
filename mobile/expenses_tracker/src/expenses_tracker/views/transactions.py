import toga
from toga.style import Pack
from toga.style.pack import COLUMN

from ..api_client import api_client


class TransactionsView(toga.Box):
    def __init__(self, app: toga.App):
        super().__init__(style=Pack(direction=COLUMN, padding=10, flex=1))
        self.app = app
        self.table = toga.Table(
            headings=["Data", "Descrizione", "Categoria", "Importo"],
            accessors=["booking_date", "description", "category", "amount"],
            multiple_select=False,
        )
        self.back_button = toga.Button("←", on_press=self.on_back)
        self.add(self.back_button)
        self.add(self.table)

    def load_data(self):
        try:
            if not api_client.base_url:
                self.table.data = []
                return
            items = api_client.get("/transactions")
            self.table.data = [
                {
                    "booking_date": t.get("booking_date"),
                    "description": t.get("description"),
                    "category": t.get("category"),
                    "amount": f"{t.get('amount')} {t.get('currency')}",
                }
                for t in items
            ]
        except Exception:
            self.table.data = []

    def on_back(self, widget):
        self.app.navigate_to_dashboard()


