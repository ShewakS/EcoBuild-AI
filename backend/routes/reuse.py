"""
Material Reuse API Routes — EcoBuild AI
Provides endpoints for safe, non-structural material reuse guidelines and project matching.
"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from models.reuse import ReuseRecommendationRequest, ReuseRecommendationResponse
from services.reuse_service import get_all_reuse_rules, get_recommendations_for_project

router = APIRouter(prefix="/api/recommendations/reuse", tags=["Material Reuse"])


@router.get("/rules", response_model=List[Dict[str, Any]])
async def get_reuse_rules_endpoint():
    """Retrieve all standard safe material reuse guidelines and non-structural applications."""
    try:
        return await get_all_reuse_rules()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=ReuseRecommendationResponse)
async def get_project_reuse_endpoint(payload: ReuseRecommendationRequest):
    """
    Get customized safe material reuse opportunities, cost benefits,
    and crucial structural safety restrictions based on materials present.
    """
    try:
        return await get_recommendations_for_project(payload.materials_present)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate reuse recommendations: {str(e)}")
