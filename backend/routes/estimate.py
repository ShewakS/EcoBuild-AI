"""
POST /api/estimate/cost

Two-Phase Cost & Material Estimation Workflow:
  Phase 1: Calculation-Based Cost Prediction
           Uses explicit civil engineering formulas, live Rate Master unit rates,
           labor man-day rates, and overhead calculations.
  Phase 2: ML Model-Based Material Quantity Prediction
           Uses ecobuild_stage1_estimator.pkl (XGBoost Multi-Target Regressor)
           exclusively to predict individual material quantities (Cement, Steel, Bricks, Sand, Aggregate).
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
from models.project_estimate import (
    ProjectInputs,
    AllQuantities,
    EstimateResponse,
)
from services.quantity_service import call_stage_a, compute_derived
from services.cost_service import calculate_cost_explicit
from services.rate_service import get_current_rates, get_latest_update_time
from config import get_db, PROJECT_ESTIMATES_COLLECTION

router = APIRouter(prefix="/api/estimate", tags=["Cost Estimation"])


@router.post(
    "/cost",
    response_model=EstimateResponse,
    summary="Generate cost and ML material estimate",
    description=(
        "Executes Phase 1 (Explicit calculation-based cost prediction using formulas & live Rate Master unit rates) "
        "and Phase 2 (ML model material quantity prediction using ecobuild_stage1_estimator.pkl)."
    ),
)
async def estimate_cost(inputs: ProjectInputs) -> EstimateResponse:
    # ── Derived architectural quantities (room perimeters, points, fixtures) ──
    derived = compute_derived(inputs)

    # ── Fetch current rates for the project's district ────────────────────────
    rates = await get_current_rates(inputs.district)
    if not rates:
        rates = await get_current_rates("default")
    if not rates:
        raise HTTPException(
            status_code=503,
            detail="No rates available. Run: python seed/default_rates.py",
        )

    # ── PHASE 1: Calculation-based Cost Prediction (Explicit Formulas & Rates) ──
    breakdown, rates_used = calculate_cost_explicit(inputs, derived, rates)

    # ── PHASE 2: ML Material Quantity Prediction (ecobuild_stage1_estimator.pkl) ──
    try:
        ml_quantities = await call_stage_a(inputs)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Phase 2 ML material quantity prediction failed: {exc}",
        )

    all_quantities = AllQuantities(ml=ml_quantities, derived=derived)

    # ── Persist estimate to MongoDB ───────────────────────────────────────────
    now = datetime.now(timezone.utc)
    estimate_doc = {
        "created_at": now,
        "inputs": inputs.model_dump(),
        "quantities": all_quantities.model_dump(),
        "rates_used": [r.model_dump() for r in rates_used],
        "breakdown": breakdown.model_dump(),
        "phase_info": {
            "phase_1_cost": "Explicit Engineering Formulas & Live Rate Master Unit Rates",
            "phase_2_materials": "ecobuild_stage1_estimator.pkl (XGBoost Regressor)",
        },
    }

    db = get_db()
    col = db[PROJECT_ESTIMATES_COLLECTION]
    result = await col.insert_one(estimate_doc)
    estimate_id = str(result.inserted_id)

    # ── Fetch rates last-updated timestamp ────────────────────────────────────
    rates_last_updated = await get_latest_update_time()

    return EstimateResponse(
        estimate_id=estimate_id,
        created_at=now,
        inputs=inputs,
        quantities=all_quantities,
        rates_used=rates_used,
        breakdown=breakdown,
        rates_last_updated=rates_last_updated,
        phase_info=estimate_doc["phase_info"],
    )


@router.get(
    "/{estimate_id}",
    summary="Retrieve a saved estimate by ID",
    description="Fetches a previously saved estimate from MongoDB by its ID.",
)
async def get_estimate(estimate_id: str):
    from bson import ObjectId
    try:
        oid = ObjectId(estimate_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid estimate ID format.")

    db = get_db()
    col = db[PROJECT_ESTIMATES_COLLECTION]
    doc = await col.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail=f"Estimate '{estimate_id}' not found.")
    doc["_id"] = str(doc["_id"])
    return doc
