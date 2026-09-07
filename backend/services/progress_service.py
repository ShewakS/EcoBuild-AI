"""
Progress & Inspection Media Service — EcoBuild AI
Handles stage progress event logs and site inspection image uploads.
"""
import os
import uuid
import aiofiles
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import UploadFile
from config import get_db, PROGRESS_UPDATES_COLLECTION, SITE_IMAGES_COLLECTION
from services.project_service import update_stage, get_project_by_id
from models.progress import ProgressLogCreate, ProgressLogResponse, SiteImageResponse

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads", "site_images")
os.makedirs(UPLOAD_DIR, exist_ok=True)


async def add_progress_log(data: ProgressLogCreate) -> ProgressLogResponse:
    db = get_db()
    collection = db[PROGRESS_UPDATES_COLLECTION]
    
    log_id = f"LOG-{uuid.uuid4().hex[:6].upper()}"
    now_iso = datetime.utcnow().isoformat()
    
    # Determine stage name if missing
    stage_name = data.stage_name
    if not stage_name:
        project = await get_project_by_id(data.project_id)
        if project:
            for s in project.get("stages", []):
                if s.get("stage_id") == data.stage_id:
                    stage_name = s.get("stage_name", f"Stage {data.stage_id}")
                    break
    stage_name = stage_name or f"Stage {data.stage_id}"

    # Sync stage in project
    await update_stage(
        project_id=data.project_id,
        stage_id=data.stage_id,
        stage_updates={
            "progress_percent": data.progress_percent,
            "status": data.status or ("completed" if data.progress_percent >= 100 else "in_progress"),
            "notes": data.log_notes,
        }
    )

    doc = {
        "log_id": log_id,
        "project_id": data.project_id,
        "stage_id": data.stage_id,
        "stage_name": stage_name,
        "progress_percent": data.progress_percent,
        "status": data.status or ("completed" if data.progress_percent >= 100 else "in_progress"),
        "log_notes": data.log_notes,
        "recorded_by": data.recorded_by or "Site Engineer",
        "issues_reported": data.issues_reported or "",
        "created_at": data.date or now_iso,
    }

    await collection.insert_one(doc)
    doc.pop("_id", None)
    return ProgressLogResponse(**doc)


async def get_project_progress_logs(project_id: str) -> List[ProgressLogResponse]:
    db = get_db()
    collection = db[PROGRESS_UPDATES_COLLECTION]
    cursor = collection.find({"project_id": project_id}, {"_id": 0}).sort("created_at", -1)
    logs = await cursor.to_list(length=200)
    return [ProgressLogResponse(**l) for l in logs]


async def save_site_image(
    project_id: str,
    stage_id: Optional[int],
    stage_name: Optional[str],
    caption: str,
    tags: List[str],
    uploaded_by: str,
    file: UploadFile
) -> SiteImageResponse:
    db = get_db()
    collection = db[SITE_IMAGES_COLLECTION]
    
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ".jpg"
    unique_filename = f"{project_id}_{uuid.uuid4().hex[:8]}{ext}"
    dest_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file to disk
    file_bytes = await file.read()
    async with aiofiles.open(dest_path, "wb") as f:
        await f.write(file_bytes)
        
    image_id = f"IMG-{uuid.uuid4().hex[:6].upper()}"
    now_iso = datetime.utcnow().isoformat()
    image_url = f"/uploads/site_images/{unique_filename}"

    doc = {
        "image_id": image_id,
        "project_id": project_id,
        "stage_id": stage_id,
        "stage_name": stage_name or (f"Stage {stage_id}" if stage_id else "General Inspection"),
        "image_url": image_url,
        "filename": unique_filename,
        "caption": caption,
        "tags": tags,
        "file_size_bytes": len(file_bytes),
        "uploaded_by": uploaded_by or "Architect",
        "created_at": now_iso,
    }

    await collection.insert_one(doc)
    doc.pop("_id", None)
    if stage_id:
        try:
            await update_stage(project_id, stage_id, {"completion_image_url": image_url})
        except Exception:
            pass
    return SiteImageResponse(**doc)


async def get_project_images(project_id: str) -> List[SiteImageResponse]:
    db = get_db()
    collection = db[SITE_IMAGES_COLLECTION]
    cursor = collection.find({"project_id": project_id}, {"_id": 0}).sort("created_at", -1)
    images = await cursor.to_list(length=100)
    return [SiteImageResponse(**img) for img in images]
