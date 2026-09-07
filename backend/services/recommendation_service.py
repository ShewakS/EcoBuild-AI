"""
Eco-Material Recommendation Service — Rule Evaluation Engine.

Rules are stored in MongoDB `eco_material_rules` collection (not hardcoded).
Evaluates project inputs against active rules and returns explainable recommendations.
"""
from typing import Any, Optional
from config import get_db, ECO_MATERIAL_RULES_COLLECTION
from models.sustainability import (
    EcoRecommendationItem,
    EcoRecommendationResponse,
)
from seed.eco_material_rules import SEED_RULES


async def ensure_rules_seeded():
    """Seeds default rules if the collection is empty."""
    db = get_db()
    col = db[ECO_MATERIAL_RULES_COLLECTION]
    count = await col.count_documents({})
    if count == 0:
        for rule in SEED_RULES:
            await col.update_one({"rule_id": rule["rule_id"]}, {"$set": rule}, upsert=True)


def _check_condition(field_value: Any, operator: str, target_value: Any) -> bool:
    """Evaluates a single condition."""
    # Normalize string comparisons
    if isinstance(field_value, str) and isinstance(target_value, str):
        fv = field_value.strip().lower()
        tv = target_value.strip().lower()
    else:
        fv = field_value
        tv = target_value

    if operator == "==":
        if isinstance(fv, str) and isinstance(tv, str):
            return fv == tv
        return field_value == target_value
    elif operator == "!=":
        if isinstance(fv, str) and isinstance(tv, str):
            return fv != tv
        return field_value != target_value
    elif operator == "in":
        if isinstance(target_value, (list, tuple, set)):
            # Check direct or string-lowered
            for item in target_value:
                if str(item).strip().lower() == str(field_value).strip().lower():
                    return True
            return field_value in target_value
        return False
    elif operator == "not_in":
        if isinstance(target_value, (list, tuple, set)):
            for item in target_value:
                if str(item).strip().lower() == str(field_value).strip().lower():
                    return False
            return field_value not in target_value
        return True
    return False


async def get_all_rules() -> list[dict[str, Any]]:
    """Retrieves all active recommendation rules from MongoDB."""
    await ensure_rules_seeded()
    db = get_db()
    col = db[ECO_MATERIAL_RULES_COLLECTION]
    cursor = col.find({})
    rules = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        rules.append(doc)
    return rules


async def evaluate_eco_recommendations(project_inputs: dict[str, Any]) -> EcoRecommendationResponse:
    """
    Evaluates project inputs against MongoDB eco-material rules.
    """
    rules = await get_all_rules()
    recommendations: list[EcoRecommendationItem] = []

    for rule in rules:
        field_name = rule.get("field")
        op = rule.get("condition_operator", "==")
        val = rule.get("condition_value")

        actual_val = project_inputs.get(field_name)

        # Evaluate primary condition
        primary_match = _check_condition(actual_val, op, val)
        if not primary_match:
            continue

        # Evaluate secondary condition if defined
        sec = rule.get("secondary_condition")
        if sec:
            sec_field = sec.get("field")
            sec_op = sec.get("operator", "==")
            sec_val = sec.get("value")
            actual_sec_val = project_inputs.get(sec_field)
            sec_match = _check_condition(actual_sec_val, sec_op, sec_val)
            if not sec_match:
                continue

        # Format current choice display
        curr_display = rule.get("current_choice_display") or str(actual_val)

        rec = EcoRecommendationItem(
            rule_id=rule.get("rule_id", "rule_custom"),
            category=rule.get("category", "General"),
            field=field_name,
            current_choice=curr_display,
            suggested_alternative=rule.get("suggested_alternative", ""),
            reason=rule.get("reason", ""),
            estimated_cost_delta_percent=rule.get("estimated_cost_delta_percent"),
            apply_field_update=rule.get("apply_field_update", {field_name: rule.get("suggested_alternative")}),
        )
        recommendations.append(rec)

    return EcoRecommendationResponse(
        total_recommendations=len(recommendations),
        recommendations=recommendations,
    )
