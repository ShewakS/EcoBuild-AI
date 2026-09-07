"""
Sustainability Score API Routes.

POST /api/sustainability/score — Computes 0-100 sustainability score,
band label, and contributing factor breakdown, persisting to project_estimates.
"""
from fastapi import APIRouter, HTTPException
from bson import ObjectId
from models.sustainability import (
    SustainabilityScoreRequest,
    SustainabilityScoreResponse,
)
from services.sustainability_service import compute_sustainability_score
from config import get_db, PROJECT_ESTIMATES_COLLECTION

router = APIRouter(prefix="/api/sustainability", tags=["Sustainability Score"])


@router.post(
    "/score",
    response_model=SustainabilityScoreResponse,
    summary="Compute 0-100 Sustainability Score with factor breakdown",
    description=(
        "Rule-based weighted point scoring engine: starts at base 50, applies additions "
        "for solar panels (+15), rainwater harvesting (+10), AAC/fly-ash block (+10/+5), "
        "and deductions for waste > 5% and carbon footprint exceeding the 36.0 kgCO2e/sqft baseline."
    ),
)
async def get_sustainability_score(req: SustainabilityScoreRequest) -> SustainabilityScoreResponse:
    # 1. Compute rule-based score
    resp = compute_sustainability_score(
        inputs=req.inputs,
        waste_percent=req.waste_percent,
        carbon_footprint_kgco2e=req.carbon_footprint_kgco2e,
        carbon_footprint_kgco2e_per_sqft=req.carbon_footprint_kgco2e_per_sqft,
        estimate_id=req.estimate_id,
    )

    # 2. Persist to MongoDB project_estimates collection if estimate_id is provided
    if req.estimate_id:
        try:
            db = get_db()
            col = db[PROJECT_ESTIMATES_COLLECTION]
            await col.update_one(
                {"_id": ObjectId(req.estimate_id)},
                {"$set": {"sustainability_score": resp.model_dump()}},
            )
        except Exception:
            pass  # Non-fatal if estimate_id format is custom or not found

    return resp
