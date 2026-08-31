"""
Rate Master routes:
  GET  /api/rates              — current active rate per item for a district
  GET  /api/rates/history      — full rate history for one item/district pair
  POST /api/rates              — submit new rate(s) — versioned insert only
  DELETE is not allowed per design spec (auditability preserved)
"""
from fastapi import APIRouter, HTTPException, Query
from datetime import datetime, timezone
from models.rate_master import RatesPostRequest, RatesPostResponse
from services.rate_service import (
    get_current_rates,
    get_rate_history,
    insert_rates,
    get_latest_update_time,
    delete_rate,
)

router = APIRouter(prefix="/api/rates", tags=["Rate Master"])


@router.get(
    "",
    summary="Get current active rates for a district",
    description=(
        "Returns one rate per cost item. For each item, returns the district-specific "
        "architect override if one exists, otherwise the 'default' system rate. "
        "Pass district=default to get only the baseline rates."
    ),
    response_model=list[dict],
)
async def get_rates(district: str = Query(default="default", description="Tamil Nadu district name")):
    rates = await get_current_rates(district)
    if not rates:
        raise HTTPException(
            status_code=404,
            detail=f"No rates found. Run the seed script first: python seed/default_rates.py",
        )
    return rates


@router.get(
    "/history",
    summary="Get full rate history for one item",
    description=(
        "Returns all versioned rate entries for a specific item and district, "
        "sorted by effective_date descending (newest first). "
        "Useful for audit trails and trend analysis."
    ),
    response_model=list[dict],
)
async def get_history(
    item: str = Query(..., description="Exact item_name, e.g. 'Cement (Portland OPC 53)'"),
    district: str = Query(default="default", description="District name or 'default'"),
):
    history = await get_rate_history(item, district)
    return history


@router.post(
    "",
    response_model=RatesPostResponse,
    summary="Submit new rate(s) — versioned insert",
    description=(
        "Inserts one or more new rate entries. Each entry is timestamped with the "
        "current UTC time as its effective_date. Old entries are NEVER overwritten — "
        "this preserves full audit history. The new entry immediately becomes the "
        "'current rate' for its item/district pair."
    ),
)
async def post_rates(body: RatesPostRequest):
    if not body.rates:
        raise HTTPException(status_code=400, detail="At least one rate entry is required.")

    now = datetime.now(timezone.utc)
    docs = []
    for entry in body.rates:
        doc = entry.model_dump()
        doc["effective_date"] = now
        docs.append(doc)

    inserted_ids = await insert_rates(docs)
    return RatesPostResponse(inserted_count=len(inserted_ids), inserted_ids=inserted_ids)


@router.delete(
    "/{rate_id}",
    summary="Delete a rate entry",
    description="Deletes a rate entry from the rate master collection by ID or item name.",
)
async def remove_rate(rate_id: str):
    success = await delete_rate(rate_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Rate with ID '{rate_id}' not found.")
    return {"status": "deleted", "rate_id": rate_id}


@router.get(
    "/latest-update",
    summary="Get timestamp of most recent rate entry",
    description="Returns the effective_date of the most recently inserted rate entry.",
)
async def get_latest_rate_update():
    ts = await get_latest_update_time()
    return {"latest_update": ts}

