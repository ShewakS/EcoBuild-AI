import { useState, useMemo } from 'react';
import {
  PieChart,
  BarChart3,
  Sliders,
  Leaf,
  RotateCcw,
  Check,
  Zap,
  Boxes,
  HardHat,
  Wrench,
  Palette,
  Sparkles,
  ClipboardList,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

function fmt(n) {
  if (isNaN(n) || n === null || n === undefined) return '₹0';
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)} L`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export default function CostEstimatorEnhancements({ estimate, onUpdateBreakdown }) {
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' | 'overrides' | 'eco_comparison' | 'volatility'

  // ── Baseline Data ──────────────────────────────────────────────────────────
  const baseBreakdown = estimate?.breakdown || {
    material_cost: 0,
    labour_cost: 0,
    electrical_cost: 0,
    plumbing_cost: 0,
    painting_cost: 0,
    finishing_cost: 0,
    approval_misc_cost: 0,
    total_cost: 0,
  };
  const baseTotal = baseBreakdown.total_cost || 1;
  const builtUpArea = estimate?.inputs?.built_up_area_sqft || 1500;
  const floors = estimate?.inputs?.floors || 1;
  const totalArea = builtUpArea * floors;

  // ── OPTION A: CPWD Rate Overrides & Multipliers ────────────────────────────
  const [cpwdMultiplier, setCpwdMultiplier] = useState(1.0); // 0.8 to 1.3
  const [customRates, setCustomRates] = useState({
    cement: 420, // per bag
    steel: 68, // per kg
    bricks: 11, // per unit
    sand: 65, // per cuft
    mason: 1100, // per day
    helper: 650, // per day
  });

  // Calculate overridden total cost & breakdown based on rate tweaks
  const overriddenBreakdown = useMemo(() => {
    const defaultCementRate = 420;
    const defaultSteelRate = 68;
    const defaultBrickRate = 11;
    const defaultSandRate = 65;
    const defaultMasonRate = 1100;
    const defaultHelperRate = 650;

    // Rate ratio factor from custom rates
    const cementRatio = customRates.cement / defaultCementRate;
    const steelRatio = customRates.steel / defaultSteelRate;
    const brickRatio = customRates.bricks / defaultBrickRate;
    const sandRatio = customRates.sand / defaultSandRate;
    const materialCustomFactor = (cementRatio + steelRatio + brickRatio + sandRatio) / 4;

    const masonRatio = customRates.mason / defaultMasonRate;
    const helperRatio = customRates.helper / defaultHelperRate;
    const labourCustomFactor = (masonRatio * 0.7) + (helperRatio * 0.3);

    const mat = Math.round(baseBreakdown.material_cost * cpwdMultiplier * materialCustomFactor);
    const lab = Math.round(baseBreakdown.labour_cost * cpwdMultiplier * labourCustomFactor);
    const ele = Math.round(baseBreakdown.electrical_cost * cpwdMultiplier);
    const plu = Math.round(baseBreakdown.plumbing_cost * cpwdMultiplier);
    const pai = Math.round(baseBreakdown.painting_cost * cpwdMultiplier);
    const fin = Math.round(baseBreakdown.finishing_cost * cpwdMultiplier);
    const app = Math.round(baseBreakdown.approval_misc_cost * cpwdMultiplier);
    const tot = mat + lab + ele + plu + pai + fin + app;

    return {
      material_cost: mat,
      labour_cost: lab,
      electrical_cost: ele,
      plumbing_cost: plu,
      painting_cost: pai,
      finishing_cost: fin,
      approval_misc_cost: app,
      total_cost: tot,
    };
  }, [baseBreakdown, cpwdMultiplier, customRates]);

  const handleResetOverrides = () => {
    setCpwdMultiplier(1.0);
    setCustomRates({
      cement: 420,
      steel: 68,
      bricks: 11,
      sand: 65,
      mason: 1100,
      helper: 650,
    });
  };

  // ── OPTION C: Eco-Material Cost Comparison & Sustainable Swaps ──────────────
  const [ecoSwaps, setEcoSwaps] = useState({
    aac_blocks: false, // -4.5% material cost, -22% wall carbon
    ppc_cement: false, // -3.0% cement cost, -18% cement carbon
    filler_slab: false, // -5.0% slab cost, -15% concrete carbon
    solar_rooftop: false, // +1,80,000 capital, saves ~45k/yr energy
    rwh_system: false, // +25,000 capital, saves water
  });

  const ecoImpact = useMemo(() => {
    let costDelta = 0;
    let carbonDeltaKg = 0;
    const items = [];

    if (ecoSwaps.aac_blocks) {
      const delta = -(baseBreakdown.material_cost * 0.045);
      costDelta += delta;
      carbonDeltaKg -= 4200;
      items.push({ name: 'AAC Blocks vs Clay Bricks', delta, co2: -4200 });
    }
    if (ecoSwaps.ppc_cement) {
      const delta = -(baseBreakdown.material_cost * 0.03);
      costDelta += delta;
      carbonDeltaKg -= 3100;
      items.push({ name: 'Fly-Ash PPC Cement vs OPC 53', delta, co2: -3100 });
    }
    if (ecoSwaps.filler_slab) {
      const delta = -(baseBreakdown.material_cost * 0.05);
      costDelta += delta;
      carbonDeltaKg -= 5400;
      items.push({ name: 'Thermal Filler Slab Roof vs RCC', delta, co2: -5400 });
    }
    if (ecoSwaps.solar_rooftop) {
      const delta = 180000;
      costDelta += delta;
      carbonDeltaKg -= 3600; // Annual operational carbon offset
      items.push({ name: '3kW On-Grid Solar PV System', delta, co2: -3600, note: 'Saves ₹45,000/yr electricity' });
    }
    if (ecoSwaps.rwh_system) {
      const delta = 25000;
      costDelta += delta;
      carbonDeltaKg -= 800;
      items.push({ name: 'Dual Recharge Shaft RWH Pit', delta, co2: -800, note: 'Recharges ~60,000L water/yr' });
    }

    const netTotal = overriddenBreakdown.total_cost + costDelta;
    return { costDelta, carbonDeltaKg, items, netTotal };
  }, [baseBreakdown, overriddenBreakdown.total_cost, ecoSwaps]);

  // ── OPTION D: Cost Range & Volatility Sensitivity Bands ────────────────────
  const [volatilityScenario, setVolatilityScenario] = useState('baseline'); // 'optimistic' | 'baseline' | 'conservative' | 'high_inflation'

  const volatilityData = useMemo(() => {
    const base = overriddenBreakdown.total_cost;
    const scenarios = {
      optimistic: { label: 'Direct Bulk Factory Sourcing', pct: -0.07, desc: 'Direct supply agreements, off-season labor, stable steel/cement prices.' },
      baseline: { label: 'Standard ML Benchmark (Current Rate Master)', pct: 0.0, desc: 'Current Tamil Nadu CPWD & local market baseline rates.' },
      conservative: { label: 'Moderate Market Inflation', pct: 0.06, desc: 'Minor fuel price increases (+5%), seasonal labor demand peaks (+8%).' },
      high_inflation: { label: 'High Volatility & Monsoon Shortage', pct: 0.12, desc: 'Monsoon transport delays, diesel hikes (+15%), seasonal material shortage.' },
    };

    const current = scenarios[volatilityScenario];
    const adjustedCost = Math.round(base * (1 + current.pct));
    const minBand = Math.round(base * 0.92);
    const maxBand = Math.round(base * 1.15);

    return { scenarios, current, adjustedCost, minBand, maxBand, base };
  }, [overriddenBreakdown.total_cost, volatilityScenario]);

  // Category items for chart
  const categories = [
    { key: 'material_cost', label: 'Materials', pct: 52, val: overriddenBreakdown.material_cost, color: '#1A4D2E', Icon: Boxes, items: ['Cement (OPC/PPC)', 'Fe500 TMT Steel', 'Red Bricks / AAC Blocks', 'M-Sand & P-Sand', '20mm Blue Metal Aggregate'] },
    { key: 'labour_cost', label: 'Labour', pct: 22, val: overriddenBreakdown.labour_cost, color: '#2E7D52', Icon: HardHat, items: ['Chief Masons', 'Bar Benders & Shuttering', 'Helper Labourers', 'Carpenters & Plasterers'] },
    { key: 'electrical_cost', label: 'Electrical MEP', pct: 6, val: overriddenBreakdown.electrical_cost, color: '#D4541A', Icon: Zap, items: ['FR PVC Conduit Piping', 'Copper Wire Runs (1.5-6.0 sq.mm)', 'Modular Switches & Distribution Boards'] },
    { key: 'plumbing_cost', label: 'Plumbing MEP', pct: 5, val: overriddenBreakdown.plumbing_cost, color: '#0284C7', Icon: Wrench, items: ['CPVC Water Supply Lines', 'SWR Soil & Waste Pipes', 'Sanitaryware & Overhead Tank'] },
    { key: 'painting_cost', label: 'Painting & Finishing', pct: 5, val: overriddenBreakdown.painting_cost, color: '#8B5CF6', Icon: Palette, items: ['Wall Putty (2 Coats)', 'Primer Application', 'Interior Emulsion & Exterior Weather Shield'] },
    { key: 'finishing_cost', label: 'Flooring & Joinery', pct: 6, val: overriddenBreakdown.finishing_cost, color: '#F59E0B', Icon: Sparkles, items: ['Vitrified Tile Flooring (4x2 ft)', 'Granite Kitchen Countertop', 'Teak Wood Main Door & UPVC Windows'] },
    { key: 'approval_misc_cost', label: 'Approvals & Overheads', pct: 4, val: overriddenBreakdown.approval_misc_cost, color: '#64748B', Icon: ClipboardList, items: ['DTCP / CMDA Plan Approval Fees', 'Temporary Site Electricity & Water', 'Unforeseen Contingencies (3%)'] },
  ];

  return (
    <div className="rounded-3xl border bg-white shadow-md overflow-hidden flex flex-col" style={{ borderColor: 'var(--border)' }}>
      {/* Header bar */}
      <div className="p-6 bg-[#1A4D2E] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2 bg-[#D4541A] text-white">
            <Sparkles size={14} /> Section 6 · Advanced Cost Estimator Suite
          </div>
          <h2 className="text-xl font-extrabold text-white">Interactive Estimation Enhancements</h2>
          <p className="text-xs text-emerald-200 mt-0.5">
            CPWD rate overrides, cost breakdown charts, eco-material cost deltas, and market volatility sensitivity analysis.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center p-1 rounded-2xl bg-white/10 border border-white/20 self-start sm:self-auto flex-wrap sm:flex-nowrap gap-1">
          {[
            { id: 'chart', label: 'Cost Breakdown', Icon: PieChart },
            { id: 'overrides', label: 'CPWD Rate Overrides', Icon: Sliders },
            { id: 'eco_comparison', label: 'Eco Swaps & Deltas', Icon: Leaf },
            { id: 'volatility', label: 'Market Volatility Bands', Icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-white text-[#1A4D2E] shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.Icon size={14} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="p-6 sm:p-8">
        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: VISUAL COST BREAKDOWN CHART (OPTION B)                     */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'chart' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 border-[#DDD8CD]">
              <div>
                <h3 className="text-lg font-extrabold text-[#1A4D2E]">Civil Engineering Component Distribution</h3>
                <p className="text-xs text-[#7A8C6E]">
                  Proportional cost split based on Tamil Nadu PWD standards for {totalArea.toLocaleString()} sq.ft built-up structure.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#7A8C6E] uppercase font-bold">Total Adjusted Estimate</span>
                <div className="text-3xl font-extrabold text-[#1A4D2E] tabular-nums">{fmt(overriddenBreakdown.total_cost)}</div>
                <div className="text-xs text-[#2E7D52] font-semibold">≈ ₹{Math.round(overriddenBreakdown.total_cost / totalArea).toLocaleString('en-IN')} / sqft</div>
              </div>
            </div>

            {/* Visual Stacked Progress Bar */}
            <div className="flex flex-col gap-2">
              <div className="text-xs font-bold text-[#1A4D2E] flex justify-between">
                <span>Category Percentage Allocation</span>
                <span>100% Total Cost</span>
              </div>
              <div className="h-6 w-full rounded-2xl overflow-hidden flex bg-[#EDE8DC] border border-[#DDD8CD] p-0.5">
                {categories.map((c) => {
                  const pct = ((c.val / overriddenBreakdown.total_cost) * 100).toFixed(1);
                  return (
                    <div
                      key={c.key}
                      title={`${c.label}: ${pct}% (${fmt(c.val)})`}
                      style={{ width: `${pct}%`, backgroundColor: c.color }}
                      className="h-full transition-all duration-300 first:rounded-l-xl last:rounded-r-xl hover:opacity-85 cursor-pointer relative group"
                    />
                  );
                })}
              </div>
            </div>

            {/* Grid of category breakdown cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {categories.map((c) => {
                const pct = ((c.val / overriddenBreakdown.total_cost) * 100).toFixed(1);
                return (
                  <div key={c.key} className="p-5 rounded-2xl border border-[#DDD8CD] bg-white shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: c.color }}>
                          <c.Icon size={16} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#1A4D2E]">{c.label}</h4>
                          <span className="text-[11px] font-semibold text-[#7A8C6E]">{pct}% of total project</span>
                        </div>
                      </div>
                      <span className="text-sm font-extrabold px-2.5 py-1 rounded-xl bg-[#EDE8DC] text-[#1A4D2E]">
                        {fmt(c.val)}
                      </span>
                    </div>

                    <div className="border-t border-[#F0ECE1] pt-3 flex flex-col gap-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7A8C6E]">Key Sub-items &amp; Scope</span>
                      <ul className="text-xs text-[#4B5945] list-disc list-inside space-y-0.5">
                        {c.items.map((item, idx) => (
                          <li key={idx} className="truncate">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: CPWD RATE OVERRIDES PER PROJECT (OPTION A)                  */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overrides' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 border-[#DDD8CD]">
              <div>
                <h3 className="text-lg font-extrabold text-[#1A4D2E]">CPWD &amp; Local Rate Master Overrides</h3>
                <p className="text-xs text-[#7A8C6E]">
                  Override default unit material &amp; labor rates or apply a CPWD index multiplier to customize costs for your project location.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetOverrides}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[#DDD8CD] bg-[#EDE8DC] text-[#1A4D2E] hover:bg-[#E2DDD0] transition-all cursor-pointer inline-flex items-center gap-1.5 self-start md:self-auto"
              >
                <RotateCcw size={14} /> Reset to Default Rates
              </button>
            </div>

            {/* Slider 1: CPWD Index Multiplier */}
            <div className="p-6 rounded-2xl bg-[#EDE8DC]/60 border border-[#DDD8CD] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#1A4D2E] flex items-center gap-2">
                    <Sliders size={16} /> CPWD / PWD Schedule of Rates Index Multiplier
                  </h4>
                  <p className="text-xs text-[#7A8C6E]">Applies overall tender coefficient or location cost index offset across all items.</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-[#1A4D2E] tabular-nums">{cpwdMultiplier.toFixed(2)}×</span>
                  <div className="text-[11px] font-semibold text-[#2E7D52]">
                    {cpwdMultiplier === 1.0 ? 'Baseline Index' : cpwdMultiplier > 1.0 ? `+${((cpwdMultiplier - 1) * 100).toFixed(0)}% Premium` : `-${((1 - cpwdMultiplier) * 100).toFixed(0)}% Discount`}
                  </div>
                </div>
              </div>

              <input
                type="range"
                min="0.80"
                max="1.30"
                step="0.01"
                value={cpwdMultiplier}
                onChange={(e) => setCpwdMultiplier(parseFloat(e.target.value))}
                className="w-full accent-[#1A4D2E] cursor-pointer h-2 bg-[#DDD8CD] rounded-lg"
              />

              <div className="flex items-center justify-between text-xs text-[#7A8C6E] font-medium pt-1">
                <span>0.80× (Rural / Subsidized)</span>
                <span>1.00× (Standard CPWD)</span>
                <span>1.30× (Metro Tier-1 Hill/Coastal)</span>
              </div>
            </div>

            {/* Individual Material & Labour Unit Rate Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { label: 'Portland Cement', unit: '₹ / 50kg Bag', key: 'cement', def: 420, min: 350, max: 550, step: 10 },
                { label: 'TMT Steel Rebar (Fe500)', unit: '₹ / kg', key: 'steel', def: 68, min: 50, max: 95, step: 1 },
                { label: 'Red Clay Bricks / Units', unit: '₹ / Brick', key: 'bricks', def: 11, min: 7, max: 18, step: 0.5 },
                { label: 'M-Sand Fine Aggregate', unit: '₹ / cu.ft', key: 'sand', def: 65, min: 40, max: 95, step: 5 },
                { label: 'Chief Mason Labour Rate', unit: '₹ / Man-day', key: 'mason', def: 1100, min: 800, max: 1600, step: 50 },
                { label: 'Unskilled Helper Labour', unit: '₹ / Man-day', key: 'helper', def: 650, min: 450, max: 1000, step: 50 },
              ].map((item) => (
                <div key={item.key} className="p-5 rounded-2xl border border-[#DDD8CD] bg-white flex flex-col gap-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#7A8C6E]">{item.label}</span>
                      <div className="text-xs text-[#7A8C6E]">{item.unit}</div>
                    </div>
                    <span className="text-xl font-extrabold text-[#1A4D2E] tabular-nums">₹{customRates[item.key]}</span>
                  </div>

                  <input
                    type="range"
                    min={item.min}
                    max={item.max}
                    step={item.step}
                    value={customRates[item.key]}
                    onChange={(e) => setCustomRates({ ...customRates, [item.key]: parseFloat(e.target.value) })}
                    className="w-full accent-[#1A4D2E] cursor-pointer h-2 bg-[#EDE8DC] rounded-lg"
                  />

                  <div className="flex items-center justify-between text-[11px] text-[#7A8C6E]">
                    <span>Min: ₹{item.min}</span>
                    <span>Std: ₹{item.def}</span>
                    <span>Max: ₹{item.max}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison summary strip */}
            <div className="p-5 rounded-2xl bg-[#1A4D2E] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider">Live Rate Impact Comparison</span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm line-through text-white/60">Standard: {fmt(baseTotal)}</span>
                  <span className="text-2xl font-extrabold text-white">Adjusted: {fmt(overriddenBreakdown.total_cost)}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-white/80 font-medium">Net Delta:</span>
                <div className={`text-lg font-bold ${overriddenBreakdown.total_cost >= baseTotal ? 'text-amber-300' : 'text-emerald-300'}`}>
                  {overriddenBreakdown.total_cost >= baseTotal ? '+' : ''}{fmt(overriddenBreakdown.total_cost - baseTotal)} ({(((overriddenBreakdown.total_cost - baseTotal) / baseTotal) * 100).toFixed(1)}%)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: ECO-MATERIAL COST COMPARISON TOGGLE (OPTION C)               */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'eco_comparison' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 border-[#DDD8CD]">
              <div>
                <h3 className="text-lg font-extrabold text-[#1A4D2E]">Sustainable Material Alternatives &amp; Cost Deltas</h3>
                <p className="text-xs text-[#7A8C6E]">
                  Toggle eco-friendly materials to analyze live capital cost savings, payback periods, and embodied carbon reductions.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#7A8C6E] uppercase font-bold">Total Carbon Reduction</span>
                <div className="text-2xl font-extrabold text-[#2E7D52]">{Math.abs(ecoImpact.carbonDeltaKg).toLocaleString()} kg CO₂e</div>
              </div>
            </div>

            {/* List of Eco Swaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  key: 'aac_blocks',
                  title: 'AAC Blocks vs Red Clay Bricks',
                  desc: 'Lightweight Autoclaved Aerated Concrete blocks reduce structural load, mortar usage by 60%, and thermal conductivity.',
                  costImpact: '-4.5% Material Cost',
                  co2Impact: '-4.2 Tons CO₂e',
                  savings: 'Saves ~₹45,000 on mortar & steel structural load',
                  badge: 'Cost Saver',
                },
                {
                  key: 'ppc_cement',
                  title: 'Fly-Ash Blended PPC Cement vs OPC 53',
                  desc: 'Portland Pozzolana Cement uses industrial fly-ash, providing higher resistance to sulphate attacks and lower hydration heat.',
                  costImpact: '-3.0% Cement Cost',
                  co2Impact: '-3.1 Tons CO₂e',
                  savings: 'Saves ~₹25,000 & improves long-term concrete durability',
                  badge: 'Eco Pick',
                },
                {
                  key: 'filler_slab',
                  title: 'Thermal Insulated Filler Slab Roof vs RCC',
                  desc: 'Replaces non-structural concrete in tension zone with clay pots/tiles, reducing concrete volume by 20% and indoor temperature by 3-4°C.',
                  costImpact: '-5.0% Slab Cost',
                  co2Impact: '-5.4 Tons CO₂e',
                  savings: 'Saves ~₹75,000 on concrete & rebar steel',
                  badge: 'Architectural Special',
                },
                {
                  key: 'solar_rooftop',
                  title: '3kW Rooftop On-Grid Solar System',
                  desc: 'Monocrystalline solar PV panels with net-metering inverter system generating ~12-14 units per day.',
                  costImpact: '+₹1,80,000 Capital Investment',
                  co2Impact: '-3.6 Tons CO₂e / Year',
                  savings: 'Saves ~₹45,000 / year on electricity bills (4 yr payback)',
                  badge: 'High ROI',
                },
                {
                  key: 'rwh_system',
                  title: 'Rainwater Harvesting Percolation Pit',
                  desc: 'Dual percolation shaft with gravel filter layers connecting roof gutters to recharge local groundwater aquifer.',
                  costImpact: '+₹25,000 Installation',
                  co2Impact: '-800 kg CO₂e',
                  savings: 'Recharges 60,000 Litres rainwater annually',
                  badge: 'Water Positive',
                },
              ].map((swap) => {
                const isActive = ecoSwaps[swap.key];
                return (
                  <div
                    key={swap.key}
                    onClick={() => setEcoSwaps({ ...ecoSwaps, [swap.key]: !isActive })}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                      isActive
                        ? 'border-[#1A4D2E] bg-[#EDE8DC]/50 shadow-md ring-2 ring-[#1A4D2E]/20'
                        : 'border-[#DDD8CD] bg-white hover:border-[#1A4D2E]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            isActive ? 'bg-[#1A4D2E] text-white' : 'border border-[#DDD8CD] bg-white text-transparent'
                          }`}
                        >
                          <Check size={14} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#1A4D2E]">{swap.title}</h4>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#2E7D52] text-white inline-block mt-0.5">
                            {swap.badge}
                          </span>
                        </div>
                      </div>
                      <span className={`text-xs font-bold ${swap.costImpact.startsWith('-') ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {swap.costImpact}
                      </span>
                    </div>

                    <p className="text-xs text-[#4B5945] leading-relaxed">{swap.desc}</p>

                    <div className="border-t border-[#DDD8CD]/60 pt-3 flex items-center justify-between text-xs font-semibold text-[#1A4D2E]">
                      <span className="flex items-center gap-1 text-emerald-800">
                        <Leaf size={14} /> {swap.co2Impact}
                      </span>
                      <span className="text-[#7A8C6E] text-[11px]">{swap.savings}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Impact summary dashboard */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#1A4D2E] to-[#2E7D52] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-200">Selected Sustainable Options Impact</h4>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <div>
                    <span className="text-[11px] text-white/70 font-medium">Net Cost Delta</span>
                    <div className="text-2xl font-extrabold text-white">
                      {ecoImpact.costDelta < 0 ? '-' : '+'}{fmt(Math.abs(ecoImpact.costDelta))}
                    </div>
                  </div>
                  <div className="w-px h-8 bg-white/20 hidden sm:block" />
                  <div>
                    <span className="text-[11px] text-white/70 font-medium">Embodied Carbon Offset</span>
                    <div className="text-2xl font-extrabold text-emerald-300">
                      {Math.abs(ecoImpact.carbonDeltaKg).toLocaleString()} kg CO₂e
                    </div>
                  </div>
                  <div className="w-px h-8 bg-white/20 hidden sm:block" />
                  <div>
                    <span className="text-[11px] text-white/70 font-medium">New Total Project Estimate</span>
                    <div className="text-2xl font-extrabold text-white">{fmt(ecoImpact.netTotal)}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/10 border border-white/20 text-center min-w-[160px]">
                <span className="text-[10px] font-bold uppercase text-emerald-200">Green Building Rating</span>
                <div className="text-xl font-extrabold text-white mt-1">
                  {ecoImpact.items.length >= 3 ? 'Platinum Level' : ecoImpact.items.length >= 1 ? 'Gold Level' : 'Silver Level'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: COST RANGE & MARKET VOLATILITY BANDS (OPTION D)              */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'volatility' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 border-[#DDD8CD]">
              <div>
                <h3 className="text-lg font-extrabold text-[#1A4D2E]">Market Volatility &amp; Sensitivity Band Analysis</h3>
                <p className="text-xs text-[#7A8C6E]">
                  Simulate material price fluctuations, procurement timing, and inflation volatility scenarios to establish project risk buffers.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#7A8C6E] uppercase font-bold">Estimated Volatility Range</span>
                <div className="text-lg font-bold text-[#1A4D2E]">
                  {fmt(volatilityData.minBand)} – {fmt(volatilityData.maxBand)}
                </div>
              </div>
            </div>

            {/* Scenario Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(volatilityData.scenarios).map(([key, sc]) => {
                const isSelected = volatilityScenario === key;
                const cost = Math.round(volatilityData.base * (1 + sc.pct));
                return (
                  <div
                    key={key}
                    onClick={() => setVolatilityScenario(key)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'border-[#1A4D2E] bg-[#EDE8DC]/60 shadow-md ring-2 ring-[#1A4D2E]/20'
                        : 'border-[#DDD8CD] bg-white hover:border-[#1A4D2E]/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                          sc.pct < 0 ? 'bg-emerald-100 text-emerald-800' : sc.pct === 0 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sc.pct < 0 ? `${(sc.pct * 100).toFixed(0)}% Sourcing` : sc.pct === 0 ? '0% Benchmark' : `+${(sc.pct * 100).toFixed(0)}% Inflation`}
                        </span>
                        {isSelected && <Check size={16} className="text-[#1A4D2E]" />}
                      </div>
                      <h4 className="text-sm font-bold text-[#1A4D2E] mt-2">{sc.label}</h4>
                      <p className="text-xs text-[#4B5945] mt-1 leading-snug">{sc.desc}</p>
                    </div>

                    <div className="border-t border-[#DDD8CD]/60 pt-3">
                      <span className="text-[10px] uppercase font-bold text-[#7A8C6E]">Projected Cost</span>
                      <div className="text-xl font-extrabold text-[#1A4D2E] tabular-nums mt-0.5">{fmt(cost)}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Visual Sensitivity Band Bar */}
            <div className="p-6 rounded-2xl border border-[#DDD8CD] bg-white flex flex-col gap-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#1A4D2E] flex items-center gap-2">
                    <BarChart3 size={16} /> Projected Cost Volatility Spectrum
                  </h4>
                  <p className="text-xs text-[#7A8C6E]">Visual comparison of minimum bulk procurement price vs high inflation market risk.</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#7A8C6E] font-bold">Selected Scenario</span>
                  <div className="text-2xl font-extrabold text-[#1A4D2E] tabular-nums">{fmt(volatilityData.adjustedCost)}</div>
                </div>
              </div>

              {/* Graphical Band Bar */}
              <div className="relative pt-6 pb-2">
                <div className="h-4 w-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500 relative shadow-inner">
                  {/* Marker for current cost */}
                  <div
                    className="absolute -top-6 transform -translate-x-1/2 flex flex-col items-center transition-all duration-300"
                    style={{
                      left: `${Math.max(5, Math.min(95, ((volatilityData.adjustedCost - volatilityData.minBand) / (volatilityData.maxBand - volatilityData.minBand)) * 100))}%`,
                    }}
                  >
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#1A4D2E] text-white shadow-xs whitespace-nowrap">
                      {fmt(volatilityData.adjustedCost)}
                    </span>
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#1A4D2E]" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-[#7A8C6E] pt-3">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <ArrowDownRight size={14} /> Min Band: {fmt(volatilityData.minBand)}
                  </span>
                  <span className="text-[#1A4D2E] font-extrabold">Baseline: {fmt(volatilityData.base)}</span>
                  <span className="flex items-center gap-1 text-red-700">
                    <ArrowUpRight size={14} /> Max Risk Band: {fmt(volatilityData.maxBand)}
                  </span>
                </div>
              </div>
            </div>

            {/* Risk Mitigation Advice */}
            <div className="p-5 rounded-2xl bg-[#EDE8DC] border border-[#DDD8CD] flex items-start gap-3">
              <ShieldAlert size={20} className="text-[#1A4D2E] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A4D2E]">Architect &amp; Contractor Risk Advice</h4>
                <p className="text-xs text-[#4B5945] mt-1 leading-relaxed">
                  Steel &amp; cement account for over 40% of material price volatility in Tamil Nadu. We recommend lock-in supply agreements for steel rebar when rates drop below ₹64/kg, and procuring 50% of cement requirements early in Stage 1 foundation phase to hedge against monsoon price spikes.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
