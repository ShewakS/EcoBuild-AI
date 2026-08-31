"""
Seed script — inserts default rates for all cost items into the rate_master
collection. These serve as system-provided fallback rates (is_default=True).
Run once: python seed/default_rates.py

Safe to re-run: checks if default rates already exist and skips if they do.
"""
import asyncio
import sys
import os
from datetime import datetime, timezone

# Allow imports from parent directory
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import get_db, RATE_MASTER_COLLECTION

# ─── Tamil Nadu Baseline Rates (August 2026) ──────────────────────────────────
DEFAULT_RATES = [
    # ── Materials ─────────────────────────────────────────────────────────────
    {
        "item_name": "Cement (Portland OPC 53)",
        "category": "Material",
        "unit": "bag",
        "rate_value": 380.0,
        "district": "default",
        "updated_by": "system",
        "is_default": True,
        "notes": "50 kg bag; Ariyalur belt pricing",
    },
    {
        "item_name": "Reinforcement Steel (TMT Fe500)",
        "category": "Material",
        "unit": "ton",
        "rate_value": 68000.0,
        "district": "default",
        "updated_by": "system",
        "is_default": True,
        "notes": "Per metric ton; includes GST",
    },
    {
        "item_name": "M-Sand (Fine Aggregate)",
        "category": "Material",
        "unit": "ton",
        "rate_value": 1800.0,
        "district": "default",
        "updated_by": "system",
        "is_default": True,
        "notes": "Manufactured sand; preferred due to river-sand restrictions",
    },
    {
        "item_name": "Coarse Aggregate (20mm)",
        "category": "Material",
        "unit": "ton",
        "rate_value": 1200.0,
        "district": "default",
        "updated_by": "system",
        "is_default": True,
        "notes": "20mm crushed granite aggregate",
    },
    {
        "item_name": "Burnt Clay Bricks",
        "category": "Material",
        "unit": "count",
        "rate_value": 9.0,
        "district": "default",
        "updated_by": "system",
        "is_default": True,
        "notes": "Standard 230x115x75mm bricks; also applies to AAC/Hollow block equivalents",
    },
    # ── Labour ────────────────────────────────────────────────────────────────
    {
        "item_name": "Skilled Labour (Mason/Carpenter)",
        "category": "Labour",
        "unit": "day",
        "rate_value": 900.0,
        "district": "default",
        "updated_by": "system",
        "is_default": True,
        "notes": "Per man-day; Tamil Nadu PWD Schedule of Rates 2025",
    },
    {
        "item_name": "Unskilled Labour (Helper)",
        "category": "Labour",
        "unit": "day",
        "rate_value": 550.0,
        "district": "default",
        "updated_by": "system",
        "is_default": True,
        "notes": "Per man-day; helper/coolie rate",
    },
    # ── Electrical ────────────────────────────────────────────────────────────
    {
        "item_name": "Electrical Point Wiring",
        "category": "Electrical",
        "unit": "point",
        "rate_value": 2500.0,
        "district": "default",
        "updated_by": "system",
        "is_default": True,
        "notes": "Per electrical point including conduit, wire, switch & socket",
    },
    # ── Plumbing ──────────────────────────────────────────────────────────────
    {
        "item_name": "Plumbing Fixture Installation",
        "category": "Plumbing",
        "unit": "fixture",
        "rate_value": 4500.0,
        "district": "default",
        "updated_by": "system",
        "is_default": True,
        "notes": "Per fixture; includes supply/waste piping stub-up + fitting",
    },
    # ── Painting ──────────────────────────────────────────────────────────────
    {
        "item_name": "Interior Painting (2 coats emulsion)",
        "category": "Painting",
        "unit": "sqft",
        "rate_value": 28.0,
        "district": "default",
        "updated_by": "system",
        "is_default": True,
        "notes": "Includes primer + 2 coats interior emulsion; labour + material",
    },
    {
        "item_name": "Exterior Painting (weather coat)",
        "category": "Painting",
        "unit": "sqft",
        "rate_value": 22.0,
        "district": "default",
        "updated_by": "system",
        "is_default": True,
        "notes": "Exterior weatherproof coat; labour + material",
    },
    # ── Finishing ─────────────────────────────────────────────────────────────
    {
        "item_name": "Floor Finishing (tiles + laying)",
        "category": "Finishing",
        "unit": "sqft",
        "rate_value": 180.0,
        "district": "default",
        "updated_by": "system",
        "is_default": True,
        "notes": "Vitrified tile + adhesive + grouting + labour; Standard grade",
    },
    {
        "item_name": "Door/Window Frame Finishing",
        "category": "Finishing",
        "unit": "unit",
        "rate_value": 8500.0,
        "district": "default",
        "updated_by": "system",
        "is_default": True,
        "notes": "Per door/window unit; teak frame + shutter + hardware",
    },
    # ── Approval & Misc ───────────────────────────────────────────────────────
    {
        "item_name": "Approval & Misc (flat %)",
        "category": "Approval-Misc",
        "unit": "%",
        "rate_value": 4.0,
        "district": "default",
        "updated_by": "system",
        "is_default": True,
        "notes": "Covers CMDA/DTCP approval fees, site supervision, contingencies",
    },
]

# ─── District-specific overrides for Chennai ──────────────────────────────────
CHENNAI_OVERRIDES = [
    {
        "item_name": "Reinforcement Steel (TMT Fe500)",
        "category": "Material",
        "unit": "ton",
        "rate_value": 72000.0,
        "district": "Chennai",
        "updated_by": "system",
        "is_default": True,
        "notes": "Chennai premium; higher transport cost",
    },
    {
        "item_name": "Skilled Labour (Mason/Carpenter)",
        "category": "Labour",
        "unit": "day",
        "rate_value": 1100.0,
        "district": "Chennai",
        "updated_by": "system",
        "is_default": True,
        "notes": "Chennai skilled labour rate (higher cost of living)",
    },
    {
        "item_name": "Unskilled Labour (Helper)",
        "category": "Labour",
        "unit": "day",
        "rate_value": 650.0,
        "district": "Chennai",
        "updated_by": "system",
        "is_default": True,
        "notes": "Chennai unskilled labour rate",
    },
    {
        "item_name": "Electrical Point Wiring",
        "category": "Electrical",
        "unit": "point",
        "rate_value": 3000.0,
        "district": "Chennai",
        "updated_by": "system",
        "is_default": True,
        "notes": "Chennai; higher material + labour cost",
    },
    {
        "item_name": "Plumbing Fixture Installation",
        "category": "Plumbing",
        "unit": "fixture",
        "rate_value": 5500.0,
        "district": "Chennai",
        "updated_by": "system",
        "is_default": True,
        "notes": "Chennai plumbing rate",
    },
]


async def seed():
    db = get_db()
    col = db[RATE_MASTER_COLLECTION]

    # Check if defaults already exist
    existing_count = await col.count_documents({"is_default": True, "district": "default"})
    if existing_count > 0:
        print(f"[OK] {existing_count} default rates already exist -- skipping seed.")
        return

    now = datetime.now(timezone.utc)
    all_docs = []

    for rate in DEFAULT_RATES + CHENNAI_OVERRIDES:
        doc = {**rate, "effective_date": now}
        all_docs.append(doc)

    result = await col.insert_many(all_docs)
    print(f"[OK] Seeded {len(result.inserted_ids)} default rate entries into '{RATE_MASTER_COLLECTION}'.")

    # Create indexes for efficient querying
    await col.create_index([("item_name", 1), ("district", 1), ("effective_date", -1)])
    await col.create_index([("category", 1)])
    await col.create_index([("effective_date", -1)])
    print("[OK] MongoDB indexes created.")


if __name__ == "__main__":
    asyncio.run(seed())
