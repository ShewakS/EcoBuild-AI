"""
Projects and Architect Analytics API Routes — EcoBuild AI
Handles Project CRUD and unified consolidated Architect Project Analytics.
"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from config import get_db, PROJECT_ESTIMATES_COLLECTION
from models.project import ProjectCreate, ProjectUpdate, ProjectResponse
from services.project_service import (
    create_project,
    get_all_projects,
    get_project_by_id,
    update_project,
    delete_project,
)
from services.progress_service import get_project_progress_logs, get_project_images

router = APIRouter(prefix="/api/projects", tags=["Architect Projects"])


@router.post("", response_model=Dict[str, Any])
async def create_new_project(payload: ProjectCreate):
    """Create a new Architect project with 11 standard construction stages."""
    try:
        return await create_project(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create project: {str(e)}")


@router.get("", response_model=List[Dict[str, Any]])
async def list_projects():
    """List all architect construction projects."""
    try:
        return await get_all_projects()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{project_id}", response_model=Dict[str, Any])
async def get_project(project_id: str):
    """Get single project specifications and stage checklist."""
    project = await get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.put("/{project_id}", response_model=Dict[str, Any])
async def edit_project(project_id: str, payload: ProjectUpdate):
    """Update project metadata or building parameters."""
    project = await update_project(project_id, payload)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.delete("/{project_id}")
async def delete_project_endpoint(project_id: str):
    """Delete a construction project and associated progress data."""
    success = await delete_project(project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"status": "success", "message": f"Project {project_id} deleted successfully"}


@router.get("/{project_id}/analytics", response_model=Dict[str, Any])
async def get_project_analytics(project_id: str):
    """
    Consolidated Architect Analytics Dashboard endpoint.
    Aggregates:
      - Project metadata & building specs
      - 11 Stages progress & completion ratios
      - Latest cost estimate, material quantities, carbon metrics, waste risks,
        sustainability score & grade
      - Recent inspection photos and progress logs
    """
    project = await get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db = get_db()
    
    # 1. Fetch latest estimate linked to this project or by project_id match
    estimate_doc = None
    if project.get("estimate_id"):
        estimate_doc = await db[PROJECT_ESTIMATES_COLLECTION].find_one(
            {"estimate_id": project["estimate_id"]}, {"_id": 0}
        )
    if not estimate_doc:
        estimate_doc = await db[PROJECT_ESTIMATES_COLLECTION].find_one(
            {"$or": [{"project_id": project_id}, {"inputs.project_id": project_id}]},
            {"_id": 0},
            sort=[("created_at", -1)]
        )

    # 2. Stage metrics
    stages = project.get("stages", [])
    total_stages = len(stages)
    completed_stages = sum(1 for s in stages if s.get("status") == "completed")
    in_progress_stages = sum(1 for s in stages if s.get("status") == "in_progress")
    pending_stages = sum(1 for s in stages if s.get("status") == "pending")

    # 3. Progress logs & site images
    logs = await get_project_progress_logs(project_id)
    images = await get_project_images(project_id)

    return {
        "project": project,
        "stage_metrics": {
            "total_stages": total_stages,
            "completed_stages": completed_stages,
            "in_progress_stages": in_progress_stages,
            "pending_stages": pending_stages,
            "overall_progress_percent": project.get("overall_progress_percent", 0.0),
            "current_stage": project.get("current_stage", "Planning"),
        },
        "estimate": estimate_doc,
        "recent_logs": [log.dict() for log in logs[:10]],
        "recent_images": [img.dict() for img in images[:12]],
        "total_images_count": len(images),
        "total_logs_count": len(logs),
    }
