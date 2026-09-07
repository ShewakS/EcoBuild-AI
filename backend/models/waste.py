"""
Waste Models — EcoBuild AI
Defines request and response schemas for authentic CPWD/BMTPC construction waste calculations.
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any


class WasteMaterialInput(BaseModel):
    material_key: str = Field(..., description="e.g. cement, steel, bricks, sand, aggregate, paint")
    quantity: float = Field(..., ge=0, description="Estimated total quantity of material")
    unit: Optional[str] = Field(default="", description="Unit of measure (e.g. Bags, Tonnes, Pieces)")
    unit_rate_inr: Optional[float] = Field(default=0.0, ge=0, description="Unit cost in INR for financial waste loss computation")
    custom_waste_percent: Optional[float] = Field(default=None, ge=0.0, le=50.0, description="Optional custom site waste %")


class WasteCalculationRequest(BaseModel):
    project_id: Optional[str] = None
    materials: List[WasteMaterialInput]


class WasteMaterialResult(BaseModel):
    material_key: str
    material_name: str
    planned_quantity: float
    unit: str
    min_waste_percent: float
    max_waste_percent: float
    applied_waste_percent: float
    estimated_waste_quantity: float
    waste_risk_level: str  # "Low", "Normal", "High"
    unit_rate_inr: float
    estimated_financial_loss_inr: float
    standard_source: str
    primary_causes: str
    mitigation_strategies: List[str]


class WasteCalculationResponse(BaseModel):
    total_financial_loss_inr: float
    average_waste_percent: float
    overall_waste_risk: str  # "Low", "Normal", "High"
    materials: List[WasteMaterialResult]
    benchmarks_source: str
