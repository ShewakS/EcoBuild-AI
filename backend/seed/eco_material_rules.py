"""
MongoDB Seed Script: Eco-Material Recommendation Rules.

Seeds initial rules into the `eco_material_rules` collection in MongoDB.
Each rule defines conditions, category, current choice, suggested alternative,
reason text, and an optional estimated_cost_delta_percent.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys
import os

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from config import get_settings, ECO_MATERIAL_RULES_COLLECTION

SEED_RULES = [
    {
        "rule_id": "rule_wall_brick_aac",
        "category": "Wall Masonry",
        "field": "wall_material",
        "condition_operator": "==",
        "condition_value": "Brick",
        "secondary_condition": None,
        "current_choice_display": "Traditional Clay Brick",
        "suggested_alternative": "AAC Block",
        "reason": "Lower embodied carbon and faster construction; similar cost range to standard brick",
        "estimated_cost_delta_percent": -2.0,
        "apply_field_update": {"wall_material": "AAC Block"},
    },
    {
        "rule_id": "rule_wall_brick_flyash",
        "category": "Wall Masonry",
        "field": "wall_material",
        "condition_operator": "==",
        "condition_value": "Brick",
        "secondary_condition": None,
        "current_choice_display": "Traditional Clay Brick",
        "suggested_alternative": "Fly Ash Brick",
        "reason": "Uses industrial waste material, reduces landfill burden, comparable structural performance",
        "estimated_cost_delta_percent": -5.0,
        "apply_field_update": {"wall_material": "Fly Ash Brick"},
    },
    {
        "rule_id": "rule_roof_cool_coating",
        "category": "Roofing & Thermal Shield",
        "field": "roof_type",
        "condition_operator": "in",
        "condition_value": ["RCC", "RCC Flat"],
        "secondary_condition": {
            "field": "finish_quality",
            "operator": "!=",
            "value": "Basic",
        },
        "current_choice_display": "Standard RCC Flat Slab",
        "suggested_alternative": "Cool roof coating / reflective waterproofing",
        "reason": "Reduces heat gain and cooling energy demand, low added cost relative to total roofing spend",
        "estimated_cost_delta_percent": 1.5,
        "apply_field_update": {"roof_treatment": "Cool Roof Reflective Coating"},
    },
    {
        "rule_id": "rule_flooring_vitrified",
        "category": "Flooring & Paving",
        "field": "flooring",
        "condition_operator": "in",
        "condition_value": ["Marble", "Granite"],
        "secondary_condition": None,
        "current_choice_display": "Natural Stone (Marble / Granite)",
        "suggested_alternative": "Vitrified Tile",
        "reason": "Significantly lower extraction/quarrying impact, similar aesthetic options available, typically lower cost per sqft",
        "estimated_cost_delta_percent": -12.0,
        "apply_field_update": {"flooring": "Vitrified Tile"},
    },
    {
        "rule_id": "rule_solar_provision",
        "category": "Renewable Clean Energy",
        "field": "solar_panels",
        "condition_operator": "in",
        "condition_value": [False, "No", "no", None],
        "secondary_condition": {
            "field": "finish_quality",
            "operator": "in",
            "value": ["Premium", "Luxury"],
        },
        "current_choice_display": "No Solar Panels",
        "suggested_alternative": "Add rooftop solar provision",
        "reason": "Project scale supports the upfront cost; meaningfully improves long-term carbon footprint and sustainability score",
        "estimated_cost_delta_percent": None,  # Confident estimate depends on inverter/panel kW sizing
        "apply_field_update": {"solar_panels": True},
    },
    {
        "rule_id": "rule_rainwater_harvesting",
        "category": "Water Resource Management",
        "field": "rainwater_harvesting",
        "condition_operator": "in",
        "condition_value": [False, "No", "no", None],
        "secondary_condition": None,
        "current_choice_display": "No Rainwater Harvesting",
        "suggested_alternative": "Add rainwater harvesting",
        "reason": "Often mandated by local urban body regulations in Tamil Nadu; low-cost addition relative to total project cost",
        "estimated_cost_delta_percent": None,  # Varies by percolation pit vs storage sump volume
        "apply_field_update": {"rainwater_harvesting": True},
    },
]


async def seed_eco_rules():
    settings = get_settings()
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.DB_NAME]
    col = db[ECO_MATERIAL_RULES_COLLECTION]

    for rule in SEED_RULES:
        await col.update_one(
            {"rule_id": rule["rule_id"]},
            {"$set": rule},
            upsert=True,
        )
    count = await col.count_documents({})
    print(f"[SUCCESS] Successfully seeded {count} rules into '{ECO_MATERIAL_RULES_COLLECTION}'.")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_eco_rules())
