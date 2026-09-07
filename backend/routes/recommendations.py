"""
Eco-Material Recommendations API Routes.

POST /api/recommendations/eco-materials — Evaluates project inputs against
MongoDB rules and returns explainable alternative material suggestions.
GET /api/recommendations/rules — Lists active recommendation rules.
"""
from fastapi import APIRouter
from models.sustainability import (
    EcoRecommendationRequest,
    EcoRecommendationResponse,
)
from services.recommendation_service import (
    evaluate_eco_recommendations,
    get_all_rules,
)

router = APIRouter(prefix="/api/recommendations", tags=["Eco-Material Recommendations"])


@router.post(
    "/eco-materials",
    response_model=EcoRecommendationResponse,
    summary="Get explainable low-carbon material recommendations",
    description=(
        "Evaluates project material specifications (wall, roof, flooring, solar, rainwater harvesting) "
        "against rules stored in MongoDB. Returns suggested alternatives, reasons, and optional cost delta percentages."
    ),
)
async def get_eco_material_recommendations(req: EcoRecommendationRequest) -> EcoRecommendationResponse:
    inputs_dict = req.model_dump()
    return await evaluate_eco_recommendations(inputs_dict)


@router.get(
    "/rules",
    summary="List all active eco-material rules from MongoDB",
)
async def list_rules():
    return await get_all_rules()
