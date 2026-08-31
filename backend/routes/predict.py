"""
POST /api/predict/quantities

Phase 2: Material Quantity Prediction using ecobuild_stage1_estimator.pkl (XGBoost Multi-Target Regressor).
"""
from fastapi import APIRouter
from models.project_estimate import ProjectInputs, MLQuantities
from services.quantity_service import call_stage_a

router = APIRouter(prefix="/api/predict", tags=["Phase 2 — ML Material Quantity Prediction"])


@router.post(
    "/quantities",
    response_model=MLQuantities,
    summary="Predict material quantities using ecobuild_stage1_estimator.pkl",
    description=(
        "Accepts project-spec inputs and uses the trained ecobuild_stage1_estimator.pkl "
        "XGBoost model to predict quantities for Cement (bags), Steel (kg/tons), "
        "Bricks (count), Sand (tons/m³), and Aggregate (tons/m³)."
    ),
)
async def predict_quantities(inputs: ProjectInputs) -> MLQuantities:
    return await call_stage_a(inputs)
