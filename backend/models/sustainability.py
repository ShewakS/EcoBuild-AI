from pydantic import BaseModel, Field
from typing import Optional, Any, Literal, List, Dict
from models.project_estimate import ProjectInputs


# ─── Module 1: Sustainability Score Schemas ───────────────────────────────────

class SustainabilityBreakdownItem(BaseModel):
    factor: str
    points: float
    description: str


class CategoryScore(BaseModel):
    name: str
    score: float
    max_score: float
    percentage: float
    strengths: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)


class SustainabilityScoreRequest(BaseModel):
    """
    Accepts project-spec inputs (all 21 fields) plus already computed
    waste_percent and carbon_footprint metrics.
    """
    inputs: ProjectInputs
    waste_percent: Optional[float] = Field(default=5.0, ge=0.0, le=100.0)
    carbon_footprint_kgco2e: Optional[float] = Field(default=None, ge=0.0)
    carbon_footprint_kgco2e_per_sqft: Optional[float] = Field(default=None, ge=0.0)
    estimate_id: Optional[str] = None
    material_quantities: Optional[Dict[str, Any]] = None


class SustainabilityScoreResponse(BaseModel):
    score: int = Field(..., ge=0, le=100)
    band: str
    grade: str
    categories: List[CategoryScore] = Field(default_factory=list)
    breakdown: List[SustainabilityBreakdownItem]
    waste_percent: float
    carbon_footprint_kgco2e_per_sqft: float
    baseline_carbon_per_sqft: float
    penalty_factor: float
    estimate_id: Optional[str] = None


# ─── Module 2: Eco-Material Recommendation Schemas ────────────────────────────

class EcoMaterialRule(BaseModel):
    rule_id: str
    category: str
    field: str
    condition_operator: str = "=="  # "==", "!=", "in", "not_in"
    condition_value: Any
    secondary_condition: Optional[dict[str, Any]] = None
    suggested_alternative: str
    reason: str
    estimated_cost_delta_percent: Optional[float] = None
    apply_field_update: dict[str, Any] = Field(default_factory=dict)


class EcoRecommendationItem(BaseModel):
    rule_id: str
    category: str
    field: str
    current_choice: str
    suggested_alternative: str
    reason: str
    estimated_cost_delta_percent: Optional[float] = None
    apply_field_update: dict[str, Any]


class EcoRecommendationRequest(BaseModel):
    """
    Accepts project material & specification fields to evaluate.
    Can be populated from ProjectInputs or individual fields.
    """
    wall_material: Optional[str] = "Brick"
    roof_type: Optional[str] = "RCC Flat"
    flooring: Optional[str] = "Vitrified Tile"
    finish_quality: Optional[str] = "Standard"
    solar_panels: Optional[bool] = False
    rainwater_harvesting: Optional[bool] = False
    built_up_area_sqft: Optional[float] = 1500.0
    floors: Optional[int] = 1


class EcoRecommendationResponse(BaseModel):
    total_recommendations: int
    recommendations: list[EcoRecommendationItem]
