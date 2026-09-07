"""
Sustainability Score Service — EcoBuild AI
Comprehensive 5-Category Rule-Based 0-100 Scoring Engine with Official Grading.

Categories (100 Points Total):
1. Material Efficiency (25 Points)
2. Waste Management (20 Points)
3. Carbon Performance (25 Points)
4. Sustainable Materials Selection (15 Points)
5. Material Reuse & Circularity (15 Points)

Grades:
- 85 - 100: Excellent
- 70 - 84:  Good
- 50 - 69:  Moderate
- 35 - 49:  Needs Improvement
- < 35:     Poor
"""
from typing import Optional, List, Dict, Any
from models.project_estimate import ProjectInputs
from models.sustainability import (
    SustainabilityBreakdownItem,
    CategoryScore,
    SustainabilityScoreResponse,
)

# Tunable Benchmarks
BASELINE_CARBON_PER_SQFT: float = 36.0
CARBON_PENALTY_FACTOR: float = 1.39
WASTE_BASELINE_PERCENT: float = 5.0
WASTE_PENALTY_FACTOR: float = 1.5


def get_grade_and_band(score: int) -> str:
    if score >= 85:
        return "Excellent"
    elif score >= 70:
        return "Good"
    elif score >= 50:
        return "Moderate"
    elif score >= 35:
        return "Needs Improvement"
    else:
        return "Poor"


def compute_sustainability_score(
    inputs: ProjectInputs,
    waste_percent: Optional[float] = 5.0,
    carbon_footprint_kgco2e: Optional[float] = None,
    carbon_footprint_kgco2e_per_sqft: Optional[float] = None,
    estimate_id: Optional[str] = None,
    material_quantities: Optional[Dict[str, Any]] = None,
) -> SustainabilityScoreResponse:
    """
    Computes 5-category 0-100 score, itemized category evaluations, and detailed breakdown.
    """
    total_area_sqft = max(1.0, float(inputs.built_up_area_sqft) * int(inputs.floors))

    # Determine carbon footprint intensity (kgCO2e/sqft)
    if carbon_footprint_kgco2e_per_sqft is not None and carbon_footprint_kgco2e_per_sqft > 0:
        carbon_intensity = float(carbon_footprint_kgco2e_per_sqft)
    elif carbon_footprint_kgco2e is not None and carbon_footprint_kgco2e > 0:
        carbon_intensity = round(carbon_footprint_kgco2e / total_area_sqft, 2)
    else:
        base_intensity = 35.0
        wall_str = str(inputs.wall_material).strip().lower()
        if "aac" in wall_str:
            base_intensity -= 5.5
        elif "fly ash" in wall_str:
            base_intensity -= 3.0
        if inputs.solar_panels:
            base_intensity -= 2.0
        carbon_intensity = round(base_intensity, 2)

    waste_pct = float(waste_percent) if waste_percent is not None else 5.0
    wall_mat = str(inputs.wall_material).strip()
    is_solar = inputs.solar_panels is True or str(inputs.solar_panels).lower() in ("yes", "true", "1")
    is_rwh = inputs.rainwater_harvesting is True or str(inputs.rainwater_harvesting).lower() in ("yes", "true", "1")

    # ── Category 1: Material Efficiency (25 Points) ──
    cat1_score = 10.0
    cat1_strengths = []
    cat1_recs = []
    if "aac" in wall_mat.lower():
        cat1_score += 10.0
        cat1_strengths.append("Utilizing lightweight AAC blocks significantly reduces dead load on structural frame.")
    elif "fly ash" in wall_mat.lower():
        cat1_score += 7.0
        cat1_strengths.append("Fly Ash bricks reduce clay extraction and utilize thermal power plant pozzolana.")
    else:
        cat1_score += 2.0
        cat1_recs.append("Replace conventional clay bricks with AAC blocks or Fly Ash bricks to save structural dead load.")

    if inputs.finish_quality in ("Standard", "Economy"):
        cat1_score += 5.0
        cat1_strengths.append(f"Practical finish specification ({inputs.finish_quality}) avoids over-dimensioned luxury cladding.")
    else:
        cat1_score += 3.0
        cat1_recs.append("Specify locally sourced terrazzo or regional granite instead of imported high-embodied tiles.")

    cat1_score = min(25.0, max(0.0, cat1_score))

    # ── Category 2: Waste Management (20 Points) ──
    cat2_strengths = []
    cat2_recs = []
    if waste_pct <= 3.5:
        cat2_score = 20.0
        cat2_strengths.append(f"Exceptional site waste control ({waste_pct:.1f}%), outperforming CPWD 5% benchmark.")
    elif waste_pct <= 5.5:
        cat2_score = 16.0
        cat2_strengths.append(f"Healthy site waste control ({waste_pct:.1f}%) within standard CPWD allowances.")
    elif waste_pct <= 8.0:
        cat2_score = 12.0
        cat2_recs.append(f"Estimated waste ({waste_pct:.1f}%) slightly elevated; implement BBS rebar cutting and covered sand bays.")
    elif waste_pct <= 10.0:
        cat2_score = 8.0
        cat2_recs.append(f"High waste level ({waste_pct:.1f}%); enforce palletized masonry unloading and rebound plaster recovery.")
    else:
        cat2_score = 4.0
        cat2_recs.append("Critical waste risk (>10%); require mandatory contractor waste audit and batching controls.")

    cat2_score = min(20.0, max(0.0, cat2_score))

    # ── Category 3: Carbon Performance (25 Points) ──
    cat3_strengths = []
    cat3_recs = []
    if carbon_intensity <= 28.0:
        cat3_score = 25.0
        cat3_strengths.append(f"Outstanding low embodied carbon ({carbon_intensity:.1f} kgCO₂e/sqft), far below 36.0 benchmark.")
    elif carbon_intensity <= 32.0:
        cat3_score = 21.0
        cat3_strengths.append(f"Embodied carbon ({carbon_intensity:.1f} kgCO₂e/sqft) is 12-20% greener than standard Tamil Nadu average.")
    elif carbon_intensity <= 36.0:
        cat3_score = 17.0
        cat3_strengths.append(f"Embodied carbon ({carbon_intensity:.1f} kgCO₂e/sqft) is on par with standard regional baseline.")
    elif carbon_intensity <= 42.0:
        cat3_score = 11.0
        cat3_recs.append(f"Elevated carbon intensity ({carbon_intensity:.1f} kgCO₂e/sqft); substitute Portland Pozzolana Cement (PPC).")
    else:
        cat3_score = 6.0
        cat3_recs.append(f"High carbon footprint ({carbon_intensity:.1f} kgCO₂e/sqft); prioritize blended cements and recycled aggregates.")

    cat3_score = min(25.0, max(0.0, cat3_score))

    # ── Category 4: Sustainable Materials Selection (15 Points) ──
    cat4_score = 3.0
    cat4_strengths = []
    cat4_recs = []
    if is_solar:
        cat4_score += 6.5
        cat4_strengths.append("Integrated rooftop solar PV for clean renewable power generation.")
    else:
        cat4_recs.append("Install rooftop solar PV to offset operational electricity emissions.")

    if is_rwh:
        cat4_score += 5.5
        cat4_strengths.append("Rainwater harvesting system planned for local groundwater recharge.")
    else:
        cat4_recs.append("Incorporate rooftop rainwater harvesting and percolation pits.")

    cat4_score = min(15.0, max(0.0, cat4_score))

    # ── Category 5: Material Reuse & Circularity (15 Points) ──
    cat5_score = 6.0
    cat5_strengths = ["C&D waste diversion strategy and circular site practices integrated."]
    cat5_recs = []
    if "aac" in wall_mat.lower() or "fly ash" in wall_mat.lower():
        cat5_score += 4.5
        cat5_strengths.append("Selected masonry utilizes industrial pozzolanic byproducts.")
    else:
        cat5_recs.append("Utilize broken brickbats for terrace brickbat coba waterproofing and soak pits.")

    if waste_pct <= 6.0:
        cat5_score += 4.5
        cat5_strengths.append("Rebar offcuts and mortar recovery systems preserve virgin materials.")
    else:
        cat5_recs.append("Repurpose steel cut-offs (>0.5m) for lintel ties, sunshade reinforcement and spacers.")

    cat5_score = min(15.0, max(0.0, cat5_score))

    # Compute Total Score
    total_raw = cat1_score + cat2_score + cat3_score + cat4_score + cat5_score
    final_score = int(round(min(100.0, max(0.0, total_raw))))
    grade = get_grade_and_band(final_score)

    categories = [
        CategoryScore(
            name="Material Efficiency",
            score=round(cat1_score, 1),
            max_score=25.0,
            percentage=round((cat1_score / 25.0) * 100.0, 1),
            strengths=cat1_strengths,
            recommendations=cat1_recs,
        ),
        CategoryScore(
            name="Waste Management",
            score=round(cat2_score, 1),
            max_score=20.0,
            percentage=round((cat2_score / 20.0) * 100.0, 1),
            strengths=cat2_strengths,
            recommendations=cat2_recs,
        ),
        CategoryScore(
            name="Carbon Performance",
            score=round(cat3_score, 1),
            max_score=25.0,
            percentage=round((cat3_score / 25.0) * 100.0, 1),
            strengths=cat3_strengths,
            recommendations=cat3_recs,
        ),
        CategoryScore(
            name="Sustainable Materials Selection",
            score=round(cat4_score, 1),
            max_score=15.0,
            percentage=round((cat4_score / 15.0) * 100.0, 1),
            strengths=cat4_strengths,
            recommendations=cat4_recs,
        ),
        CategoryScore(
            name="Material Reuse & Circularity",
            score=round(cat5_score, 1),
            max_score=15.0,
            percentage=round((cat5_score / 15.0) * 100.0, 1),
            strengths=cat5_strengths,
            recommendations=cat5_recs,
        ),
    ]

    # Legacy itemized breakdown items for full backward compatibility
    breakdown = [
        SustainabilityBreakdownItem(
            factor="Material Efficiency",
            points=round(cat1_score, 1),
            description="Structural sizing and low-carbon block masonry",
        ),
        SustainabilityBreakdownItem(
            factor="Waste Management",
            points=round(cat2_score, 1),
            description=f"Job-site waste control rated at {waste_pct:.1f}% vs CPWD norms",
        ),
        SustainabilityBreakdownItem(
            factor="Carbon Performance",
            points=round(cat3_score, 1),
            description=f"Embodied carbon rated at {carbon_intensity:.1f} kgCO₂e/sqft vs 36.0 baseline",
        ),
        SustainabilityBreakdownItem(
            factor="Sustainable Materials",
            points=round(cat4_score, 1),
            description="Renewable solar generation & rainwater recharge infrastructure",
        ),
        SustainabilityBreakdownItem(
            factor="Material Reuse & Circularity",
            points=round(cat5_score, 1),
            description="Non-structural waste diversion and byproduct recycling",
        ),
    ]

    return SustainabilityScoreResponse(
        score=final_score,
        band=grade,
        grade=grade,
        categories=categories,
        breakdown=breakdown,
        waste_percent=round(waste_pct, 1),
        carbon_footprint_kgco2e_per_sqft=round(carbon_intensity, 2),
        baseline_carbon_per_sqft=BASELINE_CARBON_PER_SQFT,
        penalty_factor=CARBON_PENALTY_FACTOR,
        estimate_id=estimate_id,
    )
