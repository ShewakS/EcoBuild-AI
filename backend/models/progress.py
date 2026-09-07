"""
Progress and Site Inspection Image Models — EcoBuild AI
Defines schemas for construction stage logs, progress tracking, and site inspection media.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class ProgressLogCreate(BaseModel):
    project_id: str
    stage_id: int
    stage_name: Optional[str] = None
    progress_percent: float = Field(..., ge=0.0, le=100.0)
    status: Optional[str] = "in_progress"
    log_notes: str = Field(..., min_length=1)
    recorded_by: Optional[str] = "Site Engineer"
    issues_reported: Optional[str] = ""
    date: Optional[str] = None


class ProgressLogResponse(BaseModel):
    log_id: str
    project_id: str
    stage_id: int
    stage_name: str
    progress_percent: float
    status: str
    log_notes: str
    recorded_by: str
    issues_reported: Optional[str] = ""
    created_at: str


class SiteImageResponse(BaseModel):
    image_id: str
    project_id: str
    stage_id: Optional[int] = None
    stage_name: Optional[str] = None
    image_url: str
    filename: str
    caption: str
    tags: List[str] = Field(default_factory=list)
    file_size_bytes: int
    uploaded_by: str
    created_at: str
