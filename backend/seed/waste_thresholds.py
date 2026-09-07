"""
Waste Reference Thresholds Seed Data — EcoBuild AI
Contains authentic Indian standard benchmarks from CPWD, BMTPC, and NICMAR.
"""
from typing import List, Dict, Any

DEFAULT_WASTE_THRESHOLDS: List[Dict[str, Any]] = [
    {
        "material_key": "cement",
        "material_name": "Cement (PPC / OPC)",
        "unit": "Bags (50kg)",
        "min_waste_percent": 3.0,
        "max_waste_percent": 6.0,
        "default_waste_percent": 4.5,
        "standard_source": "BMTPC C&D Waste Management Guidelines & CPWD Works Manual Section 4",
        "primary_causes": "Handling bag tears, moisture absorption during site storage, batching hopper spillage, and mortar wash.",
        "risk_levels": {
            "low": "<= 3.0%",
            "normal": "3.1% - 6.0%",
            "high": "> 6.0%"
        },
        "mitigation_strategies": [
            "Store bags in covered, elevated timber pallets away from damp walls.",
            "Enforce FIFO (First-In, First-Out) stock rotation to prevent moisture lumping.",
            "Use ready-mix concrete (RMC) for large pours to eliminate site bag losses."
        ]
    },
    {
        "material_key": "steel",
        "material_name": "Structural Steel / TMT Rebar",
        "unit": "Tonnes",
        "min_waste_percent": 3.0,
        "max_waste_percent": 5.0,
        "default_waste_percent": 3.8,
        "standard_source": "CPWD Schedule of Rates (SOR) & NICMAR Structural Rebar Studies",
        "primary_causes": "Cutting off-cuts from standard 12m commercial lengths, excessive overlap splices, and rust wastage.",
        "risk_levels": {
            "low": "<= 3.0%",
            "normal": "3.1% - 5.0%",
            "high": "> 5.0%"
        },
        "mitigation_strategies": [
            "Prepare detailed Bar Bending Schedules (BBS) with 1D cut optimization software.",
            "Procure factory cut-and-bend rebar directly from certified rebar processors.",
            "Segregate offcuts >= 1.0m for lintels, sunshades, and boundary post ties."
        ]
    },
    {
        "material_key": "bricks",
        "material_name": "Bricks / AAC Blocks",
        "unit": "Pieces / Blocks",
        "min_waste_percent": 5.0,
        "max_waste_percent": 10.0,
        "default_waste_percent": 7.0,
        "standard_source": "BMTPC Masonry Guidelines & CPWD Specifications Subhead 6 (Brickwork)",
        "primary_causes": "Impact breakage during manual truck tipping/unloading, non-modular chisel cutting for wall chases and jambs.",
        "risk_levels": {
            "low": "<= 5.0%",
            "normal": "5.1% - 10.0%",
            "high": "> 10.0%"
        },
        "mitigation_strategies": [
            "Demand palletized truck delivery with crane or forklift offloading.",
            "Adopt modular design grid aligning with standard block dimensions.",
            "Provide electric rotary saw cutters on site rather than hammer-and-chisel cutting."
        ]
    },
    {
        "material_key": "sand",
        "material_name": "Sand / Fine Aggregate (M-Sand)",
        "unit": "Cu.Ft / Brass",
        "min_waste_percent": 5.0,
        "max_waste_percent": 10.0,
        "default_waste_percent": 7.5,
        "standard_source": "CPWD Specifications Subhead 3 (Mortar) & NICMAR Residential Waste Studies",
        "primary_causes": "Rain runoff washing away ground heaps, wind dispersal, vehicle track churn, and plastering rebound loss.",
        "risk_levels": {
            "low": "<= 5.0%",
            "normal": "5.1% - 10.0%",
            "high": "> 10.0%"
        },
        "mitigation_strategies": [
            "Construct enclosed three-sided storage bays with concrete aprons and tarpaulin covers.",
            "Spread clean tarpaulin sheets at wall bases during plastering to recover and re-temper rebound mortar.",
            "Switch to Manufactured Sand (M-Sand) which has uniform grading and less bulk loss."
        ]
    },
    {
        "material_key": "aggregate",
        "material_name": "Coarse Aggregate (20mm / 10mm)",
        "unit": "Cu.Ft / Brass",
        "min_waste_percent": 3.0,
        "max_waste_percent": 6.0,
        "default_waste_percent": 4.0,
        "standard_source": "CPWD Specifications Subhead 4 (Concrete Work) & Indian Concrete Journal",
        "primary_causes": "Stockpile sinking into unpaved muddy soil, transit spillage during manual trolley transport.",
        "risk_levels": {
            "low": "<= 3.0%",
            "normal": "3.1% - 6.0%",
            "high": "> 6.0%"
        },
        "mitigation_strategies": [
            "Always store aggregates on paved hard-standing platforms.",
            "Use mechanical batchers and concrete bucket hoists for vertical transport."
        ]
    },
    {
        "material_key": "paint",
        "material_name": "Paint & Primer",
        "unit": "Litres",
        "min_waste_percent": 5.0,
        "max_waste_percent": 8.0,
        "default_waste_percent": 6.0,
        "standard_source": "CPWD Specifications Subhead 13 (Finishing Works)",
        "primary_causes": "Can lid skinning and drying, roller/brush residual entrapment, surface over-absorption from inadequate priming.",
        "risk_levels": {
            "low": "<= 5.0%",
            "normal": "5.1% - 8.0%",
            "high": "> 8.0%"
        },
        "mitigation_strategies": [
            "Tightly reseal opened containers immediately after pouring.",
            "Apply high-quality sealer/primer coat to avoid substrate over-absorption."
        ]
    }
]
