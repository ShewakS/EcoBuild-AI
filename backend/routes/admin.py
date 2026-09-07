from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List
from middleware.auth import require_role
from models.auth import UserRole, StatusUpdateRequest, PlanUpdateRequest
from services import admin_service
from config import get_db, USAGE_RECORDS_COLLECTION

router = APIRouter(
    prefix="/api/admin",
    tags=["Super Admin"],
    dependencies=[Depends(require_role([UserRole.SUPER_ADMIN.value]))]
)


@router.get("/dashboard")
async def get_dashboard():
    """Retrieve platform-level metrics: architects, projects, customers, plans, and usage."""
    metrics = await admin_service.get_admin_dashboard_metrics()
    return metrics


@router.get("/architects")
async def get_architects():
    """List all architects/builders with status, company, plan, and projects count."""
    architects = await admin_service.list_architects()
    return architects


@router.post("/architects")
async def create_architect(payload: Dict[str, Any]):
    """Create a new Architect/Builder account with company, plan, and organization."""
    if not payload.get("email") or not payload.get("name"):
        raise HTTPException(status_code=400, detail="Name and Email are required")
    try:
        new_arch = await admin_service.create_architect(payload)
        return new_arch
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/architects/{user_id}/status")
async def update_architect_status(user_id: str, payload: StatusUpdateRequest):
    """Update Architect account status: active, inactive, or suspended."""
    try:
        res = await admin_service.update_architect_status(user_id, payload.status.value)
        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch("/architects/{user_id}/plan")
async def update_architect_plan(user_id: str, payload: PlanUpdateRequest):
    """Change Architect SaaS subscription plan (Basic, Professional, Enterprise)."""
    try:
        res = await admin_service.update_architect_plan(user_id, payload.plan.value)
        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/projects")
async def get_platform_projects():
    """Platform-wide project view for Super Admin oversight."""
    projects = await admin_service.list_all_platform_projects()
    return projects


@router.get("/customers")
async def get_platform_customers():
    """Platform-wide customer view for Super Admin oversight."""
    customers = await admin_service.list_all_platform_customers()
    return customers


@router.get("/subscriptions")
async def get_subscriptions():
    """Retrieve all tenant subscriptions with plan limits and current usage."""
    subs = await admin_service.list_all_subscriptions()
    return subs


@router.get("/usage")
async def get_platform_usage():
    """Retrieve platform usage logs."""
    db = get_db()
    records = await db[USAGE_RECORDS_COLLECTION].find({}, {"_id": 0}).sort("timestamp", -1).limit(100).to_list(100)
    return records
