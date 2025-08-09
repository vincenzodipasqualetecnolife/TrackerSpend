from __future__ import annotations

import re
from typing import Iterable
import pandas as pd


KEYWORD_CATEGORIES = [
    (r"(?i)COOP|CONAD|ESSELUNGA|GROCERY|SUPERMARKET", "Groceries"),
    (r"(?i)AMAZON|EBAY|ONLINE", "Shopping"),
    (r"(?i)UBER|TAXI|BUS|TRENO|TRAIN|METRO", "Transport"),
    (r"(?i)RISTORANTE|BAR|CAFFE|MC ?DONALD|FOOD|DELIVEROO|JUST ?EAT", "Dining"),
    (r"(?i)LUCE|GAS|WATER|UTILITY|TELECOM|INTERNET|FIBRA|ENEL|ENI", "Utilities"),
    (r"(?i)AFFITTO|RENT|MORTGAGE|MUTUO", "Housing"),
    (r"(?i)PALESTRA|FITNESS|SPORT|NETFLIX|SPOTIFY|SUBSCRIPTION", "Lifestyle"),
    (r"(?i)FARMACIA|HEALTH|OSPEDALE|MEDICO|DOCTOR|PHARMACY", "Health"),
]


def categorize(description: str, merchant_name: str | None) -> str:
    text = f"{merchant_name or ''} {description}".strip()
    for pattern, category in KEYWORD_CATEGORIES:
        if re.search(pattern, text):
            return category
    return "Other"


def summarize_by_category(rows: Iterable[dict]) -> dict[str, float]:
    df = pd.DataFrame(list(rows))
    if df.empty:
        return {}
    if "amount" in df.columns:
        df["amount"] = pd.to_numeric(df["amount"], errors="coerce").fillna(0)
    grouped = df.groupby("category")["amount"].sum()
    return {k: float(v) for k, v in grouped.to_dict().items()}


def monthly_spending(rows: Iterable[dict]) -> dict[str, float]:
    df = pd.DataFrame(list(rows))
    if df.empty:
        return {}
    df["booking_date"] = pd.to_datetime(df["booking_date"])
    df["ym"] = df["booking_date"].dt.strftime("%Y-%m")
    if "amount" in df.columns:
        df["amount"] = pd.to_numeric(df["amount"], errors="coerce").fillna(0)
    grouped = df.groupby("ym")["amount"].sum().sort_index()
    return {k: float(v) for k, v in grouped.to_dict().items()}


