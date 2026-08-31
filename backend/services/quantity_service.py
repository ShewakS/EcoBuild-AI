"""
Quantity Service — Phase 2 ML Material Quantity Estimation & Derived Ratios.

Workflow:
  1. Material quantities (Cement, Steel, Bricks, Sand, Aggregate) are predicted
     EXCLUSIVELY by the XGBoost ensemble model ecobuild_stage1_estimator.pkl.
     All old static lookup tables and heuristics have been removed.
  2. Derived quantities (Electrical points, plumbing fixtures, paintable wall area)
     are computed using standard architectural ratios based on user room configurations.
"""
import math
from models.project_estimate import ProjectInputs, MLQuantities, DerivedQuantities
from services.ml_estimator import predict_stage1_materials


async def call_stage_a(inputs: ProjectInputs) -> MLQuantities:
    """
    Calls the trained XGBoost model (ecobuild_stage1_estimator.pkl)
    to predict precise material quantities.
    """
    preds = predict_stage1_materials(inputs)
    return MLQuantities(
        cement_bags=preds["cement_bags"],
        steel_kg=preds.get("steel_kg", 0.0),
        steel_tons=preds["steel_tons"],
        sand_tons=preds["sand_tons"],
        sand_cum=preds.get("sand_cum", 0.0),
        aggregate_tons=preds["aggregate_tons"],
        aggregate_cum=preds.get("aggregate_cum", 0.0),
        brick_count=preds["bricks_count"],
        labour_man_days=preds["labour_man_days"],
        model_source="ecobuild_stage1_estimator.pkl (XGBoost Multi-Target)",
    )


def compute_derived(inputs: ProjectInputs) -> DerivedQuantities:
    """
    Standard architectural estimation ratios based on room & kitchen configurations.
    """
    area = inputs.built_up_area_sqft
    floors = inputs.floors
    bathrooms = inputs.bathrooms
    bedrooms = inputs.bedrooms
    kitchens = inputs.kitchens

    # Calculate bedroom carpet area & room points
    bedroom_carpet_area = 0.0
    bedroom_points = 0
    bedroom_wall_area = 0.0

    if inputs.room_sizes and len(inputs.room_sizes) > 0:
        for room in inputs.room_sizes:
            r_area = room.length_ft * room.width_ft
            bedroom_carpet_area += r_area
            bedroom_wall_area += 2 * (room.length_ft + room.width_ft) * 10
            if r_area <= 100:
                bedroom_points += 3
            elif r_area <= 160:
                bedroom_points += 4
            else:
                bedroom_points += 6
    else:
        bedroom_carpet_area = bedrooms * 130.0
        bedroom_points = bedrooms * 4

    # Calculate kitchen carpet area & points
    kitchen_carpet_area = 0.0
    kitchen_points = 0
    kitchen_wall_area = 0.0

    if inputs.kitchen_sizes and len(inputs.kitchen_sizes) > 0:
        for kit in inputs.kitchen_sizes:
            k_area = kit.length_ft * kit.width_ft
            kitchen_carpet_area += k_area
            kitchen_wall_area += 2 * (kit.length_ft + kit.width_ft) * 10
            # Kitchen electrical: chimney, fridge, mixer, microwave, exhaust, light = 5 points
            kitchen_points += 5
    else:
        kitchen_carpet_area = kitchens * 90.0
        kitchen_points = kitchens * 5

    # General points based on total built-up area
    general_points = max(1, math.floor(area / 100))
    electrical_points = general_points + bedroom_points + kitchen_points + (bathrooms * 3)

    # Plumbing fixtures: 4 per bathroom (WC, basin, shower, tap) + 2 per kitchen (sink, RO/tap)
    plumbing_fixtures = (bathrooms * 4) + (kitchens * 2)

    # Paintable wall area
    total_room_walls = bedroom_wall_area + kitchen_wall_area
    if total_room_walls > 0:
        paintable_area = round((total_room_walls + (area * 1.6)) * floors, 1)
    else:
        paintable_area = round(area * 2.75 * floors, 1)

    return DerivedQuantities(
        electrical_points_count=electrical_points,
        plumbing_fixture_count=plumbing_fixtures,
        paintable_area_sqft=paintable_area,
        bedroom_carpet_area_sqft=round(bedroom_carpet_area, 1),
        kitchen_carpet_area_sqft=round(kitchen_carpet_area, 1),
    )
