"""
Carbon Emission Routes — IFC Indian Construction Emission Factors.

Endpoints:
- GET  /api/carbon/factors   → Returns all 100 IFC Indian material emission factors.
- POST /api/carbon/estimate  → Standalone carbon footprint prediction.
"""
from fastapi import APIRouter, HTTPException
from models.project_estimate import ProjectInputs, CarbonFootprint
from services.quantity_service import call_stage_a, compute_derived
from services.carbon_service import get_all_ifc_factors, calculate_carbon_footprint

router = APIRouter(prefix="/api/carbon", tags=["Carbon Emission (IFC Indian Factors)"])


@router.get(
    "/factors",
    summary="Get all IFC Indian carbon emission factors",
    description="Returns the full database of 100 materials with GWP (kgCO2e/kg), embodied energy (MJ/kg), and reference densities.",
)
async def get_carbon_factors():
    try:
        factors = get_all_ifc_factors()
        return {"total_count": len(factors), "factors": factors}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load IFC carbon factors: {e}")


@router.post(
    "/estimate",
    response_model=CarbonFootprint,
    summary="Calculate embodied carbon footprint for a project",
    description="Takes project specifications, retrieves predicted material quantities, and computes the embodied carbon emissions using the IFC India dataset.",
)
async def estimate_carbon(inputs: ProjectInputs) -> CarbonFootprint:
    try:
        ml_quantities = await call_stage_a(inputs)
        derived = compute_derived(inputs)
        footprint = calculate_carbon_footprint(inputs, ml_quantities, derived)
        return footprint
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Carbon footprint calculation failed: {e}")
