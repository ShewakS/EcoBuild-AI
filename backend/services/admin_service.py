from datetime import datetime
from typing import Dict, Any, List
import uuid
import secrets
import string
from config import (
    get_db,
    USERS_COLLECTION,
    ORGANIZATIONS_COLLECTION,
    PROJECTS_COLLECTION,
    SUBSCRIPTIONS_COLLECTION,
    USAGE_RECORDS_COLLECTION
)
from models.auth import UserRole, UserStatus, SubscriptionPlan, PLAN_LIMITS
from services.auth_service import hash_password


async def get_admin_dashboard_metrics() -> Dict[str, Any]:
    """Calculate platform-wide SaaS metrics directly from MongoDB."""
    db = get_db()

    total_architects = await db[USERS_COLLECTION].count_documents({"role": UserRole.ARCHITECT.value})
    active_architects = await db[USERS_COLLECTION].count_documents({"role": UserRole.ARCHITECT.value, "status": UserStatus.ACTIVE.value})
    
    total_customers = await db[USERS_COLLECTION].count_documents({"role": UserRole.CUSTOMER.value})
    active_customers = await db[USERS_COLLECTION].count_documents({"role": UserRole.CUSTOMER.value, "status": UserStatus.ACTIVE.value})
    
    total_projects = await db[PROJECTS_COLLECTION].count_documents({})
    active_projects = await db[PROJECTS_COLLECTION].count_documents({"status": {"$in": ["Planning", "In Progress", "active"]}})

    total_subscriptions = await db[SUBSCRIPTIONS_COLLECTION].count_documents({"status": "active"})

    # Plan distribution
    basic_plans = await db[USERS_COLLECTION].count_documents({"role": UserRole.ARCHITECT.value, "plan": SubscriptionPlan.BASIC.value})
    pro_plans = await db[USERS_COLLECTION].count_documents({"role": UserRole.ARCHITECT.value, "plan": SubscriptionPlan.PROFESSIONAL.value})
    enterprise_plans = await db[USERS_COLLECTION].count_documents({"role": UserRole.ARCHITECT.value, "plan": SubscriptionPlan.ENTERPRISE.value})

    # Total usage counts
    usage_pipeline = [
        {"$group": {"_id": "$action", "count": {"$sum": 1}}}
    ]
    usage_counts_raw = await db[USAGE_RECORDS_COLLECTION].aggregate(usage_pipeline).to_list(100)
    usage_by_action = {item["_id"]: item["count"] for item in usage_counts_raw if item.get("_id")}

    # Recent activity logs
    recent_usage = await db[USAGE_RECORDS_COLLECTION].find({}, {"_id": 0}).sort("timestamp", -1).limit(10).to_list(10)

    # Recent projects
    recent_projects = await db[PROJECTS_COLLECTION].find(
        {},
        {"_id": 0, "project_id": 1, "project_name": 1, "architect_name": 1, "client_name": 1, "location": 1, "status": 1, "created_at": 1}
    ).sort("created_at", -1).limit(5).to_list(5)

    return {
        "overview": {
            "total_architects": total_architects,
            "active_architects": active_architects,
            "total_customers": total_customers,
            "active_customers": active_customers,
            "total_projects": total_projects,
            "active_projects": active_projects,
            "active_subscriptions": total_subscriptions
        },
        "plans_distribution": {
            "Basic": basic_plans,
            "Professional": pro_plans,
            "Enterprise": enterprise_plans
        },
        "usage_statistics": {
            "total_records": await db[USAGE_RECORDS_COLLECTION].count_documents({}),
            "actions_breakdown": usage_by_action,
            "recent_activity": recent_usage
        },
        "recent_projects": recent_projects
    }


async def list_architects() -> List[Dict[str, Any]]:
    """Retrieve all architects with their company, status, plan, and project counts."""
    db = get_db()
    architects = await db[USERS_COLLECTION].find(
        {"role": UserRole.ARCHITECT.value},
        {"_id": 0, "password_hash": 0}
    ).sort("created_at", -1).to_list(200)

    # Enhance with project count
    for arch in architects:
        org_id = arch.get("organization_id")
        user_id = arch.get("user_id")
        count = await db[PROJECTS_COLLECTION].count_documents({
            "$or": [
                {"organization_id": org_id},
                {"created_by": user_id}
            ]
        })
        arch["projects_count"] = count
    return architects


async def create_architect(data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new Architect/Builder account along with their organization and initial subscription.
    Generates a secure temporary password, attempts email delivery, and returns temp_password
    in the response so the Admin UI can display it once if email is not configured."""
    db = get_db()
    email_clean = data["email"].strip().lower()

    existing = await db[USERS_COLLECTION].find_one({"email": email_clean})
    if existing:
        raise ValueError(f"User with email '{email_clean}' already exists")

    user_id = f"USR-ARCH-{uuid.uuid4().hex[:6].upper()}"
    org_id = f"ORG-{uuid.uuid4().hex[:6].upper()}"

    plan = data.get("plan", SubscriptionPlan.PROFESSIONAL.value)

    # Generate a secure temp password if not provided
    provided_pw = data.get("password", "").strip()
    if provided_pw:
        temp_password = provided_pw
    else:
        alphabet = string.ascii_letters + string.digits + "@#$!"
        temp_password = "".join(secrets.choice(alphabet) for _ in range(12))
        # Ensure complexity: at least 1 upper, 1 digit, 1 special
        temp_password = secrets.choice(string.ascii_uppercase) + \
                        secrets.choice(string.digits) + \
                        secrets.choice("@#$!") + \
                        temp_password[:9]

    user_doc = {
        "user_id": user_id,
        "email": email_clean,
        "password_hash": hash_password(temp_password),
        "name": data["name"],
        "role": UserRole.ARCHITECT.value,
        "phone": data.get("phone"),
        "organization_id": org_id,
        "company_name": data.get("company_name", data["name"]),
        "plan": plan,
        "status": data.get("status", UserStatus.ACTIVE.value),
        "assigned_project_ids": [],
        "created_at": datetime.utcnow()
    }

    org_doc = {
        "organization_id": org_id,
        "name": data.get("company_name", f"{data['name']} Org"),
        "owner_id": user_id,
        "email": email_clean,
        "plan": plan,
        "status": user_doc["status"],
        "created_at": datetime.utcnow()
    }

    plan_enum = SubscriptionPlan(plan) if plan in [p.value for p in SubscriptionPlan] else SubscriptionPlan.PROFESSIONAL
    limits = PLAN_LIMITS.get(plan_enum, PLAN_LIMITS[SubscriptionPlan.PROFESSIONAL])

    sub_doc = {
        "subscription_id": f"SUB-{uuid.uuid4().hex[:6].upper()}",
        "organization_id": org_id,
        "plan": plan,
        "status": "active",
        "start_date": datetime.utcnow(),
        "end_date": None,
        "usage_limits": limits,
        "current_usage": {
            "projects_count": 0,
            "predictions_count": 0,
            "cost_analyses": 0,
            "carbon_analyses": 0
        }
    }

    await db[USERS_COLLECTION].insert_one(user_doc)
    await db[ORGANIZATIONS_COLLECTION].insert_one(org_doc)
    await db[SUBSCRIPTIONS_COLLECTION].insert_one(sub_doc)

    # Attempt email delivery (non-fatal if SMTP not configured)
    try:
        from services.email_service import send_architect_credentials
        email_sent = send_architect_credentials(email_clean, data["name"], temp_password)
    except Exception:
        email_sent = False

    clean_user = {k: v for k, v in user_doc.items() if k not in ["password_hash", "_id"]}
    clean_user["temp_password"] = temp_password
    clean_user["email_sent"] = email_sent
    return clean_user


async def update_architect_status(user_id: str, new_status: str) -> Dict[str, Any]:
    """Activate, deactivate, or suspend an architect account without deleting data."""
    db = get_db()
    result = await db[USERS_COLLECTION].update_one(
        {"user_id": user_id, "role": UserRole.ARCHITECT.value},
        {"$set": {"status": new_status, "updated_at": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise ValueError("Architect not found")

    # Also update their organization status
    arch = await db[USERS_COLLECTION].find_one({"user_id": user_id})
    if arch and arch.get("organization_id"):
        await db[ORGANIZATIONS_COLLECTION].update_one(
            {"organization_id": arch["organization_id"]},
            {"$set": {"status": new_status}}
        )

    return {"user_id": user_id, "status": new_status}


async def update_architect_plan(user_id: str, new_plan: str) -> Dict[str, Any]:
    """Change an architect's SaaS subscription plan and update limits."""
    db = get_db()
    arch = await db[USERS_COLLECTION].find_one({"user_id": user_id, "role": UserRole.ARCHITECT.value})
    if not arch:
        raise ValueError("Architect not found")

    plan_enum = SubscriptionPlan(new_plan) if new_plan in [p.value for p in SubscriptionPlan] else SubscriptionPlan.PROFESSIONAL
    limits = PLAN_LIMITS.get(plan_enum, PLAN_LIMITS[SubscriptionPlan.PROFESSIONAL])

    await db[USERS_COLLECTION].update_one(
        {"user_id": user_id},
        {"$set": {"plan": new_plan, "updated_at": datetime.utcnow()}}
    )

    org_id = arch.get("organization_id")
    if org_id:
        await db[ORGANIZATIONS_COLLECTION].update_one(
            {"organization_id": org_id},
            {"$set": {"plan": new_plan}}
        )
        await db[SUBSCRIPTIONS_COLLECTION].update_one(
            {"organization_id": org_id},
            {"$set": {
                "plan": new_plan,
                "usage_limits": limits,
                "updated_at": datetime.utcnow()
            }}
        )

    return {"user_id": user_id, "plan": new_plan, "limits": limits}


async def list_all_platform_projects() -> List[Dict[str, Any]]:
    """Retrieve all platform projects across all architects with tenant attribution."""
    db = get_db()
    projects = await db[PROJECTS_COLLECTION].find({}, {"_id": 0}).sort("created_at", -1).to_list(300)
    return projects


async def list_all_platform_customers() -> List[Dict[str, Any]]:
    """Retrieve all customers registered across the entire platform."""
    db = get_db()
    customers = await db[USERS_COLLECTION].find(
        {"role": UserRole.CUSTOMER.value},
        {"_id": 0, "password_hash": 0}
    ).sort("created_at", -1).to_list(300)

    for cust in customers:
        # Fetch names of assigned projects
        pids = cust.get("assigned_project_ids", [])
        if pids:
            names = await db[PROJECTS_COLLECTION].find(
                {"project_id": {"$in": pids}},
                {"_id": 0, "project_id": 1, "project_name": 1}
            ).to_list(50)
            cust["projects"] = names
        else:
            cust["projects"] = []
    return customers


async def list_all_subscriptions() -> List[Dict[str, Any]]:
    """Retrieve all tenant subscriptions with plan limits and usage status."""
    db = get_db()
    subs = await db[SUBSCRIPTIONS_COLLECTION].find({}, {"_id": 0}).sort("start_date", -1).to_list(100)
    # Join with organization name
    for s in subs:
        org = await db[ORGANIZATIONS_COLLECTION].find_one({"organization_id": s.get("organization_id")}, {"_id": 0})
        if org:
            s["organization_name"] = org.get("name")
            s["contact_email"] = org.get("email")
    return subs
