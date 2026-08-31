from pydantic import BaseModel, Field
from typing import Literal, Optional, Any
from datetime import datetime


# ─── Room & Kitchen Size Schema ───────────────────────────────────────────────

class RoomSize(BaseModel):
    name: str = "Bedroom"
    length_ft: float = 10.0
    width_ft: float = 12.0
    area_sqft: float = 120.0
    preset: Optional[str] = None


# ─── Project Input Schema ─────────────────────────────────────────────────────

class ProjectInputs(BaseModel):
    district: str
    building_type: Literal["Residential", "Commercial", "Industrial", "Institutional"] = "Residential"
    residential_type: Optional[Literal["Individual Villa", "Apartment", "Independent House", "Duplex House", "Row House"]] = "Individual Villa"
    built_up_area_sqft: float = Field(..., gt=0)
    plot_area_sqft: float = Field(..., gt=0)
    floors: int = Field(..., ge=1, le=20)
    bedrooms: int = Field(default=0, ge=0, le=20)
    room_sizes: Optional[list[RoomSize]] = None
    kitchens: int = Field(default=1, ge=0, le=10)
    kitchen_sizes: Optional[list[RoomSize]] = None
    bathrooms: int = Field(..., ge=1, le=20)
    parking: int = Field(..., ge=0, le=10)
    soil_type: Literal["Clay", "Sandy", "Loamy", "Rocky", "Black Cotton"]
    land_type: Literal["Flat", "Sloped", "Hilly"]
    foundation_type: Literal["Strip", "Raft", "Pile", "Isolated Footing"]
    foundation_depth_ft: float = Field(..., ge=2, le=30)
    wall_material: Literal["Brick", "AAC Block", "Hollow Block", "Stone"]
    roof_type: Literal["RCC Flat", "Sloped Tile", "Metal Sheet", "Thatched"]
    flooring: Literal["Ceramic Tile", "Vitrified Tile", "Marble", "Granite", "Concrete"]
    finish_quality: Literal["Standard", "Premium", "Luxury"]
    solar_panels: bool = False
    rainwater_harvesting: bool = False
    earthquake_zone: Optional[Literal["Zone II", "Zone III", "Zone IV", "Zone V"]] = "Zone II"
    wind_zone: Optional[Literal["Zone I", "Zone II", "Zone III", "Zone IV"]] = "Zone II"
    inflation_index: float = Field(default=1.0, ge=0.8, le=2.0)


# ─── Quantity Schemas ─────────────────────────────────────────────────────────

class MLQuantities(BaseModel):
    """Material quantities returned exclusively by ecobuild_stage1_estimator.pkl (Phase 2)."""
    model_config = {"protected_namespaces": ()}
    cement_bags: float
    steel_kg: Optional[float] = 0.0
    steel_tons: float
    sand_tons: float
    sand_cum: Optional[float] = 0.0
    aggregate_tons: float
    aggregate_cum: Optional[float] = 0.0
    brick_count: float
    labour_man_days: float
    model_source: Optional[str] = "ecobuild_stage1_estimator.pkl (XGBoost Multi-Target)"


class DerivedQuantities(BaseModel):
    """Quantities computed via standard architectural estimation ratios."""
    electrical_points_count: float
    plumbing_fixture_count: float
    paintable_area_sqft: float
    bedroom_carpet_area_sqft: Optional[float] = 0.0
    kitchen_carpet_area_sqft: Optional[float] = 0.0


class AllQuantities(BaseModel):
    ml: MLQuantities
    derived: DerivedQuantities


# ─── Cost Breakdown Schema (Phase 1: Explicit Calculation) ────────────────────

class RateUsed(BaseModel):
    item_name: str
    category: str
    unit: str
    rate_value: float
    effective_date: datetime
    district: str


class CostBreakdown(BaseModel):
    material_cost: float
    labour_cost: float
    electrical_cost: float
    plumbing_cost: float
    painting_cost: float
    finishing_cost: float
    approval_misc_cost: float
    total_cost: float
    calculation_method: Optional[str] = "Explicit Formula & Rate-Master Unit Pricing"


# ─── Project Estimate (stored in MongoDB) ────────────────────────────────────

class ProjectEstimateDoc(BaseModel):
    """MongoDB document schema for project_estimates collection."""
    created_at: datetime
    inputs: ProjectInputs
    quantities: AllQuantities
    rates_used: list[RateUsed]
    breakdown: CostBreakdown


# ─── API Response ─────────────────────────────────────────────────────────────

class EstimateResponse(BaseModel):
    estimate_id: str
    created_at: datetime
    inputs: ProjectInputs
    quantities: AllQuantities
    rates_used: list[RateUsed]
    breakdown: CostBreakdown
    rates_last_updated: Optional[datetime] = None
    phase_info: Optional[dict[str, Any]] = None
