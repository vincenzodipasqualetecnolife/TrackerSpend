from __future__ import annotations

import io
from typing import Dict

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt


def pie_chart(totals_by_category: Dict[str, float]) -> bytes:
    if not totals_by_category:
        totals_by_category = {"No data": 1.0}
    labels = list(totals_by_category.keys())
    sizes = list(totals_by_category.values())
    fig, ax = plt.subplots(figsize=(4, 4))
    ax.pie(sizes, labels=labels, autopct="%1.1f%%", startangle=90)
    ax.axis("equal")
    buf = io.BytesIO()
    plt.tight_layout()
    fig.savefig(buf, format="png")
    plt.close(fig)
    return buf.getvalue()


