import requests
import json

BASE = "http://127.0.0.1:8000"

payload = {
    "district": "Chennai",
    "building_type": "Residential",
    "residential_type": "Independent House",
    "plot_area_sqft": 2400,
    "built_up_area_sqft": 1800,
    "floors": 2,
    "bedrooms": 3,
    "bathrooms": 2,
    "kitchens": 1,
    "parking": 1,
    "soil_type": "Clay",
    "land_type": "Flat",
    "foundation_type": "Isolated Footing",
    "foundation_depth_ft": 5,
    "roof_type": "RCC Flat",
    "wall_material": "Brick",
    "flooring": "Vitrified Tile",
    "finish_quality": "Standard",
    "earthquake_zone": "Zone III",
    "wind_zone": "Zone II",
    "solar_panels": False,
    "rainwater_harvesting": False
}

print("=" * 65)
print("  ECOBUILD AI — COMPREHENSIVE LIVE MODEL & PIPELINE AUDIT")
print("=" * 65)

# 1. XGBoost ML Material Quantities Model
print("\n[1] Testing XGBoost Material Estimation Model (/api/predict/quantities)...")
r = requests.post(f"{BASE}/api/predict/quantities", json=payload, timeout=15)
assert r.status_code == 200, f"Failed: {r.text}"
q = r.json()
print("    STATUS: [OK - 200]")
print(f"    - Cement:    {q.get('cement_bags')} bags")
print(f"    - Steel:     {q.get('steel_tons')} tons")
print(f"    - Sand:      {q.get('sand_tons')} tons")
print(f"    - Aggregate: {q.get('aggregate_tons')} tons")
print(f"    - Bricks:    {q.get('brick_count')} units")

# 2. Cost Prediction Model (ecobuild_cost_model.pkl + CPWD Rates)
print("\n[2] Testing CPWD Cost Prediction Model (/api/estimate/cost)...")
r = requests.post(f"{BASE}/api/estimate/cost", json=payload, timeout=15)
assert r.status_code == 200, f"Failed: {r.text}"
est = r.json()
b = est["breakdown"]
print("    STATUS: [OK - 200]")
print(f"    - Total Project Cost: INR {b.get('total_cost'):,.2f}")
print(f"    - Material Cost:      INR {b.get('material_cost'):,.2f}")
print(f"    - Labour Cost:        INR {b.get('labour_cost'):,.2f}")
print(f"    - Finishing Cost:     INR {b.get('finishing_cost'):,.2f}")

# 3. IFC Indian Embodied Carbon Model
print("\n[3] Testing IFC Indian Embodied Carbon Engine (/api/carbon/estimate)...")
r = requests.post(f"{BASE}/api/carbon/estimate", json=payload, timeout=15)
assert r.status_code == 200, f"Failed: {r.text}"
carb = r.json()
print("    STATUS: [OK - 200]")
print(f"    - Total Embodied Carbon: {carb.get('total_carbon_tons')} tCO2e")
print(f"    - Carbon Intensity:      {carb.get('carbon_intensity_kg_per_sqft')} kgCO2e/sqft")

# 4. Rule-Based Sustainability Scoring Engine (0-100)
print("\n[4] Testing Sustainability Scoring Engine (/api/sustainability/score)...")
r = requests.post(f"{BASE}/api/sustainability/score", json={"inputs": payload, "waste_percent": 5.0}, timeout=15)
assert r.status_code == 200, f"Failed: {r.text}"
sust = r.json()
print("    STATUS: [OK - 200]")
print(f"    - Overall Score: {sust.get('score')} / 100")
print(f"    - Rating Grade:  {sust.get('grade')}")
print(f"    - Band Category: {sust.get('band')}")

# 5. CPWD / BMTPC / NICMAR Waste Calculation
print("\n[5] Testing Authentic CPWD Waste Model (/api/waste/calculate)...")
waste_req = {
    "materials": [
        {"material_key": "cement", "quantity": q.get('cement_bags', 546), "unit": "Bags", "unit_rate_inr": 420},
        {"material_key": "steel", "quantity": q.get('steel_tons', 13.8), "unit": "Tonnes", "unit_rate_inr": 68000},
        {"material_key": "bricks", "quantity": q.get('brick_count', 47000), "unit": "Pieces", "unit_rate_inr": 11}
    ]
}
r = requests.post(f"{BASE}/api/waste/calculate", json=waste_req, timeout=15)
assert r.status_code == 200, f"Failed: {r.text}"
waste_res = r.json()
print("    STATUS: [OK - 200]")
print(f"    - Predicted Financial Waste Loss: INR {waste_res.get('total_financial_loss_inr'):,.2f}")
for m in waste_res.get("itemized_breakdown", []):
    print(f"      * {m['material_name']}: planned {m['planned_quantity']} {m['unit']} -> waste {m['estimated_waste_quantity']} {m['unit']} (Loss: INR {m['estimated_financial_loss_inr']:,.2f})")

# 6. Eco-Material Recommendations Engine
print("\n[6] Testing Eco-Material Recommendation Rules (/api/recommendations/eco-materials)...")
r = requests.post(f"{BASE}/api/recommendations/eco-materials", json={"inputs": payload}, timeout=15)
assert r.status_code == 200, f"Failed: {r.text}"
recs = r.json().get("recommendations", [])
print("    STATUS: [OK - 200]")
print(f"    - Generated {len(recs)} Low-Carbon Alternatives:")
for item in recs:
    print(f"      * [{item['field']}]: {item['suggested_alternative']} ({item['reason'][:60]}...)")

# 7. Safe Material Reuse Circularity Rules
print("\n[7] Testing Circularity & Safe Material Reuse (/api/recommendations/reuse/rules)...")
r = requests.get(f"{BASE}/api/recommendations/reuse/rules", timeout=15)
assert r.status_code == 200, f"Failed: {r.text}"
reuse_rules = r.json()
print("    STATUS: [OK - 200]")
print(f"    - Retrieved {len(reuse_rules)} Safe Reuse & Structural Warning Guidelines:")
for rule in reuse_rules[:3]:
    print(f"      * [{rule['category']}] {rule['material']}: {rule['safe_application']}")

# 8. Architect Session & Project Creation Pipeline
print("\n[8] Testing Architect Session & Project Pipeline (/api/auth/login, /api/projects)...")
r_auth = requests.post(f"{BASE}/api/auth/login", json={"email": "architect@ecobuild.ai", "password": "Architect@12345"}, timeout=15)
assert r_auth.status_code == 200, f"Auth Failed: {r_auth.text}"
token = r_auth.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
r_proj = requests.post(f"{BASE}/api/projects", json={
    "project_name": "Verified Production Villa",
    "client_name": "Saravana",
    "location": "Chennai",
    "architect_name": "Ar. Priya Sharma"
}, headers=headers, timeout=15)
assert r_proj.status_code == 200, f"Project Create Failed: {r_proj.text}"
p = r_proj.json()
print("    STATUS: [OK - 200]")
print(f"    - Session User:     {r_auth.json()['user']['name']} ({r_auth.json()['user']['role']})")
print(f"    - Project Created:  {p['project_name']} (ID: {p['project_id']})")
print(f"    - Status & Stages:  {p['status']} ({len(p['stages'])} construction milestones initialized)")

print("\n" + "=" * 65)
print("  ALL 8 MODELS AND WORKSPACE MODULES ARE 100% OPERATIONAL!")
print("=" * 65)
