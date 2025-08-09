import toga
from toga.style import Pack
from toga.style.pack import COLUMN

from .views.login import LoginView
from .views.dashboard import DashboardView
from .views.transactions import TransactionsView


class ExpensesTracker(toga.App):
    def startup(self):
        self.main_window = toga.MainWindow(title=self.formal_name)
        self.login_view = LoginView(app=self)
        self.dashboard_view = DashboardView(app=self)
        self.transactions_view = TransactionsView(app=self)

        # Stack: start with login
        self.main_window.content = self.login_view
        self.main_window.show()

    def navigate_to_dashboard(self):
        self.dashboard_view.refresh()
        self.main_window.content = self.dashboard_view

    def navigate_to_transactions(self):
        self.transactions_view.load_data()
        self.main_window.content = self.transactions_view


def main():
    # Provide explicit name and app_id to ensure correct initialization across platforms
    return ExpensesTracker("Expenses Tracker", "com.example.expenses_tracker")


