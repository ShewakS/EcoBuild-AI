import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
from datetime import datetime, timedelta
from config import (
    get_db,
    USERS_COLLECTION,
    ORGANIZATIONS_COLLECTION,
    SUBSCRIPTIONS_COLLECTION,
    USAGE_RECORDS_COLLECTION,
    PROJECTS_COLLECTION
)
from services.auth_service import hash_password
from models.auth import UserRole, UserStatus, SubscriptionPlan, PLAN_LIMITS



async def seed_auth_data():
    db = get_db()
    print("[SEED] Starting EcoBuild AI Auth & Multi-Tenant Seed...")

    # 1. Organizations
    orgs = [
        {
            "organization_id": "ORG-ALPHA",
            "name": "Studio Green Arch",
            "owner_id": "USR-ARCH-001",
            "email": "architect@ecobuild.ai",
            "plan": SubscriptionPlan.PROFESSIONAL,
            "status": UserStatus.ACTIVE,
            "created_at": datetime.utcnow() - timedelta(days=60),
        },
        {
            "organization_id": "ORG-BETA",
            "name": "Verma Eco Infra",
            "owner_id": "USR-ARCH-002",
            "email": "builder@ecobuild.ai",
            "plan": SubscriptionPlan.BASIC,
            "status": UserStatus.ACTIVE,
            "created_at": datetime.utcnow() - timedelta(days=30),
        }
    ]

    for org in orgs:
        await db[ORGANIZATIONS_COLLECTION].update_one(
            {"organization_id": org["organization_id"]},
            {"$set": org},
            upsert=True
        )
    print("[OK] Organizations seeded (ORG-ALPHA, ORG-BETA)")

    # 2. Users

    users = [
        # SUPER ADMIN
        {
            "user_id": "USR-ADMIN-001",
            "email": "admin@ecobuild.ai",
            "password_hash": hash_password("Admin@12345"),
            "name": "Platform Super Admin",
            "role": UserRole.SUPER_ADMIN,
            "phone": "+91 98765 00001",
            "organization_id": None,
            "company_name": "EcoBuild AI Platform",
            "plan": "Platform Master",
            "status": UserStatus.ACTIVE,
            "assigned_project_ids": [],
            "created_at": datetime.utcnow() - timedelta(days=90),
        },
        # ARCHITECT A
        {
            "user_id": "USR-ARCH-001",
            "email": "architect@ecobuild.ai",
            "password_hash": hash_password("Architect@12345"),
            "name": "Ar. Priya Sharma",
            "role": UserRole.ARCHITECT,
            "phone": "+91 98450 11223",
            "organization_id": "ORG-ALPHA",
            "company_name": "Studio Green Arch",
            "plan": SubscriptionPlan.PROFESSIONAL,
            "status": UserStatus.ACTIVE,
            "assigned_project_ids": ["PRJ-2026-7DBA", "PRJ-2026-A64C"],
            "created_at": datetime.utcnow() - timedelta(days=60),
        },
        # ARCHITECT B
        {
            "user_id": "USR-ARCH-002",
            "email": "builder@ecobuild.ai",
            "password_hash": hash_password("Builder@12345"),
            "name": "Eng. Rajesh Verma",
            "role": UserRole.ARCHITECT,
            "phone": "+91 98110 33445",
            "organization_id": "ORG-BETA",
            "company_name": "Verma Eco Infra",
            "plan": SubscriptionPlan.BASIC,
            "status": UserStatus.ACTIVE,
            "assigned_project_ids": ["PRJ-2026-AB66"],
            "created_at": datetime.utcnow() - timedelta(days=30),
        },
        # CUSTOMER A (Assigned to PRJ-2026-7DBA in ORG-ALPHA)
        {
            "user_id": "USR-CUST-001",
            "email": "customer@ecobuild.ai",
            "password_hash": hash_password("Customer@12345"),
            "name": "Amit Kapoor",
            "role": UserRole.CUSTOMER,
            "phone": "+91 97123 45678",
            "organization_id": "ORG-ALPHA",
            "company_name": None,
            "plan": None,
            "status": UserStatus.ACTIVE,
            "assigned_project_ids": ["PRJ-2026-7DBA"],
            "created_at": datetime.utcnow() - timedelta(days=45),
        },
        # CUSTOMER B (Assigned to PRJ-2026-AB66 in ORG-BETA)
        {
            "user_id": "USR-CUST-002",
            "email": "client.b@ecobuild.ai",
            "password_hash": hash_password("Customer@12345"),
            "name": "Suresh Mehta",
            "role": UserRole.CUSTOMER,
            "phone": "+91 98222 55667",
            "organization_id": "ORG-BETA",
            "company_name": None,
            "plan": None,
            "status": UserStatus.ACTIVE,
            "assigned_project_ids": ["PRJ-2026-AB66"],
            "created_at": datetime.utcnow() - timedelta(days=20),
        }
    ]

    for u in users:
        await db[USERS_COLLECTION].update_one(
            {"email": u["email"]},
            {"$set": u},
            upsert=True
        )
    print("[OK] Users seeded (Super Admin, Architect A & B, Customer A & B)")

    # 3. Subscriptions
    subs = [
        {
            "subscription_id": "SUB-ALPHA-01",
            "organization_id": "ORG-ALPHA",
            "plan": SubscriptionPlan.PROFESSIONAL,
            "status": "active",
            "start_date": datetime.utcnow() - timedelta(days=60),
            "end_date": datetime.utcnow() + timedelta(days=305),
            "usage_limits": PLAN_LIMITS[SubscriptionPlan.PROFESSIONAL],
            "current_usage": {
                "projects_count": 2,
                "predictions_count": 14,
                "cost_analyses": 14,
                "carbon_analyses": 14
            }
        },
        {
            "subscription_id": "SUB-BETA-01",
            "organization_id": "ORG-BETA",
            "plan": SubscriptionPlan.BASIC,
            "status": "active",
            "start_date": datetime.utcnow() - timedelta(days=30),
            "end_date": datetime.utcnow() + timedelta(days=335),
            "usage_limits": PLAN_LIMITS[SubscriptionPlan.BASIC],
            "current_usage": {
                "projects_count": 1,
                "predictions_count": 5,
                "cost_analyses": 5,
                "carbon_analyses": 5
            }
        }
    ]

    for sub in subs:
        await db[SUBSCRIPTIONS_COLLECTION].update_one(
            {"subscription_id": sub["subscription_id"]},
            {"$set": sub},
            upsert=True
        )
    print("[OK] Subscriptions seeded (ORG-ALPHA, ORG-BETA)")

    # 4. Link Existing Projects with Tenants & Customers
    # Assign PRJ-2026-7DBA to ORG-ALPHA and Customer A
    await db[PROJECTS_COLLECTION].update_one(
        {"project_id": "PRJ-2026-7DBA"},
        {"$set": {
            "organization_id": "ORG-ALPHA",
            "created_by": "USR-ARCH-001",
            "customer_id": "USR-CUST-001",
            "customer_email": "customer@ecobuild.ai",
            "customer_name": "Amit Kapoor",
            "architect_name": "Ar. Priya Sharma"
        }}
    )

    # Assign PRJ-2026-A64C to ORG-ALPHA
    await db[PROJECTS_COLLECTION].update_one(
        {"project_id": "PRJ-2026-A64C"},
        {"$set": {
            "organization_id": "ORG-ALPHA",
            "created_by": "USR-ARCH-001",
            "architect_name": "Ar. Priya Sharma"
        }}
    )

    # Assign PRJ-2026-AB66 to ORG-BETA and Customer B
    await db[PROJECTS_COLLECTION].update_one(
        {"project_id": "PRJ-2026-AB66"},
        {"$set": {
            "organization_id": "ORG-BETA",
            "created_by": "USR-ARCH-002",
            "customer_id": "USR-CUST-002",
            "customer_email": "client.b@ecobuild.ai",
            "customer_name": "Suresh Mehta",
            "architect_name": "Eng. Rajesh Verma"
        }}
    )
    print("[OK] Existing projects updated with multi-tenant and customer ownership")

    # 5. Usage Records (for tracking SaaS platform usage)
    usage_samples = [
        {
            "record_id": "USG-001",
            "organization_id": "ORG-ALPHA",
            "user_id": "USR-ARCH-001",
            "action": "material_prediction",
            "project_id": "PRJ-2026-7DBA",
            "timestamp": datetime.utcnow() - timedelta(days=2)
        },
        {
            "record_id": "USG-002",
            "organization_id": "ORG-ALPHA",
            "user_id": "USR-ARCH-001",
            "action": "carbon_analysis",
            "project_id": "PRJ-2026-7DBA",
            "timestamp": datetime.utcnow() - timedelta(days=2)
        },
        {
            "record_id": "USG-003",
            "organization_id": "ORG-ALPHA",
            "user_id": "USR-ARCH-001",
            "action": "sustainability_scoring",
            "project_id": "PRJ-2026-7DBA",
            "timestamp": datetime.utcnow() - timedelta(days=1)
        },
        {
            "record_id": "USG-004",
            "organization_id": "ORG-BETA",
            "user_id": "USR-ARCH-002",
            "action": "material_prediction",
            "project_id": "PRJ-2026-AB66",
            "timestamp": datetime.utcnow() - timedelta(days=5)
        }
    ]

    for u in usage_samples:
        await db[USAGE_RECORDS_COLLECTION].update_one(
            {"record_id": u["record_id"]},
            {"$set": u},
            upsert=True
        )
    print("[OK] Usage records seeded")
    print("[DONE] EcoBuild AI Auth & Multi-Tenant Seed Complete!")



if __name__ == "__main__":
    asyncio.run(seed_auth_data())
