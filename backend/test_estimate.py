import requests

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

resp = requests.post("http://localhost:8000/api/estimate/cost", json=payload, timeout=30)
print("Status:", resp.status_code)
if resp.status_code == 200:
    data = resp.json()
    print("SUCCESS!")
    print("  Total Cost:    ", data["breakdown"]["total_cost"])
    print("  Cement bags:   ", data["quantities"]["ml"]["cement_bags"])
    print("  Steel tons:    ", data["quantities"]["ml"]["steel_tons"])
    print("  Sand tons:     ", data["quantities"]["ml"]["sand_tons"])
    print("  Bricks:        ", data["quantities"]["ml"]["brick_count"])
    print("  Carbon (tCO2): ", data["carbon_footprint"]["total_carbon_tons"])
    print("  Sust. Score:   ", data["sustainability_score"]["total_score"])
else:
    print("ERROR:", resp.text[:800])
