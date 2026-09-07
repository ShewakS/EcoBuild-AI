"""
Waste Service — EcoBuild AI
Calculates authentic CPWD, BMTPC, and NICMAR material wastage, risk tiers, and financial impacts.
"""
from typing import List, Dict, Any, Optional
from config import get_db, WASTE_THRESHOLDS_COLLECTION
from seed.waste_thresholds import DEFAULT_WASTE_THRESHOLDS
from models.waste import (
    WasteMaterialInput,
    WasteMaterialResult,
    WasteCalculationResponse,
)


async def ensure_waste_thresholds_seeded():
    db = get_db()
    collection = db[WASTE_THRESHOLDS_COLLECTION]
    count = await collection.count_documents({})
    if count == 0:
        await collection.insert_many([dict(item) for item in DEFAULT_WASTE_THRESHOLDS])


async def get_waste_thresholds() -> List[Dict[str, Any]]:
    db = get_db()
    collection = db[WASTE_THRESHOLDS_COLLECTION]
    cursor = collection.find({}, {"_id": 0})
    items = await cursor.to_list(length=50)
    if not items:
        return DEFAULT_WASTE_THRESHOLDS
    return items


def classify_risk(waste_pct: float, min_val: float, max_val: float) -> str:
    if waste_pct <= min_val:
        return "Low"
    elif waste_pct <= max_val:
        return "Normal"
    else:
        return "High"


async def calculate_waste_analysis(
    materials_input: List[WasteMaterialInput]
) -> WasteCalculationResponse:
    thresholds = await get_waste_thresholds()
    threshold_map = {t["material_key"].lower(): t for t in thresholds}

    material_results: List[WasteMaterialResult] = []
    total_loss_inr = 0.0
    waste_percentages: List[float] = []

    for item in materials_input:
        m_key = item.material_key.lower().strip()
        matched = threshold_map.get(m_key)
        
        # Fuzzy match fallback if not exact key
        if not matched:
            for k, t in threshold_map.items():
                if k in m_key or m_key in k:
                    matched = t
                    break

        if not matched:
            # Generic default if unrecognized
            min_p, max_p, def_p = 3.0, 7.0, 5.0
            name = item.material_key.capitalize()
            source = "General Indian Construction Practice (IS 1200)"
            causes = "Handling, loading, transit and storage losses."
            mitigation = ["Implement standard on-site inventory controls."]
        else:
            min_p = float(matched["min_waste_percent"])
            max_p = float(matched["max_waste_percent"])
            def_p = float(matched["default_waste_percent"])
            name = matched["material_name"]
            source = matched["standard_source"]
            causes = matched["primary_causes"]
            mitigation = matched["mitigation_strategies"]

        applied_pct = item.custom_waste_percent if item.custom_waste_percent is not None else def_p
        waste_qty = round((item.quantity * applied_pct) / 100.0, 2)
        risk_level = classify_risk(applied_pct, min_p, max_p)
        financial_loss = round(waste_qty * float(item.unit_rate_inr), 2)
        total_loss_inr += financial_loss
        waste_percentages.append(applied_pct)

        material_results.append(
            WasteMaterialResult(
                material_key=item.material_key,
                material_name=name,
                planned_quantity=item.quantity,
                unit=item.unit or matched.get("unit", "") if matched else "",
                min_waste_percent=min_p,
                max_waste_percent=max_p,
                applied_waste_percent=applied_pct,
                estimated_waste_quantity=waste_qty,
                waste_risk_level=risk_level,
                unit_rate_inr=float(item.unit_rate_inr),
                estimated_financial_loss_inr=financial_loss,
                standard_source=source,
                primary_causes=causes,
                mitigation_strategies=mitigation,
            )
        )

    avg_pct = round(sum(waste_percentages) / len(waste_percentages), 2) if waste_percentages else 5.0
    overall_risk = "Normal"
    if any(m.waste_risk_level == "High" for m in material_results):
        overall_risk = "High"
    elif all(m.waste_risk_level == "Low" for m in material_results):
        overall_risk = "Low"

    return WasteCalculationResponse(
        total_financial_loss_inr=round(total_loss_inr, 2),
        average_waste_percent=avg_pct,
        overall_waste_risk=overall_risk,
        materials=material_results,
        benchmarks_source="CPWD Works Manual, BMTPC C&D Guidelines & NICMAR Construction Waste Studies",
    )
