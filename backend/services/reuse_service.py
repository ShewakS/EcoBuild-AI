"""
Reuse Service — EcoBuild AI
Handles safe material reuse rules and project-specific reuse recommendation generation.
"""
from typing import List, Dict, Any, Optional
from config import get_db, REUSE_RULES_COLLECTION
from seed.reuse_rules import DEFAULT_REUSE_RULES
from models.reuse import ReuseRuleItem, ReuseRecommendationResponse


SAFETY_PRINCIPLES = [
    "STRUCTURAL INTEGRITY FIRST: Never use reclaimed or offcut steel bars in primary load-bearing RCC elements (columns, main roof beams, cantilevers).",
    "POZZOLANIC AND AGGREGATE PURITY: Recycled aggregate and brickbats must be completely free from gypsum plaster, organic topsoil, wood fragments, and chemical salts.",
    "WATERPROOFING VERIFICATION: Brickbat coba and drainage soak pits must always be sealed with polymer-modified cement slurry and tested with 72-hour ponding tests.",
    "WORKER HEALTH & SAFETY: All decommissioned timber and ply formwork must have nails removed immediately upon stripping to prevent puncture injuries."
]


async def ensure_reuse_rules_seeded():
    db = get_db()
    collection = db[REUSE_RULES_COLLECTION]
    count = await collection.count_documents({})
    if count == 0:
        await collection.insert_many([dict(item) for item in DEFAULT_REUSE_RULES])


async def get_all_reuse_rules() -> List[Dict[str, Any]]:
    db = get_db()
    collection = db[REUSE_RULES_COLLECTION]
    cursor = collection.find({}, {"_id": 0})
    rules = await cursor.to_list(length=100)
    if not rules:
        return DEFAULT_REUSE_RULES
    return rules


async def get_recommendations_for_project(materials_present: Optional[List[str]] = None) -> ReuseRecommendationResponse:
    rules = await get_all_reuse_rules()
    
    if not materials_present:
        selected_rules = rules
    else:
        norm_materials = [m.lower() for m in materials_present]
        selected_rules = []
        for r in rules:
            mat_text = (r.get("material", "") + " " + r.get("category", "")).lower()
            if any(m in mat_text for m in norm_materials):
                selected_rules.append(r)
        if not selected_rules:
            selected_rules = rules  # Return all if none matched

    rule_items = [ReuseRuleItem(**r) for r in selected_rules]
    return ReuseRecommendationResponse(
        total_recommendations=len(rule_items),
        recommendations=rule_items,
        crucial_safety_principles=SAFETY_PRINCIPLES,
    )
