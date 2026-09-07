"""
Safe Material Reuse Rules Seed Data — EcoBuild AI
Defines safe, non-structural material circularity recommendations and structural warnings.
"""
from typing import List, Dict, Any

DEFAULT_REUSE_RULES: List[Dict[str, Any]] = [
    {
        "rule_id": "REUSE-BRK-01",
        "material": "Bricks & Broken Brickbats",
        "category": "Masonry",
        "safe_application": "Brickbat Coba Roof Waterproofing & Sunken Slab Filling",
        "suitability": "Ideal for broken clay bricks and partial bats from handling wastage.",
        "benefits": "Provides lightweight slope filling, excellent thermal insulation for top terrace, and drainage gradient for rainwater runoff.",
        "environmental_impact": "Diverts 100% of brick rubble from municipal C&D landfill; reduces virgin brick/gravel quarrying.",
        "estimated_savings_inr": "Saves ~Rs. 35 - 50 per sq.ft in specialized roof slope filling aggregates.",
        "safety_warning": "Ensure brickbats are thoroughly soaked in water before laying and covered with cement slurry to prevent hollow voids."
    },
    {
        "rule_id": "REUSE-BRK-02",
        "material": "Broken Bricks & Block Fragments",
        "category": "Masonry",
        "safe_application": "Compound Wall Foundation, Garden Pavers & Soakaway Pits",
        "suitability": "Surplus AAC or red brick pieces from door/window chasing.",
        "benefits": "Porous rubble creates natural percolation bed for rainwater recharge wells and durable sub-base for exterior garden walkways.",
        "environmental_impact": "Zero hauling emissions to dump sites; enhances local groundwater infiltration.",
        "estimated_savings_inr": "Saves purchase of dedicated gravel drainage stone (~Rs. 2,200 per truckload).",
        "safety_warning": "Not permitted for load-bearing structural foundations or retaining walls holding hydrostatic pressure."
    },
    {
        "rule_id": "REUSE-STL-01",
        "material": "TMT Rebar Cut-Offs (Lengths 0.5m - 1.5m)",
        "category": "Steel",
        "safe_application": "Door/Window Lintel Bands, Sunshade Ties & Chajja Reinforcement",
        "suitability": "Short straight offcuts produced during column and beam bar cutting.",
        "benefits": "Perfect secondary reinforcement for small spans (< 1.2m) where full 12m commercial bars would otherwise be chopped wastefully.",
        "environmental_impact": "Direct material preservation; saves embodied carbon of ~2.5 kg CO2e per kg of virgin steel.",
        "estimated_savings_inr": "Direct steel cost recovery of ~Rs. 65 - 75 per kg.",
        "safety_warning": "STRICT STRUCTURAL BAN: Never weld or lap off-cuts in primary RCC column cages, transfer girders, or earthquake shear links."
    },
    {
        "rule_id": "REUSE-STL-02",
        "material": "TMT Rebar Cut-Offs (< 0.5m) & Binding Wire",
        "category": "Steel",
        "safe_application": "Precast Boundary Fence Post Spacers, Manhole Covers & Pipe Hangers",
        "suitability": "Shortest rebar segments and tying wire remnants.",
        "benefits": "Can be cast into on-site precast concrete drainage covers, spacer blocks, and pipe supports.",
        "environmental_impact": "Avoids scrap pile rusting; provides durable non-structural ironmongery.",
        "estimated_savings_inr": "Replaces proprietary plastic cover blocks and factory fence posts.",
        "safety_warning": "Ensure adequate concrete cover (minimum 25mm) around scrap bars to prevent rust-jacking."
    },
    {
        "rule_id": "REUSE-AGG-01",
        "material": "Surplus Coarse Aggregate & Hard Concrete Rubble",
        "category": "Concrete & Aggregates",
        "safe_application": "Sub-Base Compaction Under Ground Floor Plinth & Driveways",
        "suitability": "Surplus stone aggregate and hardened clean concrete test cubes/washout lumps.",
        "benefits": "Forms an interlocking, well-drained soling layer under ground floor PCC mud mat and external vehicular driveways.",
        "environmental_impact": "Eliminates need for fresh quarry-mined boulder soling; conserves natural riverine resources.",
        "estimated_savings_inr": "Saves ~Rs. 30 per cu.ft compared to purchasing fresh 40mm sub-base metal.",
        "safety_warning": "Crushed concrete must be free from soil, wood chips, and gypsum plaster contaminants before compaction."
    },
    {
        "rule_id": "REUSE-SND-01",
        "material": "Plaster Rebound & Screened Surplus M-Sand",
        "category": "Sand",
        "safe_application": "Mortar for Non-Load Bearing Partition Plaster & Paver Bedding",
        "suitability": "Clean rebound mortar gathered on tarpaulin sheets during fresh wall plastering.",
        "benefits": "Can be immediately re-tempered with light water addition within initial setting time (30 mins) for skirting and low boundary walls.",
        "environmental_impact": "Reclaims up to 60% of vertical wall plaster rebound losses.",
        "estimated_savings_inr": "Saves ~Rs. 50 - 65 per bag of cement-sand mix.",
        "safety_warning": "Do NOT use dried rebound mortar older than 45 minutes; never use for ceiling plaster or wet area waterproofing."
    },
    {
        "rule_id": "REUSE-WOD-01",
        "material": "Timber Shuttering Plywood & Runner Offcuts",
        "category": "Formwork",
        "safe_application": "Perimeter Safety Barricades, Tool Storage Sheds & Material Staging Boxes",
        "suitability": "Formwork ply boards after reaching maximum reuse cycles (4-5 repetitions).",
        "benefits": "Provides durable weather barrier for site stores, worker rest shelters, and aggregate bay partitions.",
        "environmental_impact": "Prevents open-air timber burning on construction sites; reduces smoke and carbon release.",
        "estimated_savings_inr": "Eliminates purchase of corrugated GI sheets for temporary site sheds.",
        "safety_warning": "Remove all exposed protruding nails and wire ties with claw hammers before repurposing."
    }
]
