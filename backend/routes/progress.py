"""
Progress and Site Media API Routes — EcoBuild AI
Handles stage updates, progress logging, and image uploads.
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Dict, Any, Optional
import json
from models.progress import ProgressLogCreate, ProgressLogResponse, SiteImageResponse
from services.progress_service import (
    add_progress_log,
    get_project_progress_logs,
    save_site_image,
    get_project_images,
)
from services.project_service import update_stage

router = APIRouter(prefix="/api/progress", tags=["Construction Progress"])


@router.post("/log", response_model=ProgressLogResponse)
async def create_progress_log_endpoint(payload: ProgressLogCreate):
    """Record a construction stage progress log entry."""
    try:
        return await add_progress_log(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to log progress: {str(e)}")


@router.get("/{project_id}", response_model=List[ProgressLogResponse])
async def get_progress_logs_endpoint(project_id: str):
    """Retrieve all chronological progress log entries for a project."""
    try:
        return await get_project_progress_logs(project_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-image", response_model=SiteImageResponse)
async def upload_site_image_endpoint(
    project_id: str = Form(...),
    stage_id: Optional[int] = Form(None),
    stage_name: Optional[str] = Form(None),
    caption: str = Form("Site Inspection Photo"),
    tags: Optional[str] = Form("[]"),
    uploaded_by: Optional[str] = Form("Site Architect"),
    file: UploadFile = File(...)
):
    """Upload site inspection photo with metadata and tag associations."""
    try:
        parsed_tags = []
        if tags:
            try:
                parsed_tags = json.loads(tags)
            except Exception:
                parsed_tags = [t.strip() for t in tags.split(",") if t.strip()]

        return await save_site_image(
            project_id=project_id,
            stage_id=stage_id,
            stage_name=stage_name,
            caption=caption,
            tags=parsed_tags,
            uploaded_by=uploaded_by,
            file=file
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")


@router.get("/images/{project_id}", response_model=List[SiteImageResponse])
async def get_site_images_endpoint(project_id: str):
    """Retrieve all uploaded site inspection photos for a project."""
    try:
        return await get_project_images(project_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/projects/{project_id}/stages/{stage_id}")
async def update_project_stage_endpoint(project_id: str, stage_id: int, updates: Dict[str, Any]):
    """Update progress percentage, status, or notes of a specific construction stage."""
    res = await update_stage(project_id, stage_id, updates)
    if not res:
        raise HTTPException(status_code=404, detail="Project or Stage not found")
    return res
