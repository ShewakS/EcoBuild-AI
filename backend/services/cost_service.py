"""
Cost Service — Phase 1: Explicit Calculation-Based Cost Prediction.

Architecture Principle:
  Phase 1 generates cost prediction using explicit civil engineering formulas,
  live Rate Master unit rates, labor man-day rates, and overhead calculations
  without relying on machine learning models.
"""
from datetime import datetime, timezone
from typing import Optional
from models.project_estimate import (
    ProjectInputs,
    DerivedQuantities,
    CostBreakdown,
    RateUsed,
)


def calculate_cost_explicit(
    inputs: ProjectInputs,
    derived: DerivedQuantities,
    rates: list[dict],
) -> tuple[CostBreakdown, list[RateUsed]]:
    """
    Phase 1: Explicit calculation-based cost prediction.
    Uses civil formulas, structural factors, live Rate Master prices, and statutory overheads.
    """
    area = inputs.built_up_area_sqft
    floors = inputs.floors
    finish = inputs.finish_quality
    inf = inputs.inflation_index

    # Multipliers for finish quality and structure
    quality_factor = {"Standard": 1.0, "Premium": 1.15, "Luxury": 1.35}.get(finish, 1.0)
    found_depth_factor = 1.0 + max(0.0, (inputs.foundation_depth_ft - 5)) * 0.02

    # Map rates by item_name for quick lookup
    rate_map = {r["item_name"]: r for r in rates}

    def get_rate(item_name: str, fallback_rate: float, category: str, unit: str):
        if item_name in rate_map:
            r = rate_map[item_name]
            return float(r.get("rate_value", fallback_rate)), r.get("unit", unit), r.get("district", "default")
        return fallback_rate, unit, "default"

    rates_used: list[RateUsed] = []
    now = datetime.now(timezone.utc)

    # ── 1. Material Cost Calculation (Explicit Formulas) ──────────────────────
    # Cement
    cement_req_bags = round(area * floors * 0.58 * quality_factor * found_depth_factor * inf, 1)
    cement_price, cement_unit, c_dist = get_rate("Cement (Portland OPC 53)", 380.0, "Material", "bag")
    cement_cost = cement_req_bags * cement_price
    rates_used.append(RateUsed(item_name="Cement (Portland OPC 53)", category="Material", unit=cement_unit, rate_value=cement_price, effective_date=now, district=c_dist))

    # Steel
    steel_req_tons = round(area * floors * 0.048 * quality_factor * inf, 2)
    steel_price, steel_unit, s_dist = get_rate("Reinforcement Steel (TMT Fe500)", 68000.0, "Material", "ton")
    steel_cost = steel_req_tons * steel_price
    rates_used.append(RateUsed(item_name="Reinforcement Steel (TMT Fe500)", category="Material", unit=steel_unit, rate_value=steel_price, effective_date=now, district=s_dist))

    # M-Sand
    sand_req_tons = round(area * floors * 0.034 * inf, 2)
    sand_price, sand_unit, sa_dist = get_rate("M-Sand (Fine Aggregate)", 1800.0, "Material", "ton")
    sand_cost = sand_req_tons * sand_price
    rates_used.append(RateUsed(item_name="M-Sand (Fine Aggregate)", category="Material", unit=sand_unit, rate_value=sand_price, effective_date=now, district=sa_dist))

    # 20mm Coarse Aggregate
    agg_req_tons = round(area * floors * 0.044 * inf, 2)
    agg_price, agg_unit, ag_dist = get_rate("Coarse Aggregate (20mm)", 1200.0, "Material", "ton")
    agg_cost = agg_req_tons * agg_price
    rates_used.append(RateUsed(item_name="Coarse Aggregate (20mm)", category="Material", unit=agg_unit, rate_value=agg_price, effective_date=now, district=ag_dist))

    # Bricks / Wall Units
    brick_mult = 8 if inputs.wall_material == "Brick" else 5 if inputs.wall_material in ("AAC Block", "Hollow Block") else 4
    brick_count = int(area * floors * brick_mult * quality_factor)
    brick_item = "Burnt Clay Bricks" if inputs.wall_material == "Brick" else "AAC Lightweight Blocks" if inputs.wall_material == "AAC Block" else "Hollow Concrete Blocks"
    brick_price, brick_unit, br_dist = get_rate(brick_item, 9.0 if brick_item == "Burnt Clay Bricks" else 65.0 if brick_item == "AAC Lightweight Blocks" else 45.0, "Material", "count")
    brick_cost = brick_count * brick_price
    rates_used.append(RateUsed(item_name=brick_item, category="Material", unit=brick_unit, rate_value=brick_price, effective_date=now, district=br_dist))

    material_cost = cement_cost + steel_cost + sand_cost + agg_cost + brick_cost

    # ── 2. Labour Cost Calculation (Explicit Formulas) ────────────────────────
    total_man_days = area * floors * 0.25 * quality_factor * inf
    skilled_days = total_man_days * 0.70
    unskilled_days = total_man_days * 0.30

    skilled_rate, sk_unit, sk_dist = get_rate("Skilled Labour (Mason/Carpenter)", 900.0, "Labour", "day")
    unskilled_rate, unsk_unit, unsk_dist = get_rate("Unskilled Labour (Helper)", 600.0, "Labour", "day")

    labour_cost = (skilled_days * skilled_rate) + (unskilled_days * unskilled_rate)
    rates_used.append(RateUsed(item_name="Skilled Labour (Mason/Carpenter)", category="Labour", unit=sk_unit, rate_value=skilled_rate, effective_date=now, district=sk_dist))
    rates_used.append(RateUsed(item_name="Unskilled Labour (Helper)", category="Labour", unit=unsk_unit, rate_value=unskilled_rate, effective_date=now, district=unsk_dist))

    # ── 3. Electrical Cost Calculation ────────────────────────────────────────
    elec_points = derived.electrical_points_count
    elec_rate, el_unit, el_dist = get_rate("Electrical Point Wiring", 2500.0, "Electrical", "point")
    electrical_cost = elec_points * elec_rate
    rates_used.append(RateUsed(item_name="Electrical Point Wiring", category="Electrical", unit=el_unit, rate_value=elec_rate, effective_date=now, district=el_dist))

    # ── 4. Plumbing Cost Calculation ──────────────────────────────────────────
    plumb_fixtures = derived.plumbing_fixture_count
    plumb_rate, pl_unit, pl_dist = get_rate("Plumbing Fixture Installation", 4500.0, "Plumbing", "fixture")
    plumbing_cost = plumb_fixtures * plumb_rate
    rates_used.append(RateUsed(item_name="Plumbing Fixture Installation", category="Plumbing", unit=pl_unit, rate_value=plumb_rate, effective_date=now, district=pl_dist))

    # ── 5. Painting Cost Calculation ──────────────────────────────────────────
    paint_area = derived.paintable_area_sqft
    paint_rate, pa_unit, pa_dist = get_rate("Interior Painting (2 coats emulsion)", 28.0, "Painting", "sqft")
    painting_cost = paint_area * paint_rate
    rates_used.append(RateUsed(item_name="Interior Painting (2 coats emulsion)", category="Painting", unit=pa_unit, rate_value=paint_rate, effective_date=now, district=pa_dist))

    # ── 6. Finishing Cost Calculation ─────────────────────────────────────────
    floor_area = area * floors
    finish_rate, fi_unit, fi_dist = get_rate("Floor Finishing (tiles + laying)", 180.0, "Finishing", "sqft")
    finishing_cost = floor_area * finish_rate
    rates_used.append(RateUsed(item_name="Floor Finishing (tiles + laying)", category="Finishing", unit=fi_unit, rate_value=finish_rate, effective_date=now, district=fi_dist))

    # ── 7. Overheads & Approvals (Explicit Percentage) ────────────────────────
    subtotal = material_cost + labour_cost + electrical_cost + plumbing_cost + painting_cost + finishing_cost
    misc_pct_rate, _, am_dist = get_rate("Approval & Misc (flat %)", 4.0, "Approval-Misc", "%")
    approval_misc_cost = round(subtotal * (misc_pct_rate / 100.0), 2)
    rates_used.append(RateUsed(item_name="Approval & Misc (flat %)", category="Approval-Misc", unit="%", rate_value=misc_pct_rate, effective_date=now, district=am_dist))

    total_cost = round(subtotal + approval_misc_cost, 2)

    breakdown = CostBreakdown(
        material_cost=round(material_cost, 2),
        labour_cost=round(labour_cost, 2),
        electrical_cost=round(electrical_cost, 2),
        plumbing_cost=round(plumbing_cost, 2),
        painting_cost=round(painting_cost, 2),
        finishing_cost=round(finishing_cost, 2),
        approval_misc_cost=approval_misc_cost,
        total_cost=total_cost,
        calculation_method="Explicit Civil Formulas & Rate Master Unit Pricing",
    )

    return breakdown, rates_used
