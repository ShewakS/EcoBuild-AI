"""
Reuse Models — EcoBuild AI
Defines schemas for safe material reuse recommendations and structural safety warnings.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class ReuseRuleItem(BaseModel):
    rule_id: str
    material: str
    category: str
    safe_application: str
    suitability: str
    benefits: str
    environmental_impact: str
    estimated_savings_inr: str
    safety_warning: str


class ReuseRecommendationRequest(BaseModel):
    project_id: Optional[str] = None
    materials_present: Optional[List[str]] = Field(
        default=["Bricks", "Steel", "Aggregate", "Sand", "Timber"],
        description="Materials available or with surplus waste on site"
    )
    built_up_area_sqft: Optional[float] = 1500.0


class ReuseRecommendationResponse(BaseModel):
    total_recommendations: int
    recommendations: List[ReuseRuleItem]
    crucial_safety_principles: List[str]
