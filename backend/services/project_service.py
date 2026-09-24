"""
Project Service — EcoBuild AI Architect Workspace
Handles Project creation, stage initialisation, progress updates, and data retrieval.
"""
from datetime import datetime
import uuid
from typing import List, Optional, Dict, Any
from config import get_db, PROJECTS_COLLECTION, PROJECT_ESTIMATES_COLLECTION
from models.project import ProjectCreate, ProjectUpdate, ProjectResponse, StageItem, BuildingDetails


DEFAULT_CONSTRUCTION_STAGES = [
    {
        "stage_id": 1,
        "order": 1,
        "stage_name": "Planning, Permits & Architectural Approval",
        "description": "Architectural drawings, structural vetting, statutory approvals, and site mobilization.",
        "status": "completed",
        "progress_percent": 100.0,
    },
    {
        "stage_id": 2,
        "order": 2,
        "stage_name": "Site Clearance, Surveying & Earthwork",
        "description": "Vegetation clearing, benchmark leveling, excavation for foundation pits, and disposal of surplus soil.",
        "status": "in_progress",
        "progress_percent": 60.0,
    },
    {
        "stage_id": 3,
        "order": 3,
        "stage_name": "Substructure: Foundation & Footing",
        "description": "PCC mud mat, rebar cage placement for isolated/raft footings, and foundation concrete pouring.",
        "status": "pending",
        "progress_percent": 0.0,
    },
    {
        "stage_id": 4,
        "order": 4,
        "stage_name": "Plinth Beam, DPC & Backfilling",
        "description": "Plinth beam shuttering and casting, damp-proof course (DPC), anti-termite treatment, and gravel backfill.",
        "status": "pending",
        "progress_percent": 0.0,
    },
    {
        "stage_id": 5,
        "order": 5,
        "stage_name": "Superstructure: RCC Columns & Framed Structure",
        "description": "Column rebar tying, formwork shuttering, and staging for column concrete casting.",
        "status": "pending",
        "progress_percent": 0.0,
    },
    {
        "stage_id": 6,
        "order": 6,
        "stage_name": "Masonry: Brickwork / AAC Block Construction",
        "description": "External envelope and internal partition wall masonry using specified mortar and lintel bands.",
        "status": "pending",
        "progress_percent": 0.0,
    },
    {
        "stage_id": 7,
        "order": 7,
        "stage_name": "Roof Slab Casting, Shuttering & Curing",
        "description": "Beam and slab deck shuttering, reinforcement mesh laying, electrical conduct embedment, and monolithic concrete pouring.",
        "status": "pending",
        "progress_percent": 0.0,
    },
    {
        "stage_id": 8,
        "order": 8,
        "stage_name": "MEP Rough-In: Electrical & Plumbing Conduits",
        "description": "Chasing walls for conduit pipes, sanitary drainage line installation, water supply piping, and junction boxes.",
        "status": "pending",
        "progress_percent": 0.0,
    },
    {
        "stage_id": 9,
        "order": 9,
        "stage_name": "Internal & External Plastering / Surface Prep",
        "description": "Ceiling and wall cement/gypsum plastering, groove cutting, curing, and surface leveling.",
        "status": "pending",
        "progress_percent": 0.0,
    },
    {
        "stage_id": 10,
        "order": 10,
        "stage_name": "Flooring, Tiling, Joinery & Painting",
        "description": "Vitrified/granite tile laying, door and window frames, primer application, and two coats of emulsion.",
        "status": "pending",
        "progress_percent": 0.0,
    },
    {
        "stage_id": 11,
        "order": 11,
        "stage_name": "Final Finishing, Quality Inspection & Handover",
        "description": "Fixture installation, deep cleaning, architectural punch-list clearance, and final commissioning certificate.",
        "status": "pending",
        "progress_percent": 0.0,
    },
]


def generate_project_id() -> str:
    """Generates a human-friendly unique project ID like PRJ-2026-A8F2"""
    date_str = datetime.now().strftime("%Y")
    rand_suffix = uuid.uuid4().hex[:4].upper()
    return f"PRJ-{date_str}-{rand_suffix}"


def calculate_overall_progress(stages: List[Dict[str, Any]]) -> float:
    if not stages:
        return 0.0
    total_pct = sum(float(s.get("progress_percent", 0.0)) for s in stages)
    return round(total_pct / len(stages), 1)


def determine_current_stage(stages: List[Dict[str, Any]]) -> str:
    for s in stages:
        if s.get("status") == "in_progress":
            return s.get("stage_name", "In Progress")
    for s in reversed(stages):
        if s.get("status") == "completed":
            return f"Completed: {s.get('stage_name')}"
    return stages[0]["stage_name"] if stages else "Planning"


async def create_project(data: ProjectCreate, user: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    db = get_db()
    collection = db[PROJECTS_COLLECTION]
    
    project_id = generate_project_id()
    now_iso = datetime.utcnow().isoformat()
    
    # Initialize 11 stages with first stage active/completed
    stages = [dict(s) for s in DEFAULT_CONSTRUCTION_STAGES]
    overall_progress = calculate_overall_progress(stages)
    current_stage = determine_current_stage(stages)

    building_details_dict = data.building_details.dict() if data.building_details else BuildingDetails().dict()

    org_id = user.get("organization_id") if user else None
    created_by = user.get("user_id") if user else None
    arch_name = data.architect_name or (user.get("name") if user else "Lead Architect")

    doc = {
        "project_id": project_id,
        "project_name": data.project_name,
        "client_name": data.client_name,
        "location": data.location,
        "architect_name": arch_name,
        "organization_id": org_id,
        "created_by": created_by,
        "customer_id": None,
        "customer_email": None,
        "customer_name": data.client_name,
        "status": "in_progress",
        "overall_progress_percent": overall_progress,
        "current_stage": current_stage,
        "building_details": building_details_dict,
        "stages": stages,
        "target_start_date": data.target_start_date,
        "target_completion_date": data.target_completion_date,
        "notes": data.notes or "",
        "estimate_id": None,
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    await collection.insert_one(doc)
    doc.pop("_id", None)
    return doc


async def delete_project(project_id: str) -> bool:
    db = get_db()
    res = await db[PROJECTS_COLLECTION].delete_one({"project_id": project_id})
    from config import PROGRESS_UPDATES_COLLECTION, SITE_IMAGES_COLLECTION
    await db[PROGRESS_UPDATES_COLLECTION].delete_many({"project_id": project_id})
    await db[SITE_IMAGES_COLLECTION].delete_many({"project_id": project_id})
    return res.deleted_count > 0


async def get_all_projects(user: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    db = get_db()
    collection = db[PROJECTS_COLLECTION]
    
    query = {}
    if user:
        role = user.get("role")
        if role == "SUPER_ADMIN":
            query = {}
        elif role == "ARCHITECT":
            org_id = user.get("organization_id")
            uid = user.get("user_id")
            if org_id or uid:
                query = {"$or": []}
                if org_id:
                    query["$or"].append({"organization_id": org_id})
                if uid:
                    query["$or"].append({"created_by": uid})
        elif role == "CUSTOMER":
            uid = user.get("user_id")
            email = user.get("email")
            assigned = user.get("assigned_project_ids", [])
            query = {
                "$or": [
                    {"customer_id": uid},
                    {"customer_email": email},
                    {"project_id": {"$in": assigned}}
                ]
            }

    cursor = collection.find(query, {"_id": 0}).sort("created_at", -1)
    return await cursor.to_list(length=200)


async def assign_customer_to_project(project_id: str, customer_data: Dict[str, Any], architect_user: Dict[str, Any]) -> Dict[str, Any]:
    """Create or link a customer user to the project, maintaining multi-tenant organization boundaries."""
    from config import USERS_COLLECTION
    from services.auth_service import hash_password
    from models.auth import UserRole, UserStatus
    
    db = get_db()
    email_clean = customer_data["email"].strip().lower()
    
    # Check if user already exists
    user = await db[USERS_COLLECTION].find_one({"email": email_clean})
    if not user:
        cust_id = f"USR-CUST-{uuid.uuid4().hex[:6].upper()}"
        pwd = customer_data.get("password") or os.environ.get("DEFAULT_CUSTOMER_PASSWORD", "EcoBuild#Cust2026")
        user_doc = {
            "user_id": cust_id,
            "email": email_clean,
            "password_hash": hash_password(pwd),
            "name": customer_data.get("name", "Valued Client"),
            "role": UserRole.CUSTOMER.value,
            "phone": customer_data.get("phone"),
            "organization_id": architect_user.get("organization_id"),
            "status": UserStatus.ACTIVE.value,
            "assigned_project_ids": [project_id],
            "created_at": datetime.utcnow()
        }
        await db[USERS_COLLECTION].insert_one(user_doc)
        customer_id = cust_id
        customer_name = user_doc["name"]
    else:
        customer_id = user["user_id"]
        customer_name = user.get("name", customer_data.get("name", "Valued Client"))
        # Add project_id to customer assigned list if not present
        await db[USERS_COLLECTION].update_one(
            {"email": email_clean},
            {"$addToSet": {"assigned_project_ids": project_id}}
        )

    # Update project with customer details
    updated_project = await db[PROJECTS_COLLECTION].find_one_and_update(
        {"project_id": project_id},
        {
            "$set": {
                "customer_id": customer_id,
                "customer_email": email_clean,
                "customer_name": customer_name,
                "client_name": customer_name,
                "updated_at": datetime.utcnow().isoformat()
            }
        },
        return_document=True,
        projection={"_id": 0}
    )
    return {
        "project": updated_project,
        "customer": {
            "customer_id": customer_id,
            "name": customer_name,
            "email": email_clean,
            "phone": customer_data.get("phone")
        }
    }



async def get_project_by_id(project_id: str) -> Optional[Dict[str, Any]]:
    db = get_db()
    collection = db[PROJECTS_COLLECTION]
    return await collection.find_one({"project_id": project_id}, {"_id": 0})


async def update_project(project_id: str, updates: ProjectUpdate) -> Optional[Dict[str, Any]]:
    db = get_db()
    collection = db[PROJECTS_COLLECTION]
    
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    if not update_data:
        return await get_project_by_id(project_id)
        
    if "building_details" in update_data and hasattr(update_data["building_details"], "dict"):
        update_data["building_details"] = update_data["building_details"].dict()

    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    res = await collection.find_one_and_update(
        {"project_id": project_id},
        {"$set": update_data},
        return_document=True,
        projection={"_id": 0}
    )
    return res


async def update_stage(project_id: str, stage_id: int, stage_updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    db = get_db()
    collection = db[PROJECTS_COLLECTION]
    
    project = await collection.find_one({"project_id": project_id})
    if not project:
        return None
        
    stages = project.get("stages", [])
    updated = False
    for s in stages:
        if s.get("stage_id") == stage_id:
            for k, v in stage_updates.items():
                if v is not None:
                    s[k] = v
            # Auto update status based on progress_percent if provided
            if "progress_percent" in stage_updates:
                pct = float(stage_updates["progress_percent"])
                if pct >= 100:
                    s["status"] = "completed"
                elif pct > 0:
                    s["status"] = "in_progress"
                else:
                    s["status"] = "pending"
            updated = True
            break
            
    if not updated:
        return None
        
    overall_progress = calculate_overall_progress(stages)
    current_stage = determine_current_stage(stages)
    now_iso = datetime.utcnow().isoformat()

    res = await collection.find_one_and_update(
        {"project_id": project_id},
        {
            "$set": {
                "stages": stages,
                "overall_progress_percent": overall_progress,
                "current_stage": current_stage,
                "updated_at": now_iso,
            }
        },
        return_document=True,
        projection={"_id": 0}
    )
    return res
