"""
POST /api/estimate/cost

Two-Phase Cost & Material Estimation Workflow + Carbon Footprint Analysis:
  Phase 1: Calculation-Based Cost Prediction
           Uses explicit civil engineering formulas, live Rate Master unit rates,
           labor man-day rates, and overhead calculations.
  Phase 2: ML Model-Based Material Quantity Prediction
           Uses ecobuild_stage1_estimator.pkl (XGBoost Multi-Target Regressor)
           exclusively to predict individual material quantities.
  Phase 3: Embodied Carbon Footprint & Energy Analysis
           Calculates total & per-material carbon emissions and energy from
           the IFC Indian Construction Material Emission Factors dataset.
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
from models.project_estimate import (
    ProjectInputs,
    AllQuantities,
    EstimateResponse,
)
from services.quantity_service import call_stage_a, compute_derived
from services.cost_service import predict_cost_ml
from services.carbon_service import calculate_carbon_footprint
from services.sustainability_service import compute_sustainability_score
from services.rate_service import get_current_rates, get_latest_update_time
from config import get_db, PROJECT_ESTIMATES_COLLECTION

router = APIRouter(prefix="/api/estimate", tags=["Cost Estimation"])


@router.post(
    "/cost",
    response_model=EstimateResponse,
    summary="Generate cost, ML material quantities, and embodied carbon footprint",
    description=(
        "Executes Phase 1 (Explicit calculation-based cost prediction using formulas & live Rate Master unit rates), "
        "Phase 2 (ML model material quantity prediction using ecobuild_stage1_estimator.pkl), and "
        "Phase 3 (Embodied carbon footprint calculation based on the IFC Indian emission factors dataset)."
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

    # ── PHASE 2: ML Material Quantity Prediction (ecobuild_stage1_estimator.pkl) ──
    try:
        ml_quantities = await call_stage_a(inputs)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Phase 2 ML material quantity prediction failed: {exc}",
        )

    all_quantities = AllQuantities(ml=ml_quantities, derived=derived)

    # ── PHASE 3: Embodied Carbon Footprint Calculation (IFC Indian dataset) ────
    carbon_footprint = calculate_carbon_footprint(inputs, ml_quantities, derived)

    # ── PHASE 4: Rule-Based Sustainability Score (0-100) ───────────────────────
    sustainability_score = compute_sustainability_score(
        inputs=inputs,
        waste_percent=5.0,
        carbon_footprint_kgco2e_per_sqft=carbon_footprint.carbon_intensity_kg_per_sqft,
    )

    # ── PHASE 1: ML Model-Based Cost Prediction (ecobuild_cost_model.pkl) ─────
    breakdown, rates_used = predict_cost_ml(inputs, carbon_tco2=carbon_footprint.total_carbon_tons)

    # ── Persist estimate to MongoDB ───────────────────────────────────────────
    now = datetime.now(timezone.utc)
    estimate_doc = {
        "created_at": now,
        "inputs": inputs.model_dump(),
        "quantities": all_quantities.model_dump(),
        "rates_used": [r.model_dump() for r in rates_used],
        "breakdown": breakdown.model_dump(),
        "carbon_footprint": carbon_footprint.model_dump(),
        "sustainability_score": sustainability_score.model_dump(),
        "phase_info": {
            "phase_1_cost": "ecobuild_cost_model.pkl (XGBoost Regressor Pipeline)",
            "phase_2_materials": "ecobuild_stage1_estimator.pkl (XGBoost Regressor)",
            "phase_3_carbon": "IFC Indian Construction Emission Factors (IFC India Database)",
            "phase_4_sustainability": "Rule-Based Explainable Weighted Engine (0-100)",
        },
    }

    db = get_db()
    col = db[PROJECT_ESTIMATES_COLLECTION]
    result = await col.insert_one(estimate_doc)
    estimate_id = str(result.inserted_id)

    # Update estimate_id in sustainability_score
    sustainability_score.estimate_id = estimate_id

    # ── Fetch rates last-updated timestamp ────────────────────────────────────
    rates_last_updated = await get_latest_update_time()

    return EstimateResponse(
        estimate_id=estimate_id,
        created_at=now,
        inputs=inputs,
        quantities=all_quantities,
        rates_used=rates_used,
        breakdown=breakdown,
        carbon_footprint=carbon_footprint,
        sustainability_score=sustainability_score.model_dump(),
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
    doc["estimate_id"] = str(doc["_id"])
    return doc
