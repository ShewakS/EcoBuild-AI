"""
Waste API Routes — EcoBuild AI
Provides endpoints for waste reference thresholds and authentic waste computations.
"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from models.waste import WasteCalculationRequest, WasteCalculationResponse
from services.waste_service import get_waste_thresholds, calculate_waste_analysis

router = APIRouter(prefix="/api/waste", tags=["Waste Analysis"])


@router.get("/thresholds", response_model=List[Dict[str, Any]])
async def get_thresholds_endpoint():
    """Retrieve CPWD / BMTPC / NICMAR standard waste thresholds and mitigation protocols."""
    try:
        return await get_waste_thresholds()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/calculate", response_model=WasteCalculationResponse)
async def calculate_waste_endpoint(payload: WasteCalculationRequest):
    """
    Calculate predicted construction material waste, risk tiers (Low/Normal/High),
    financial cost of waste, and specific mitigation measures.
    """
    try:
        return await calculate_waste_analysis(payload.materials)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Waste calculation failed: {str(e)}")
