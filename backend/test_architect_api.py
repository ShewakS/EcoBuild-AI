"""
Test Script for Architect / Builder API Endpoints (Phases 1-13)
Verifies project CRUD, waste calculation, safe reuse rules, 11-stage progress, and analytics.
"""
import asyncio
import httpx

BASE_URL = "http://localhost:8000"

async def test_workflow():
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        # 1. Health check
        res = await client.get("/health")
        print("Health check:", res.status_code, res.json())
        assert res.status_code == 200

        # 2. Seeded reuse rules
        res = await client.get("/api/recommendations/reuse/rules")
        print("Reuse rules count:", len(res.json()))
        assert len(res.json()) >= 5

        # 3. Seeded waste thresholds
        res = await client.get("/api/waste/thresholds")
        print("Waste thresholds count:", len(res.json()))
        assert len(res.json()) >= 5

        # 4. Create a Project
        project_payload = {
            "project_name": "Aura Green Residences - Villa 2A",
            "client_name": "Dr. V. Sundaram",
            "location": "Coimbatore, Tamil Nadu",
            "architect_name": "Studio EcoArchi",
            "building_details": {
                "total_built_up_area_sqft": 2800.0,
                "number_of_floors": 2,
                "ground_floor_area_sqft": 1400.0,
                "construction_type": "Framed RCC Structure",
                "wall_material": "AAC Block",
                "roof_type": "RCC Flat",
                "flooring": "Vitrified Tile",
                "finish_quality": "Standard",
                "foundation_type": "Isolated Footing",
                "soil_type": "Clayey Sand",
                "seismic_zone": "Zone III (Moderate)",
                "green_certification_target": "GRIHA 4-Star",
                "solar_panels": True,
                "rainwater_harvesting": True,
            }
        }
        res = await client.post("/api/projects", json=project_payload)
        print("Create project status:", res.status_code)
        assert res.status_code == 200
        proj = res.json()
        project_id = proj["project_id"]
        print("Created Project ID:", project_id)
        assert len(proj["stages"]) == 11

        # 5. Calculate Authentic Waste
        waste_payload = {
            "project_id": project_id,
            "materials": [
                {"material_key": "cement", "quantity": 620, "unit": "Bags", "unit_rate_inr": 420},
                {"material_key": "steel", "quantity": 5.2, "unit": "Tonnes", "unit_rate_inr": 68000},
                {"material_key": "bricks", "quantity": 14500, "unit": "Pieces", "unit_rate_inr": 11},
                {"material_key": "sand", "quantity": 1750, "unit": "Cu.Ft", "unit_rate_inr": 65},
                {"material_key": "aggregate", "quantity": 2200, "unit": "Cu.Ft", "unit_rate_inr": 45}
            ]
        }
        res = await client.post("/api/waste/calculate", json=waste_payload)
        print("Waste calculate status:", res.status_code)
        assert res.status_code == 200
        waste_res = res.json()
        print(f"Total waste loss: Rs. {waste_res['total_financial_loss_inr']}, Avg waste: {waste_res['average_waste_percent']}%, Risk: {waste_res['overall_waste_risk']}")

        # 6. Safe Material Reuse Recommendations
        reuse_payload = {
            "project_id": project_id,
            "materials_present": ["Bricks", "Steel", "Aggregate", "Sand"]
        }
        res = await client.post("/api/recommendations/reuse", json=reuse_payload)
        print("Reuse recommendations count:", res.json()["total_recommendations"])
        assert res.json()["total_recommendations"] >= 4

        # 7. Update Stage 2 progress
        res = await client.put(f"/api/progress/projects/{project_id}/stages/2", json={
            "progress_percent": 85.0,
            "notes": "Earthwork excavation 85% completed, boundary trenches dug."
        })
        print("Update stage 2 status:", res.status_code)
        assert res.status_code == 200

        # 8. Add Progress Log
        log_payload = {
            "project_id": project_id,
            "stage_id": 2,
            "progress_percent": 85.0,
            "status": "in_progress",
            "log_notes": "Benchmark leveling completed. Soil bearing pressure confirmed.",
            "recorded_by": "Chief Structural Inspector"
        }
        res = await client.post("/api/progress/log", json=log_payload)
        print("Add log status:", res.status_code)
        assert res.status_code == 200

        # 9. Get Project Analytics
        res = await client.get(f"/api/projects/{project_id}/analytics")
        print("Analytics status:", res.status_code)
        assert res.status_code == 200

        # 10. Test Minimal 4-Field Project Creation
        min_payload = {
            "project_name": "Minimal Test Project",
            "client_name": "R. Vignesh",
            "location": "Madurai",
            "architect_name": "Ar. Saravanan"
        }
        res = await client.post("/api/projects", json=min_payload)
        print("Minimal project creation status:", res.status_code)
        assert res.status_code == 200
        min_proj = res.json()
        assert min_proj["project_name"] == "Minimal Test Project"
        assert min_proj["building_details"]["wall_material"] == "Brick"

        # 11. Test Project Deletion
        del_res = await client.delete(f"/api/projects/{min_proj['project_id']}")
        print("Delete project status:", del_res.status_code)
        assert del_res.status_code == 200

        print("\nAll Architect backend workflow steps verified successfully!")

if __name__ == "__main__":
    asyncio.run(test_workflow())
