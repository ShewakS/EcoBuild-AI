"""
Cost Service — ML Cost Prediction using ecobuild_cost_model.pkl.

Architecture Principle:
  The cost prediction is made exclusively using the ecobuild_cost_model.pkl model
  (an sklearn Pipeline containing OneHotEncoder, StandardScaler, and XGBRegressor)
  and removes any manual calculation or formula-based methods.
"""
import os
import joblib
import pandas as pd
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional
from models.project_estimate import (
    ProjectInputs,
    DerivedQuantities,
    CostBreakdown,
    RateUsed,
)

MODEL_PATH = Path(__file__).parent.parent / "ecobuild_cost_model.pkl"
_COST_PIPELINE: Optional[object] = None

# 19 Districts trained in ecobuild_cost_model.pkl
TRAINED_DISTRICTS = {
    "Chengalpattu", "Chennai", "Coimbatore", "Dindigul", "Erode",
    "Kanchipuram", "Kanyakumari", "Karur", "Madurai", "Namakkal",
    "Salem", "Thanjavur", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
    "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Vellore",
}

METRO_DISTRICTS = {"Chennai", "Coimbatore"}
TIER2_DISTRICTS = {
    "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur",
    "Erode", "Vellore", "Kanchipuram", "Chengalpattu", "Dindigul", "Thanjavur",
}


def load_cost_pipeline():
    """Loads and caches the ecobuild_cost_model.pkl pipeline."""
    global _COST_PIPELINE
    if _COST_PIPELINE is not None:
        return _COST_PIPELINE

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"ecobuild_cost_model.pkl not found at '{MODEL_PATH}'")

    _COST_PIPELINE = joblib.load(MODEL_PATH)
    return _COST_PIPELINE


def predict_cost_ml(
    inputs: ProjectInputs,
    carbon_tco2: Optional[float] = None,
) -> tuple[CostBreakdown, list[RateUsed]]:
    """
    Predicts project construction cost exclusively using ecobuild_cost_model.pkl.
    Maps inputs to the 24 trained features and executes the XGBRegressor pipeline.
    """
    pipeline = load_cost_pipeline()

    # ── 1. Feature Mapping ────────────────────────────────────────────────────
    # District & City Tier
    dist = inputs.district.strip()
    if dist in METRO_DISTRICTS:
        city_tier = "Metro"
    elif dist in TIER2_DISTRICTS:
        city_tier = "Tier-2"
    else:
        city_tier = "Tier-3"

    # If district is not in the 19 trained districts, choose the closest/default
    model_district = dist if dist in TRAINED_DISTRICTS else "Chennai"

    # Building type
    res_type = inputs.residential_type or "Residential"
    if "Villa" in res_type:
        btype = "Villa"
    elif "Apartment" in res_type:
        btype = "Apartment"
    elif inputs.building_type == "Commercial":
        btype = "Commercial"
    else:
        btype = "Residential"

    # Soil type
    soil_map = {
        "Clay": "Clay",
        "Sandy": "Sandy",
        "Black Cotton": "Black Cotton",
        "Loamy": "Red Soil",
        "Rocky": "Gravel",
    }
    stype = soil_map.get(inputs.soil_type, "Clay")

    # Land type
    land_map = {
        "Flat": "Urban",
        "Sloped": "Semi-Urban",
        "Hilly": "Rural",
    }
    ltype = land_map.get(inputs.land_type, "Urban")

    # Foundation type
    f_map = {
        "Pile": "Pile",
        "Raft": "Raft",
        "Strip": "Shallow",
        "Isolated Footing": "Shallow",
    }
    ftype = f_map.get(inputs.foundation_type, "Shallow")

    # Wall material
    w_map = {
        "AAC Block": "AAC Block",
        "Brick": "Brick",
        "Hollow Block": "Fly Ash Brick",
        "Stone": "Brick",
    }
    wmat = w_map.get(inputs.wall_material, "Brick")

    # Roof type
    r_map = {
        "RCC Flat": "RCC",
        "Sloped Tile": "Tile",
        "Metal Sheet": "Steel",
        "Thatched": "Tile",
    }
    rtype = r_map.get(inputs.roof_type, "RCC")

    # Flooring
    fl_map = {
        "Ceramic Tile": "Ceramic",
        "Vitrified Tile": "Vitrified",
        "Marble": "Marble",
        "Granite": "Granite",
        "Concrete": "Ceramic",
    }
    flooring = fl_map.get(inputs.flooring, "Vitrified")

    # Finish quality
    fq = inputs.finish_quality if inputs.finish_quality in ("Basic", "Standard", "Premium", "Luxury") else "Standard"

    # Earthquake zone
    eq_str = inputs.earthquake_zone or "Zone III"
    eq_val = 2 if "II" in eq_str and "III" not in eq_str else 4 if "IV" in eq_str else 5 if "V" in eq_str else 3

    # Wind zone
    wz_str = inputs.wind_zone or "Zone II"
    wind_zone = "Low" if "I" in wz_str and "II" not in wz_str and "III" not in wz_str and "IV" not in wz_str else "High" if "IV" in wz_str else "Medium"

    # Sustainability score calculation based on eco options
    sust_score = 55.0
    if inputs.solar_panels:
        sust_score += 15.0
    if inputs.rainwater_harvesting:
        sust_score += 10.0
    if inputs.wall_material in ("AAC Block", "Hollow Block"):
        sust_score += 8.0

    # Carbon footprint estimation in tCO2
    carbon_val = (
        carbon_tco2
        if (carbon_tco2 is not None and carbon_tco2 > 0)
        else float(inputs.built_up_area_sqft * inputs.floors * 0.038)
    )

    # ── 2. Construct 24-feature DataFrame ─────────────────────────────────────
    feature_row = {
        "construction_year": 2024,
        "built_up_area_sqft": float(inputs.built_up_area_sqft),
        "floors": int(inputs.floors),
        "bedrooms": int(inputs.bedrooms),
        "bathrooms": int(inputs.bathrooms),
        "parking": int(inputs.parking),
        "foundation_depth_ft": float(inputs.foundation_depth_ft),
        "earthquake_zone": eq_val,
        "waste_percent": 5.0,
        "carbon_footprint_tco2": round(carbon_val, 2),
        "sustainability_score": round(sust_score, 1),
        "district": model_district,
        "city_tier": city_tier,
        "building_type": btype,
        "soil_type": stype,
        "land_type": ltype,
        "foundation_type": ftype,
        "wall_material": wmat,
        "roof_type": rtype,
        "flooring": flooring,
        "finish_quality": fq,
        "solar_panels": "Yes" if inputs.solar_panels else "No",
        "rainwater_harvesting": "Yes" if inputs.rainwater_harvesting else "No",
        "wind_zone": wind_zone,
    }

    df = pd.DataFrame([feature_row])

    # ── 3. Execute Model Prediction ───────────────────────────────────────────
    pred_raw = pipeline.predict(df)[0]
    total_predicted_cost = float(pred_raw)

    # Apply inflation multiplier if specified
    if inputs.inflation_index and inputs.inflation_index != 1.0:
        total_predicted_cost *= inputs.inflation_index

    total_cost = round(total_predicted_cost, 2)

    # ── 4. Standard Civil Engineering Component Breakdown ────────────────────
    # Materials: 52%, Labour: 22%, Electrical: 6%, Plumbing: 5%, Painting: 5%, Finishing: 6%, Overheads: 4%
    material_cost = round(total_cost * 0.52, 2)
    labour_cost = round(total_cost * 0.22, 2)
    electrical_cost = round(total_cost * 0.06, 2)
    plumbing_cost = round(total_cost * 0.05, 2)
    painting_cost = round(total_cost * 0.05, 2)
    finishing_cost = round(total_cost * 0.06, 2)
    approval_misc_cost = round(total_cost - (material_cost + labour_cost + electrical_cost + plumbing_cost + painting_cost + finishing_cost), 2)

    breakdown = CostBreakdown(
        material_cost=material_cost,
        labour_cost=labour_cost,
        electrical_cost=electrical_cost,
        plumbing_cost=plumbing_cost,
        painting_cost=painting_cost,
        finishing_cost=finishing_cost,
        approval_misc_cost=approval_misc_cost,
        total_cost=total_cost,
        calculation_method="ecobuild_cost_model.pkl (XGBoost Regressor Pipeline)",
    )

    rates_used: list[RateUsed] = []
    now = datetime.now(timezone.utc)
    rates_used.append(
        RateUsed(
            item_name="Total Construction Cost (ML Predicted)",
            category="ML Prediction",
            unit="project",
            rate_value=total_cost,
            effective_date=now,
            district=dist,
        )
    )

    return breakdown, rates_used
