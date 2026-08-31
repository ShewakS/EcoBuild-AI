"""
Rate Service — queries MongoDB rate_master collection.

Strategy:
  "Current rate" for (item_name, district) = the document with the latest
  effective_date that matches either:
    1. (item_name, district)  — district-specific architect override
    2. (item_name, "default") — system fallback

  Rule: if a district-specific entry exists, it wins over "default".
"""
from datetime import datetime
from typing import Optional
from config import get_db, RATE_MASTER_COLLECTION


async def get_current_rates(district: str) -> list[dict]:
    """
    Returns one rate dict per item_name, preferring district-specific rates
    over defaults. Each dict has: item_name, category, unit, rate_value,
    district, effective_date, updated_by, is_default.
    """
    db = get_db()
    col = db[RATE_MASTER_COLLECTION]

    # Aggregate: get latest effective_date per (item_name, district) for the
    # two relevant districts ["district", "default"], then pick district > default.
    pipeline = [
        # Only look at rows relevant to this district or "default"
        {"$match": {"district": {"$in": [district, "default"]}}},
        # Sort by effective_date desc so first-seen is latest
        {"$sort": {"effective_date": -1}},
        # Group by (item_name, district) → keep the latest entry
        {
            "$group": {
                "_id": {"item_name": "$item_name", "district": "$district"},
                "doc": {"$first": "$$ROOT"},
            }
        },
        # Sort so district-specific comes before default for the next group
        {
            "$addFields": {
                "priority": {
                    "$cond": [{"$eq": ["$doc.district", "default"]}, 1, 0]
                }
            }
        },
        {"$sort": {"priority": 1}},
        # Group by item_name → keep the highest-priority (district-specific first)
        {
            "$group": {
                "_id": "$doc.item_name",
                "doc": {"$first": "$doc"},
            }
        },
        {"$replaceRoot": {"newRoot": "$doc"}},
        {"$sort": {"category": 1, "item_name": 1}},
    ]

    cursor = col.aggregate(pipeline)
    results = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    return results


async def get_rate_history(item_name: str, district: str) -> list[dict]:
    """
    Returns the full chronological history for one (item_name, district) pair.
    """
    db = get_db()
    col = db[RATE_MASTER_COLLECTION]

    cursor = col.find(
        {"item_name": item_name, "district": district},
        sort=[("effective_date", -1)],
    )
    results = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    return results


async def insert_rates(rate_docs: list[dict]) -> list[str]:
    """
    Inserts a list of rate documents (already prepared dicts with effective_date).
    Returns the list of inserted _ids as strings.
    """
    db = get_db()
    col = db[RATE_MASTER_COLLECTION]
    result = await col.insert_many(rate_docs)
    return [str(oid) for oid in result.inserted_ids]


async def get_latest_update_time() -> Optional[datetime]:
    """Returns the most recent effective_date across all rates (for UI display)."""
    db = get_db()
    col = db[RATE_MASTER_COLLECTION]
    doc = await col.find_one({}, sort=[("effective_date", -1)])
    return doc["effective_date"] if doc else None


async def delete_rate(rate_id: str) -> bool:
    """Deletes a rate entry by MongoDB _id or item_name."""
    from bson import ObjectId
    db = get_db()
    col = db[RATE_MASTER_COLLECTION]
    try:
        oid = ObjectId(rate_id)
        result = await col.delete_one({"_id": oid})
        if result.deleted_count > 0:
            return True
    except Exception:
        pass
    result = await col.delete_many({"item_name": rate_id})
    return result.deleted_count > 0

