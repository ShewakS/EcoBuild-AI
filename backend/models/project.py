"""
Project Data Models — EcoBuild AI Architect Workspace
Defines schemas for Project creation, updates, building details, room dimensions, stages, and progress.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class BuildingDetails(BaseModel):
    total_built_up_area_sqft: float = Field(default=1500.0, gt=0, description="Total built-up area in square feet")
    number_of_floors: int = Field(default=1, ge=1, le=100, description="Number of stories/floors")
    ground_floor_area_sqft: Optional[float] = Field(default=1000.0, description="Ground floor footprint")
    floor_height_ft: Optional[float] = Field(default=10.0, description="Average floor to ceiling height in feet")
    plot_area_sqft: Optional[float] = Field(default=2400.0, description="Total plot area in sq.ft")
    
    # Room dimensions and configuration
    bedrooms_count: Optional[int] = Field(default=3, ge=1, le=20)
    bedroom_sizes: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    kitchens_count: Optional[int] = Field(default=1, ge=1, le=10)
    kitchen_sizes: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    bathrooms_count: Optional[int] = Field(default=2, ge=1, le=20)
    living_area_sqft: Optional[float] = Field(default=240.0)
    parking_bays: Optional[int] = Field(default=1, ge=0, le=10)
    balconies_count: Optional[int] = Field(default=1, ge=0, le=10)

    # Structural & Substructure
    construction_type: str = Field(default="Framed RCC Structure", description="Structural type")
    wall_material: str = Field(default="Brick", description="Primary wall masonry material: Brick, AAC Block, Fly Ash Brick")
    roof_type: str = Field(default="RCC Flat", description="Roof system")
    flooring: str = Field(default="Vitrified Tile", description="Flooring type")
    finish_quality: str = Field(default="Standard", description="Finishing standard: Economy, Standard, Premium, Luxury")
    foundation_type: str = Field(default="Isolated Footing", description="Foundation design")
    foundation_depth_ft: Optional[float] = Field(default=6.0, description="Foundation excavation depth in feet")
    soil_type: str = Field(default="Loamy", description="Bearing soil classification")
    seismic_zone: str = Field(default="Zone III (Moderate)", description="IS 1893 Seismic Zone")
    green_certification_target: str = Field(default="GRIHA 3-Star / IGBC Silver", description="Target sustainability rating")
    solar_panels: bool = Field(default=False, description="Rooftop solar PV planned")
    rainwater_harvesting: bool = Field(default=False, description="RWH system planned")
    expected_occupancy: Optional[int] = Field(default=5, description="Designed occupant count")
    notes: Optional[str] = Field(default="", description="Architectural or structural notes")


class StageItem(BaseModel):
    stage_id: int
    stage_name: str
    order: int
    description: str
    status: str = Field(default="pending", description="pending | in_progress | completed")
    progress_percent: float = Field(default=0.0, ge=0.0, le=100.0)
    target_start_date: Optional[str] = None
    target_end_date: Optional[str] = None
    actual_start_date: Optional[str] = None
    actual_end_date: Optional[str] = None
    notes: Optional[str] = ""
    assigned_supervisor: Optional[str] = None
    completion_image_url: Optional[str] = None


class ProjectCreate(BaseModel):
    project_name: str = Field(..., min_length=2, max_length=150)
    client_name: str = Field(..., min_length=2, max_length=100)
    location: str = Field(default="Chennai")
    architect_name: Optional[str] = Field(default="Lead Architect")
    building_details: Optional[BuildingDetails] = None
    target_start_date: Optional[str] = None
    target_completion_date: Optional[str] = None
    notes: Optional[str] = ""


class ProjectUpdate(BaseModel):
    project_name: Optional[str] = None
    client_name: Optional[str] = None
    location: Optional[str] = None
    architect_name: Optional[str] = None
    status: Optional[str] = None
    building_details: Optional[BuildingDetails] = None
    target_start_date: Optional[str] = None
    target_completion_date: Optional[str] = None
    notes: Optional[str] = None
    estimate_id: Optional[str] = None


class ProjectResponse(BaseModel):
    project_id: str
    project_name: str
    client_name: str
    location: str
    architect_name: str
    status: str
    overall_progress_percent: float
    current_stage: str
    building_details: BuildingDetails
    stages: List[StageItem]
    target_start_date: Optional[str] = None
    target_completion_date: Optional[str] = None
    created_at: str
    updated_at: str
    estimate_id: Optional[str] = None
    notes: Optional[str] = ""
