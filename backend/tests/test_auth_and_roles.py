import asyncio
import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from httpx import AsyncClient, ASGITransport
from main import app


async def run_tests():
    print("================================================================")
    print("EcoBuild AI — Security, JWT & Multi-Tenant Authorization Tests")
    print("================================================================")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 1. Invalid Login
        res = await client.post("/api/auth/login", json={"email": "fake@ecobuild.ai", "password": "WrongPassword"})
        assert res.status_code == 401, f"Expected 401 for invalid login, got {res.status_code}"
        print("[PASS] Test 1: Invalid login rejected with 401 Unauthorized")

        # 2. Super Admin Login
        res = await client.post("/api/auth/login", json={"email": "admin@ecobuild.ai", "password": "Admin@12345"})
        assert res.status_code == 200, f"Super Admin login failed: {res.text}"
        admin_data = res.json()
        admin_token = admin_data["access_token"]
        assert admin_data["user"]["role"] == "SUPER_ADMIN"
        print(f"[PASS] Test 2: Super Admin login succeeded (role={admin_data['user']['role']})")

        # 3. Architect A Login
        res = await client.post("/api/auth/login", json={"email": "architect@ecobuild.ai", "password": "Architect@12345"})
        assert res.status_code == 200, f"Architect A login failed: {res.text}"
        arch_a_data = res.json()
        arch_a_token = arch_a_data["access_token"]
        assert arch_a_data["user"]["role"] == "ARCHITECT"
        assert arch_a_data["user"]["organization_id"] == "ORG-ALPHA"
        print(f"[PASS] Test 3: Architect A login succeeded (org={arch_a_data['user']['organization_id']})")

        # 4. Architect B Login
        res = await client.post("/api/auth/login", json={"email": "builder@ecobuild.ai", "password": "Builder@12345"})
        assert res.status_code == 200, f"Architect B login failed: {res.text}"
        arch_b_data = res.json()
        arch_b_token = arch_b_data["access_token"]
        assert arch_b_data["user"]["role"] == "ARCHITECT"
        assert arch_b_data["user"]["organization_id"] == "ORG-BETA"
        print(f"[PASS] Test 4: Architect B login succeeded (org={arch_b_data['user']['organization_id']})")

        # 5. Customer A Login
        res = await client.post("/api/auth/login", json={"email": "customer@ecobuild.ai", "password": "Customer@12345"})
        assert res.status_code == 200, f"Customer A login failed: {res.text}"
        cust_a_data = res.json()
        cust_a_token = cust_a_data["access_token"]
        assert cust_a_data["user"]["role"] == "CUSTOMER"
        print(f"[PASS] Test 5: Customer A login succeeded (role={cust_a_data['user']['role']})")

        # 6. Role Authorization: Customer attempting Super Admin endpoint -> 403
        res = await client.get("/api/admin/dashboard", headers={"Authorization": f"Bearer {cust_a_token}"})
        assert res.status_code == 403, f"Expected 403 for Customer accessing admin dashboard, got {res.status_code}"
        print("[PASS] Test 6: Customer access to /api/admin/dashboard correctly rejected with 403 Forbidden")

        # 7. Role Authorization: Architect attempting Super Admin endpoint -> 403
        res = await client.get("/api/admin/dashboard", headers={"Authorization": f"Bearer {arch_a_token}"})
        assert res.status_code == 403, f"Expected 403 for Architect accessing admin dashboard, got {res.status_code}"
        print("[PASS] Test 7: Architect access to /api/admin/dashboard correctly rejected with 403 Forbidden")

        # 8. Super Admin accessing admin dashboard -> 200
        res = await client.get("/api/admin/dashboard", headers={"Authorization": f"Bearer {admin_token}"})
        assert res.status_code == 200, f"Super Admin dashboard failed: {res.text}"
        admin_metrics = res.json()
        assert "overview" in admin_metrics
        assert "plans_distribution" in admin_metrics
        print(f"[PASS] Test 8: Super Admin dashboard metrics loaded (total architects: {admin_metrics['overview']['total_architects']})")

        # 9. Multi-Tenant Project Isolation: Architect A accessing own project (PRJ-2026-7DBA) -> 200
        res = await client.get("/api/projects/PRJ-2026-7DBA", headers={"Authorization": f"Bearer {arch_a_token}"})
        assert res.status_code == 200, f"Architect A failed to access own project: {res.text}"
        print("[PASS] Test 9: Architect A access to own project (PRJ-2026-7DBA) allowed (200 OK)")

        # 10. Multi-Tenant Project Isolation: Architect A accessing Architect B's project (PRJ-2026-AB66) -> 403
        res = await client.get("/api/projects/PRJ-2026-AB66", headers={"Authorization": f"Bearer {arch_a_token}"})
        assert res.status_code == 403, f"Expected 403 for cross-organization access, got {res.status_code}"
        print("[PASS] Test 10: Architect A accessing Architect B's project (PRJ-2026-AB66) blocked (403 Forbidden)")

        # 11. Customer Access Control: Customer A accessing assigned project (PRJ-2026-7DBA) -> 200
        res = await client.get("/api/customer/projects/PRJ-2026-7DBA", headers={"Authorization": f"Bearer {cust_a_token}"})
        assert res.status_code == 200, f"Customer A access failed: {res.text}"
        print("[PASS] Test 11: Customer A access to assigned project (PRJ-2026-7DBA) allowed (200 OK)")

        # 12. Customer Isolation: Customer A accessing unassigned project (PRJ-2026-AB66) -> 403
        res = await client.get("/api/customer/projects/PRJ-2026-AB66", headers={"Authorization": f"Bearer {cust_a_token}"})
        assert res.status_code == 403, f"Expected 403 for unassigned project, got {res.status_code}"
        print("[PASS] Test 12: Customer A accessing Customer B's project (PRJ-2026-AB66) blocked (403 Forbidden)")

        # 13. Customer Read-Only Endpoints: Materials, Cost, Carbon, Progress
        res = await client.get("/api/customer/projects/PRJ-2026-7DBA/materials", headers={"Authorization": f"Bearer {cust_a_token}"})
        assert res.status_code == 200
        res = await client.get("/api/customer/projects/PRJ-2026-7DBA/cost", headers={"Authorization": f"Bearer {cust_a_token}"})
        assert res.status_code == 200
        res = await client.get("/api/customer/projects/PRJ-2026-7DBA/carbon", headers={"Authorization": f"Bearer {cust_a_token}"})
        assert res.status_code == 200
        res = await client.get("/api/customer/projects/PRJ-2026-7DBA/progress", headers={"Authorization": f"Bearer {cust_a_token}"})
        assert res.status_code == 200
        print("[PASS] Test 13: Customer read-only calculation views verified (Materials, Cost, Carbon, Progress)")

        # 14. Super Admin Platform Oversight: List all architects, projects, subscriptions
        res = await client.get("/api/admin/architects", headers={"Authorization": f"Bearer {admin_token}"})
        assert res.status_code == 200
        res = await client.get("/api/admin/projects", headers={"Authorization": f"Bearer {admin_token}"})
        assert res.status_code == 200
        res = await client.get("/api/admin/subscriptions", headers={"Authorization": f"Bearer {admin_token}"})
        assert res.status_code == 200
        print("[PASS] Test 14: Super Admin platform oversight APIs verified (Architects, Projects, Subscriptions)")

    print("================================================================")
    print("All 14 Security, JWT & Multi-Tenant Tests PASSED Successfully!")
    print("================================================================")


if __name__ == "__main__":
    asyncio.run(run_tests())
