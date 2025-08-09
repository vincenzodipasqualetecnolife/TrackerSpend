from pydantic import BaseModel
from typing import Dict, Any


class DashboardOut(BaseModel):
    totals_by_category: Dict[str, float]
    monthly_spending: Dict[str, float]
    meta: Dict[str, Any] | None = None


