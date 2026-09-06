"""
Carbon Emission Service — IFC Indian Emission Factors Calculation Engine.

Parses EcoBuild_Carbon_Emission_Factors_IFC_India.xlsx and calculates:
1. Embodied Carbon Footprint (kg CO2e and metric tons tCO2e) per material and total.
2. Carbon Intensity (kg CO2e / sqft and kg CO2e / m2).
3. Total Embodied Energy (MJ and GJ).
4. Green Building Certification Rating Benchmarks (GRIHA / IGBC / EDGE).
5. Low-Carbon Material Substitution Suggestions & Savings.
"""
import os
import pandas as pd
from pathlib import Path
from typing import Optional, Any
from models.project_estimate import (
    ProjectInputs,
    MLQuantities,
    DerivedQuantities,
    MaterialCarbonItem,
    CarbonFootprint,
)

EXCEL_PATH = Path(__file__).parent.parent / "EcoBuild_Carbon_Emission_Factors_IFC_India.xlsx"

# Global cached factors dataframe and lookup dictionary
_FACTORS_DF: Optional[pd.DataFrame] = None
_FACTORS_MAP: dict[str, dict[str, Any]] = {}


def load_carbon_factors_df() -> pd.DataFrame:
    """Loads and caches the IFC Indian Carbon Emission Factors Excel dataset."""
    global _FACTORS_DF, _FACTORS_MAP
    if _FACTORS_DF is not None:
        return _FACTORS_DF

    if not os.path.exists(EXCEL_PATH):
        raise FileNotFoundError(
            f"IFC Carbon factors Excel file not found at '{EXCEL_PATH}'. Ensure EcoBuild_Carbon_Emission_Factors_IFC_India.xlsx is present."
        )

    df = pd.read_excel(EXCEL_PATH)
    # Clean up column names and string fields
    df.columns = [c.strip() for c in df.columns]
    _FACTORS_DF = df

    # Populate quick lookup map
    for _, row in df.iterrows():
        name = str(row["material_name"]).strip()
        _FACTORS_MAP[name] = {
            "material_name": name,
            "embodied_energy_MJ_per_kg": float(row["embodied_energy_MJ_per_kg"]),
            "GWP_kgCO2e_per_kg": float(row["GWP_kgCO2e_per_kg"]),
            "reference_density_kg_per_m3": (
                float(row["reference_density_kg_per_m3"])
                if pd.notna(row.get("reference_density_kg_per_m3"))
                else None
            ),
        }

    return _FACTORS_DF


def get_all_ifc_factors() -> list[dict[str, Any]]:
    """Returns all 100 IFC Indian material emission factors as a clean list of dicts."""
    load_carbon_factors_df()
    return list(_FACTORS_MAP.values())


def get_factor_for(material_name: str, fallback_gwp: float = 0.5, fallback_ee: float = 5.0) -> tuple[float, float, str]:
    """
    Returns (GWP_kgCO2e_per_kg, EmbodiedEnergy_MJ_per_kg, matched_ifc_name).
    """
    load_carbon_factors_df()
    if material_name in _FACTORS_MAP:
        data = _FACTORS_MAP[material_name]
        return data["GWP_kgCO2e_per_kg"], data["embodied_energy_MJ_per_kg"], material_name

    # Fuzzy match by key substring
    m_lower = material_name.lower()
    for name, data in _FACTORS_MAP.items():
        if m_lower in name.lower() or name.lower() in m_lower:
            return data["GWP_kgCO2e_per_kg"], data["embodied_energy_MJ_per_kg"], name

    return fallback_gwp, fallback_ee, material_name


def calculate_carbon_footprint(
    inputs: ProjectInputs,
    ml_quantities: MLQuantities,
    derived: DerivedQuantities,
) -> CarbonFootprint:
    """
    Calculates the complete embodied carbon footprint from the IFC dataset.
    """
    load_carbon_factors_df()
    items: list[MaterialCarbonItem] = []

    area_sqft = inputs.built_up_area_sqft
    floors = inputs.floors

    # ── 1. Cement (OPC / PPC / Slag) ──────────────────────────────────────────
    cement_bags = ml_quantities.cement_bags
    cement_weight_kg = cement_bags * 50.0  # 50kg per bag
    c_gwp, c_ee, c_ifc_name = get_factor_for("Cement (ordinary Portland cement, OPC)")
    c_co2_kg = cement_weight_kg * c_gwp
    c_ee_mj = cement_weight_kg * c_ee
    items.append(
        MaterialCarbonItem(
            material_name="Cement (Portland OPC 53)",
            ifc_reference_name=c_ifc_name,
            quantity=cement_bags,
            unit="bags",
            weight_kg=round(cement_weight_kg, 1),
            gwp_factor_kgco2e_per_kg=c_gwp,
            embodied_energy_mj_per_kg=c_ee,
            carbon_emission_kg=round(c_co2_kg, 1),
            carbon_emission_tons=round(c_co2_kg / 1000.0, 2),
            embodied_energy_mj=round(c_ee_mj, 1),
            share_pct=0.0,  # calculated below
            green_alternative="Switch to Fly-Ash / Pozzolana Cement (PPC) to reduce carbon by ~30% (saves ~0.27 kg CO2e/kg).",
        )
    )

    # ── 2. Reinforcement Steel ────────────────────────────────────────────────
    steel_kg = (
        ml_quantities.steel_kg
        if (ml_quantities.steel_kg and ml_quantities.steel_kg > 0)
        else ml_quantities.steel_tons * 1000.0
    )
    s_gwp, s_ee, s_ifc_name = get_factor_for("Steel reinforcement (steel rebar)")
    s_co2_kg = steel_kg * s_gwp
    s_ee_mj = steel_kg * s_ee
    items.append(
        MaterialCarbonItem(
            material_name="Reinforcement Steel (TMT Rebar)",
            ifc_reference_name=s_ifc_name,
            quantity=ml_quantities.steel_tons,
            unit="tons",
            weight_kg=round(steel_kg, 1),
            gwp_factor_kgco2e_per_kg=s_gwp,
            embodied_energy_mj_per_kg=s_ee,
            carbon_emission_kg=round(s_co2_kg, 1),
            carbon_emission_tons=round(s_co2_kg / 1000.0, 2),
            embodied_energy_mj=round(s_ee_mj, 1),
            share_pct=0.0,
            green_alternative="Specify recycled scrap EAF steel (Electric Arc Furnace) with GWP 0.83 kgCO2e/kg (saves ~68% carbon).",
        )
    )

    # ── 3. Bricks / Wall Masonry Blocks ───────────────────────────────────────
    brick_count = ml_quantities.brick_count
    wall_mat = inputs.wall_material

    if wall_mat == "AAC Block":
        b_ifc = "Aircrete (autoclaved aerated concrete)"
        b_gwp, b_ee, b_ifc_name = get_factor_for(b_ifc)
        unit_weight = 9.0  # 600x200x150 mm block @ 500 kg/m3
        b_alt = "AAC blocks offer optimal thermal insulation and low carbon per volume."
    elif wall_mat == "Hollow Block":
        b_ifc = "Medium density concrete block"
        b_gwp, b_ee, b_ifc_name = get_factor_for(b_ifc)
        unit_weight = 15.0
        b_alt = "Consider FaLG (Fly ash/lime/gypsum) blocks for 30% lower carbon."
    elif wall_mat == "Stone":
        b_ifc = "Polished stone cladding"
        b_gwp, b_ee, b_ifc_name = get_factor_for(b_ifc)
        unit_weight = 18.0
        b_alt = "Locally sourced random rubble stone has minimal manufacturing carbon footprint."
    else:  # Brick
        b_ifc = "Brick (common/facing)"
        b_gwp, b_ee, b_ifc_name = get_factor_for(b_ifc)
        unit_weight = 3.1  # standard 9-inch table moulded red brick ~3.1 kg
        b_alt = "Replace traditional clamp-kiln red bricks with AAC Blocks or FaLG blocks to save up to 40% carbon."

    brick_weight_kg = brick_count * unit_weight
    b_co2_kg = brick_weight_kg * b_gwp
    b_ee_mj = brick_weight_kg * b_ee
    items.append(
        MaterialCarbonItem(
            material_name=f"{wall_mat} Wall Masonry",
            ifc_reference_name=b_ifc_name,
            quantity=brick_count,
            unit="units",
            weight_kg=round(brick_weight_kg, 1),
            gwp_factor_kgco2e_per_kg=b_gwp,
            embodied_energy_mj_per_kg=b_ee,
            carbon_emission_kg=round(b_co2_kg, 1),
            carbon_emission_tons=round(b_co2_kg / 1000.0, 2),
            embodied_energy_mj=round(b_ee_mj, 1),
            share_pct=0.0,
            green_alternative=b_alt,
        )
    )

    # ── 4. M-Sand (Fine Aggregate) ────────────────────────────────────────────
    sand_kg = ml_quantities.sand_tons * 1000.0
    sa_gwp, sa_ee, sa_ifc_name = get_factor_for("Sand")
    sa_co2_kg = sand_kg * sa_gwp
    sa_ee_mj = sand_kg * sa_ee
    items.append(
        MaterialCarbonItem(
            material_name="M-Sand (Fine Aggregate)",
            ifc_reference_name=sa_ifc_name,
            quantity=ml_quantities.sand_tons,
            unit="tons",
            weight_kg=round(sand_kg, 1),
            gwp_factor_kgco2e_per_kg=sa_gwp,
            embodied_energy_mj_per_kg=sa_ee,
            carbon_emission_kg=round(sa_co2_kg, 1),
            carbon_emission_tons=round(sa_co2_kg / 1000.0, 2),
            embodied_energy_mj=round(sa_ee_mj, 1),
            share_pct=0.0,
            green_alternative="Manufactured sand (M-Sand) avoids riverbed depletion and satisfies Indian Green Building standards.",
        )
    )

    # ── 5. Coarse Aggregate (20mm Blue Metal) ─────────────────────────────────
    agg_kg = ml_quantities.aggregate_tons * 1000.0
    ag_gwp, ag_ee, ag_ifc_name = get_factor_for("Aggregate (mixed gravel/crushed stone)")
    ag_co2_kg = agg_kg * ag_gwp
    ag_ee_mj = agg_kg * ag_ee
    items.append(
        MaterialCarbonItem(
            material_name="Coarse Aggregate (20mm Blue Metal)",
            ifc_reference_name=ag_ifc_name,
            quantity=ml_quantities.aggregate_tons,
            unit="tons",
            weight_kg=round(agg_kg, 1),
            gwp_factor_kgco2e_per_kg=ag_gwp,
            embodied_energy_mj_per_kg=ag_ee,
            carbon_emission_kg=round(ag_co2_kg, 1),
            carbon_emission_tons=round(ag_co2_kg / 1000.0, 2),
            embodied_energy_mj=round(ag_ee_mj, 1),
            share_pct=0.0,
            green_alternative="Use recycled concrete aggregates (RCA) for sub-base and non-structural components.",
        )
    )

    # ── 6. Flooring Material ──────────────────────────────────────────────────
    floor_sqft = area_sqft * floors
    floor_type = inputs.flooring
    if "Marble" in floor_type or "Granite" in floor_type:
        fl_ifc = "Stone floor tile"
        fl_gwp, fl_ee, fl_ifc_name = get_factor_for(fl_ifc)
        fl_weight = floor_sqft * 4.65  # ~50 kg/m2
        fl_alt = "Natural granite and marble carry very low chemical embodied carbon compared to glazed tiles."
    else:
        fl_ifc = "Vitrified ceramic floor tiles"
        fl_gwp, fl_ee, fl_ifc_name = get_factor_for(fl_ifc)
        fl_weight = floor_sqft * 2.04  # ~22 kg/m2
        fl_alt = "Select low-temperature kiln terracotta or locally manufactured ceramic tiles to reduce footprint."

    fl_co2_kg = fl_weight * fl_gwp
    fl_ee_mj = fl_weight * fl_ee
    items.append(
        MaterialCarbonItem(
            material_name=f"Flooring ({floor_type})",
            ifc_reference_name=fl_ifc_name,
            quantity=round(floor_sqft, 1),
            unit="sqft",
            weight_kg=round(fl_weight, 1),
            gwp_factor_kgco2e_per_kg=fl_gwp,
            embodied_energy_mj_per_kg=fl_ee,
            carbon_emission_kg=round(fl_co2_kg, 1),
            carbon_emission_tons=round(fl_co2_kg / 1000.0, 2),
            embodied_energy_mj=round(fl_ee_mj, 1),
            share_pct=0.0,
            green_alternative=fl_alt,
        )
    )

    # ── 7. Wall Plaster & Finishes ────────────────────────────────────────────
    paintable_sqft = derived.paintable_area_sqft
    plaster_weight_kg = paintable_sqft * 1.5  # ~15 kg/m2 of 12mm plaster
    pl_gwp, pl_ee, pl_ifc_name = get_factor_for("Cement based plaster")
    pl_co2_kg = plaster_weight_kg * pl_gwp
    pl_ee_mj = plaster_weight_kg * pl_ee
    items.append(
        MaterialCarbonItem(
            material_name="Wall Plaster & Render",
            ifc_reference_name=pl_ifc_name,
            quantity=round(paintable_sqft, 1),
            unit="sqft",
            weight_kg=round(plaster_weight_kg, 1),
            gwp_factor_kgco2e_per_kg=pl_gwp,
            embodied_energy_mj_per_kg=pl_ee,
            carbon_emission_kg=round(pl_co2_kg, 1),
            carbon_emission_tons=round(pl_co2_kg / 1000.0, 2),
            embodied_energy_mj=round(pl_ee_mj, 1),
            share_pct=0.0,
            green_alternative="Adopt gypsum plaster or lime-pozzolana mortar for internal walls (saves ~75% plaster carbon).",
        )
    )

    # ── Compute Totals & Percentage Shares ────────────────────────────────────
    total_carbon_kg = sum(it.carbon_emission_kg for it in items)
    total_ee_mj = sum(it.embodied_energy_mj for it in items)

    for it in items:
        if total_carbon_kg > 0:
            it.share_pct = round((it.carbon_emission_kg / total_carbon_kg) * 100.0, 1)

    total_carbon_tons = round(total_carbon_kg / 1000.0, 2)
    carbon_intensity_sqft = round(total_carbon_kg / max(1.0, area_sqft * floors), 2)
    carbon_intensity_m2 = round(carbon_intensity_sqft * 10.764, 2)
    total_ee_gj = round(total_ee_mj / 1000.0, 2)

    # ── Sustainable Add-on Offsets ────────────────────────────────────────────
    solar_offset_kg = 3400.0 if inputs.solar_panels else 0.0  # 4kW rooftop solar offsets ~3.4 tons CO2e/year
    rwh_offset_kg = 220.0 if inputs.rainwater_harvesting else 0.0

    # ── Green Rating Evaluation (GRIHA / IGBC / EDGE Benchmark) ───────────────
    # Standard residential benchmark in India: ~350 - 450 kg CO2e / m2 (~32 - 42 kg CO2e / sqft)
    if carbon_intensity_sqft <= 26.0:
        green_rating = "IGBC Platinum / 5-Star GRIHA (Ultra Low Carbon)"
    elif carbon_intensity_sqft <= 33.0:
        green_rating = "IGBC Gold / 4-Star GRIHA (Eco-Optimized)"
    elif carbon_intensity_sqft <= 40.0:
        green_rating = "IGBC Silver / 3-Star GRIHA (Standard Green)"
    else:
        green_rating = "Conventional Construction (High Carbon Potential)"

    reduction_tips = [
        "Replacing OPC with PPC (Fly-Ash) Cement saves up to 30% of total structural emissions.",
        "AAC or FaLG blocks reduce masonry embodied carbon by 35–45% compared to burnt clay bricks.",
        "Rooftop solar PV and rainwater harvesting systems offset operational emissions from day one.",
    ]

    return CarbonFootprint(
        total_carbon_kg=round(total_carbon_kg, 1),
        total_carbon_tons=total_carbon_tons,
        carbon_intensity_kg_per_sqft=carbon_intensity_sqft,
        carbon_intensity_kg_per_m2=carbon_intensity_m2,
        total_embodied_energy_mj=round(total_ee_mj, 1),
        total_embodied_energy_gj=total_ee_gj,
        annual_solar_offset_kg=solar_offset_kg,
        annual_rwh_offset_kg=rwh_offset_kg,
        green_rating=green_rating,
        materials=items,
        dataset_source="IFC Indian Construction Emission Factors (IFC India Database)",
        reduction_tips=reduction_tips,
    )
