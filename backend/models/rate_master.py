from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime


# ─── Category & Unit enums ────────────────────────────────────────────────────

CATEGORIES = Literal[
    "Material",
    "Labour",
    "Electrical",
    "Plumbing",
    "Painting",
    "Finishing",
    "Approval-Misc",
]

UNITS = Literal[
    "bag",    # cement bags
    "ton",    # steel, sand, aggregate
    "count",  # bricks
    "day",    # labour man-days
    "point",  # electrical wiring points
    "fixture",# plumbing fixtures
    "sqft",   # painting / finishing per sqft
    "unit",   # door/window frames
    "%",      # approval-misc percentage
]


# ─── API Schemas ─────────────────────────────────────────────────────────────

class RateEntryCreate(BaseModel):
    """Schema for creating one rate entry (used in POST /api/rates body array)."""
    item_name: str = Field(..., description="E.g. 'Cement (Portland OPC 53)'")
    category: CATEGORIES
    unit: str = Field(..., description="E.g. 'bag', 'ton', 'sqft'")
    rate_value: float = Field(..., gt=0, description="Current price per unit in ₹")
    district: str = Field(
        default="default",
        description="District name or 'default' for all-district baseline",
    )
    updated_by: str = Field(default="system", description="Architect / user who entered this rate")
    is_default: bool = Field(default=False, description="True = system seed rate")


class RateEntryResponse(BaseModel):
    """Schema returned to the frontend for a rate entry."""
    id: str = Field(alias="_id")
    item_name: str
    category: str
    unit: str
    rate_value: float
    district: str
    effective_date: datetime
    updated_by: str
    is_default: bool

    class Config:
        populate_by_name = True


class RatesPostRequest(BaseModel):
    """Batch rate submission — one or more entries at once."""
    rates: list[RateEntryCreate]


class RatesPostResponse(BaseModel):
    inserted_count: int
    inserted_ids: list[str]
