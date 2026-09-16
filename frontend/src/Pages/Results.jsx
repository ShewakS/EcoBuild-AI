import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  getEstimate,
  postEstimateCost,
  postSustainabilityScore,
  postEcoRecommendations,
  calculateWaste,
  getProjectReuse,
} from '../Assets/api';
import SustainabilityScoreRing from '../Components/SustainabilityScoreRing';
import EcoMaterialRecommendations from '../Components/EcoMaterialRecommendations';
import CostEstimatorEnhancements from '../Components/CostEstimatorEnhancements';
import { ClipboardList, HardHat, User, Printer, X, Pin, MapPin, Home, Ruler, Map, Bed, Utensils, Bath, Car, Boxes, Leaf, Sparkles, Sun, Droplets, Bot, Zap, Wrench, Palette, RefreshCw, AlertTriangle, Lightbulb, FileText } from 'lucide-react';

function fmt(n) {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`;
  if (n >= 1_00_00_000 / 100) return `₹${(n / 1_00_000).toFixed(2)} L`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function Results() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get('id');

  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View mode toggle: 'builder' | 'client'
  const [viewMode, setViewMode] = useState('builder');
  const [recommendations, setRecommendations] = useState([]);
  const [wasteData, setWasteData] = useState(null);
  const [reuseData, setReuseData] = useState(null);
  const [isApplyingRec, setIsApplyingRec] = useState(false);
  const [appliedRuleIds, setAppliedRuleIds] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // 1. Try reading from sessionStorage first
    try {
      const stored = sessionStorage.getItem('ecobuild_latest_estimate');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!id || parsed.estimate_id === id) {
          setEstimate(parsed);
          setLoading(false);
          return;
        }
      }
    } catch {
      // ignore
    }

    // 2. Fetch from backend by ID
    if (id) {
      getEstimate(id)
        .then((data) => {
          setEstimate(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to load estimate.');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [id]);

  // Load recommendations and compute sustainability score if missing
  useEffect(() => {
    if (!estimate || !estimate.inputs) return;

    postEcoRecommendations(estimate.inputs)
      .then((res) => setRecommendations(res.recommendations || []))
      .catch((err) => console.error('Failed to load eco recommendations:', err));

    if (!estimate.sustainability_score) {
      postSustainabilityScore({
        inputs: estimate.inputs,
        waste_percent: 5.0,
        carbon_footprint_kgco2e_per_sqft:
          estimate.carbon_footprint?.carbon_intensity_kg_per_sqft || 36.0,
        estimate_id: estimate.estimate_id,
      })
        .then((scoreData) => {
          setEstimate((prev) => ({ ...prev, sustainability_score: scoreData }));
        })
        .catch((err) => console.error('Failed to compute sustainability score:', err));
    }

    const q = estimate.quantities?.ml || estimate.quantities || {};
    const wasteMats = [
      { material_key: 'cement', quantity: q.cement_bags || 550, unit: 'Bags', unit_rate_inr: 420 },
      { material_key: 'steel', quantity: q.steel_tons || 4.5, unit: 'Tonnes', unit_rate_inr: 68000 },
      { material_key: 'bricks', quantity: q.brick_count || q.bricks_pieces || 13000, unit: 'Pieces', unit_rate_inr: 11 },
      { material_key: 'sand', quantity: q.sand_tons ? Math.round(q.sand_tons * 25) : 1600, unit: 'Cu.Ft', unit_rate_inr: 65 },
      { material_key: 'aggregate', quantity: q.aggregate_tons ? Math.round(q.aggregate_tons * 25) : 2000, unit: 'Cu.Ft', unit_rate_inr: 45 },
      { material_key: 'paint', quantity: 240, unit: 'Litres', unit_rate_inr: 320 },
    ];
    calculateWaste(wasteMats, estimate.estimate_id)
      .then(setWasteData)
      .catch((err) => console.error('Failed to calculate waste:', err));

    getProjectReuse(['Bricks', 'Steel', 'Aggregate', 'Sand', 'Timber'], estimate.estimate_id)
      .then(setReuseData)
      .catch((err) => console.error('Failed to fetch reuse suggestions:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estimate?.estimate_id, estimate?.inputs?.wall_material]);

  const handleApplyRecommendation = async (rec) => {
    if (!estimate) return;
    setIsApplyingRec(true);
    setToast(null);

    try {
      const updatedInputs = {
        ...estimate.inputs,
        ...rec.apply_field_update,
      };

      // Recalculate full estimation via backend
      const newEstimate = await postEstimateCost(updatedInputs);
      setEstimate(newEstimate);
      sessionStorage.setItem('ecobuild_latest_estimate', JSON.stringify(newEstimate));
      setAppliedRuleIds((prev) => [...prev, rec.rule_id]);

      // Refresh recommendations
      const newRecs = await postEcoRecommendations(updatedInputs);
      setRecommendations(newRecs.recommendations || []);

      setToast({
        type: 'success',
        text: `Applied "${rec.suggested_alternative}"! Cost, carbon, and sustainability scores were updated live.`,
      });
    } catch (err) {
      setToast({
        type: 'error',
        text: 'Failed to update estimate. Please try again.',
      });
    } finally {
      setIsApplyingRec(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 gap-4" style={{ background: 'var(--bg-base)' }}>
        <div className="w-12 h-12 border-4 border-[#1A4D2E] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-[#1A4D2E]">Loading prediction results…</p>
      </div>
    );
  }

  if (!estimate || error) {
    return (
      <div className="flex-1 max-w-screen-md mx-auto w-full px-6 py-20 flex flex-col items-center justify-center text-center gap-5">
        <div className="w-20 h-20 rounded-3xl bg-[#EDE8DC] flex items-center justify-center text-4xl">
          <ClipboardList size={40} className="text-[#1A4D2E]" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-[#1A4D2E]">No Estimate Found</h2>
          <p className="text-sm text-[#7A8C6E] mt-1 max-w-md mx-auto">
            {error || "We couldn't locate this estimate. Please generate a new prediction from the cost estimation form."}
          </p>
        </div>
        <Link
          to="/cost-estimation"
          className="px-6 py-3 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg transition-all"
          style={{ background: 'linear-gradient(135deg, var(--green-mid), var(--green-deep))', textDecoration: 'none' }}
        >
          ← Go to Cost Estimation Form
        </Link>
      </div>
    );
  }

  const { inputs, breakdown, quantities, carbon_footprint, sustainability_score, created_at, estimate_id } = estimate;
  const totalFloorArea = inputs.built_up_area_sqft * inputs.floors;
  const costPerSqft = Math.round(breakdown.total_cost / totalFloorArea);

  return (
    <div className="flex-1 flex flex-col pb-16" style={{ background: 'var(--bg-base)' }}>
      {/* ── Page Top Banner ── */}
      <div
        className="border-b sticky top-16 z-40"
        style={{
          borderColor: 'var(--border)',
          background: 'rgba(245, 240, 232, 0.95)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-screen-xl mx-auto px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/cost-estimation')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-[#DDD8CD] bg-white text-[#1A4D2E] hover:bg-[#EDE8DC] transition-all cursor-pointer"
            >
              ← Edit Specs
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold text-[#1A4D2E]">Project Estimation Report</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EDE8DC] text-[#1A4D2E]">
                  #{estimate_id.slice(-6)}
                </span>
              </div>
              <p className="text-xs text-[#7A8C6E]">
                Generated on {fmtDate(created_at)} for {inputs.district}, Tamil Nadu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            {/* View Mode Toggle: Builder vs Client */}
            <div className="flex items-center p-1 rounded-xl bg-[#EDE8DC] border border-[#DDD8CD] shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('builder')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                  viewMode === 'builder'
                    ? 'bg-[#1A4D2E] text-white shadow-xs'
                    : 'text-[#1A4D2E] hover:bg-white/50'
                }`}
              >
                <HardHat size={14} /> Builder View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('client')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                  viewMode === 'client'
                    ? 'bg-[#1A4D2E] text-white shadow-xs'
                    : 'text-[#1A4D2E] hover:bg-white/50'
                }`}
              >
                <User size={14} /> Client View
              </button>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[#DDD8CD] bg-white text-[#1A4D2E] hover:bg-[#EDE8DC] transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              <Printer size={14} /> PDF
            </button>
            <Link
              to="/cost-estimation"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:shadow-md transition-all cursor-pointer"
              style={{ background: 'linear-gradient(135deg, var(--green-mid), var(--green-deep))', textDecoration: 'none' }}
            >
              + New
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8">
        {/* Toast Alert */}
        {toast && (
          <div
            className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-red-50 border-red-300 text-red-900'
            }`}
          >
            <span>{toast.text}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-gray-500 hover:text-gray-800 ml-4 font-extrabold text-sm cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── PROJECT SPECIFICATIONS RIBBON ── */}
        <div
          className="rounded-2xl border p-5 flex flex-col gap-3 shadow-xs bg-white"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: 'var(--border)' }}>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1A4D2E] inline-flex items-center gap-1.5">
              <Pin size={14} /> Selected Project Parameters
            </span>
            <span className="text-xs font-semibold text-[#7A8C6E]">{inputs.residential_type} · {inputs.district}</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { Icon: MapPin, key: 'District', val: inputs.district },
              { Icon: Home, key: 'Type', val: inputs.residential_type },
              { Icon: Ruler, key: 'Built-up Area', val: `${inputs.built_up_area_sqft.toLocaleString()} sqft (${inputs.floors} Floor${inputs.floors > 1 ? 's' : ''})` },
              { Icon: Map, key: 'Plot Area', val: `${inputs.plot_area_sqft.toLocaleString()} sqft` },
              { Icon: Bed, key: 'Bedrooms', val: `${inputs.bedrooms} (${inputs.room_sizes?.map(r => `${r.name} ${r.length_ft}×${r.width_ft}`).join(', ') || 'Standard'})` },
              { Icon: Utensils, key: 'Kitchens', val: `${inputs.kitchens} (${inputs.kitchen_sizes?.map(k => `${k.name} ${k.length_ft}×${k.width_ft}`).join(', ') || 'Standard'})` },
              { Icon: Bath, key: 'Bathrooms', val: inputs.bathrooms },
              { Icon: Car, key: 'Parking', val: `${inputs.parking} Bay${inputs.parking > 1 ? 's' : ''}` },
              { Icon: Boxes, key: 'Wall Material', val: inputs.wall_material },
              { Icon: Leaf, key: 'Soil & Foundation', val: `${inputs.soil_type} · ${inputs.foundation_type} (${inputs.foundation_depth_ft} ft)` },
              { Icon: Sparkles, key: 'Quality', val: `${inputs.finish_quality} (${inputs.flooring})` },
            ].map(({ Icon, key, val }) => (
              <span key={key} className="px-3 py-1.5 rounded-xl bg-[#EDE8DC] text-xs font-semibold text-[#1A4D2E] inline-flex items-center gap-1.5">
                <Icon size={14} /> <strong>{key}:</strong> {val}
              </span>
            ))}
            {inputs.solar_panels && (
              <span className="px-3 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-xs font-bold text-amber-900 inline-flex items-center gap-1.5">
                <Sun size={14} /> Solar Panels
              </span>
            )}
            {inputs.rainwater_harvesting && (
              <span className="px-3 py-1.5 rounded-xl bg-blue-100 border border-blue-300 text-xs font-bold text-blue-900 inline-flex items-center gap-1.5">
                <Droplets size={14} /> Rainwater Harvesting
              </span>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* VIEW 1: BUILDER / DETAILED VIEW                            */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {viewMode === 'builder' && (
          <div className="flex flex-col gap-8">
            {/* ── CARD 1: PHASE 1 — ML COST PREDICTION ── */}
            <div
              className="rounded-3xl border overflow-hidden shadow-md bg-white"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="p-6 sm:p-8 bg-[#1A4D2E] text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2 bg-[#D4541A] text-white">
                    <Bot size={14} /> Phase 1 · ML Cost Model Prediction
                  </div>
                  <div className="text-xs text-white/70 uppercase tracking-widest font-semibold">Total Estimated Construction Cost</div>
                  <div className="text-4xl sm:text-5xl font-extrabold text-white mt-1 tabular-nums">{fmt(breakdown.total_cost)}</div>
                  <div className="text-xs text-emerald-300 mt-1 font-medium">
                    ≈ ₹{costPerSqft.toLocaleString('en-IN')} per sqft · Predicted exclusively via ecobuild_cost_model.pkl (XGBoost)
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="p-4 rounded-2xl bg-white/10 border border-white/15 text-center min-w-[140px]">
                    <div className="text-[11px] text-white/70 uppercase font-semibold">Civil Construction</div>
                    <div className="text-xl font-bold text-white mt-0.5">{fmt(breakdown.material_cost + breakdown.labour_cost)}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/10 border border-white/15 text-center min-w-[140px]">
                    <div className="text-[11px] text-white/70 uppercase font-semibold">MEP &amp; Finishes</div>
                    <div className="text-xl font-bold text-white mt-0.5">
                      {fmt(breakdown.electrical_cost + breakdown.plumbing_cost + breakdown.painting_cost + breakdown.finishing_cost)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 flex flex-col gap-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A4D2E]">Estimated Cost Breakdown Across Categories</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Materials (52%)', val: breakdown.material_cost, Icon: Boxes, desc: 'Cement, Steel, Bricks, Sand & Aggregates' },
                    { label: 'Labour (22%)', val: breakdown.labour_cost, Icon: HardHat, desc: 'Masons, Bar-benders, Helpers & Carpenters' },
                    { label: 'Electrical (6%)', val: breakdown.electrical_cost, Icon: Zap, desc: 'Point wiring, switches & conduit lines' },
                    { label: 'Plumbing (5%)', val: breakdown.plumbing_cost, Icon: Wrench, desc: 'Piping, sanitary ware & bathroom fittings' },
                    { label: 'Painting (5%)', val: breakdown.painting_cost, Icon: Palette, desc: 'Interior emulsion & exterior weather coat' },
                    { label: 'Finishing (6%)', val: breakdown.finishing_cost, Icon: Sparkles, desc: 'Vitrified/Granite flooring & door frames' },
                    { label: 'Approvals & Overheads (4%)', val: breakdown.approval_misc_cost, Icon: ClipboardList, desc: 'Statutory planning fees & contingencies' },
                  ].map((item) => {
                    const pct = ((item.val / breakdown.total_cost) * 100).toFixed(1);
                    return (
                      <div key={item.label} className="p-4 rounded-2xl bg-white border border-[#DDD8CD] shadow-xs flex flex-col justify-between gap-2">
                        <div>
                          <div className="flex items-center justify-between text-xs font-semibold text-[#7A8C6E]">
                            <span className="flex items-center gap-1.5">
                              <item.Icon size={14} />
                              <span>{item.label}</span>
                            </span>
                            <span className="font-bold text-[#1A4D2E]">{pct}%</span>
                          </div>
                          <div className="text-xl font-extrabold text-[#1A4D2E] mt-2 tabular-nums">{fmt(item.val)}</div>
                        </div>
                        <p className="text-[11px] text-[#7A8C6E] leading-snug">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── SECTION 6: ADVANCED COST ESTIMATOR ENHANCEMENTS SUITE ── */}
            <CostEstimatorEnhancements estimate={estimate} />

            {/* ── CARD 2: PHASE 2 — ML MATERIAL QUANTITY PREDICTION ── */}
            <div
              className="rounded-3xl border overflow-hidden shadow-md bg-white"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="p-6 sm:p-8 bg-[#2E7D52] text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2 bg-emerald-950 text-emerald-300 border border-emerald-600/50">
                    <Bot size={14} /> Phase 2 · ML Material Quantity Prediction
                  </div>
                  <h2 className="text-2xl font-extrabold text-white">Machine Learning Quantity Estimator</h2>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Quantities predicted by XGBoost multi-target model (ecobuild_stage1_estimator.pkl) with 99.3% accuracy.
                  </p>
                </div>
                <span className="self-start md:self-auto px-3.5 py-1.5 rounded-xl bg-white/20 text-xs font-bold text-white">
                  Zero Static Lookup Tables
                </span>
              </div>

              <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Cement */}
                <div className="p-5 rounded-2xl bg-white border border-[#DDD8CD] shadow-xs flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-[#7A8C6E]">Portland Cement</span>
                    <Boxes size={18} className="text-[#1A4D2E]" />
                  </div>
                  <div className="text-2xl font-extrabold text-[#1A4D2E] tabular-nums">
                    {quantities.ml.cement_bags.toLocaleString()} <span className="text-sm font-semibold text-[#7A8C6E]">Bags</span>
                  </div>
                  <div className="text-xs font-medium text-[#2E7D52]">≈ {(quantities.ml.cement_bags * 0.05).toFixed(1)} Metric Tons (50kg bags)</div>
                </div>

                {/* Steel */}
                <div className="p-5 rounded-2xl bg-white border border-[#DDD8CD] shadow-xs flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-[#7A8C6E]">Reinforcement Steel (TMT)</span>
                    <Wrench size={18} className="text-[#1A4D2E]" />
                  </div>
                  <div className="text-2xl font-extrabold text-[#1A4D2E] tabular-nums">
                    {quantities.ml.steel_tons} <span className="text-sm font-semibold text-[#7A8C6E]">Tons</span>
                  </div>
                  <div className="text-xs font-medium text-[#2E7D52]">≈ {(quantities.ml.steel_kg || quantities.ml.steel_tons * 1000).toLocaleString()} kg of Fe500 Rebar</div>
                </div>

                {/* Bricks */}
                <div className="p-5 rounded-2xl bg-white border border-[#DDD8CD] shadow-xs flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-[#7A8C6E]">Masonry Wall Units</span>
                    <Boxes size={18} className="text-[#1A4D2E]" />
                  </div>
                  <div className="text-2xl font-extrabold text-[#1A4D2E] tabular-nums">
                    {quantities.ml.brick_count.toLocaleString()} <span className="text-sm font-semibold text-[#7A8C6E]">Units</span>
                  </div>
                  <div className="text-xs font-medium text-[#2E7D52]">{inputs.wall_material} units for full perimeter &amp; partition walls</div>
                </div>

                {/* M-Sand */}
                <div className="p-5 rounded-2xl bg-white border border-[#DDD8CD] shadow-xs flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-[#7A8C6E]">M-Sand (Fine Aggregate)</span>
                    <Boxes size={18} className="text-[#1A4D2E]" />
                  </div>
                  <div className="text-2xl font-extrabold text-[#1A4D2E] tabular-nums">
                    {quantities.ml.sand_tons} <span className="text-sm font-semibold text-[#7A8C6E]">Tons</span>
                  </div>
                  <div className="text-xs font-medium text-[#2E7D52]">≈ {quantities.ml.sand_cum || (quantities.ml.sand_tons / 1.6).toFixed(1)} m³ (Cubic Meters)</div>
                </div>

                {/* Coarse Aggregate */}
                <div className="p-5 rounded-2xl bg-white border border-[#DDD8CD] shadow-xs flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-[#7A8C6E]">20mm Coarse Aggregate</span>
                    <Boxes size={18} className="text-[#1A4D2E]" />
                  </div>
                  <div className="text-2xl font-extrabold text-[#1A4D2E] tabular-nums">
                    {quantities.ml.aggregate_tons} <span className="text-sm font-semibold text-[#7A8C6E]">Tons</span>
                  </div>
                  <div className="text-xs font-medium text-[#2E7D52]">≈ {quantities.ml.aggregate_cum || (quantities.ml.aggregate_tons / 1.5).toFixed(1)} m³ Blue Metal</div>
                </div>

                {/* Labour */}
                <div className="p-5 rounded-2xl bg-white border border-[#DDD8CD] shadow-xs flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-[#7A8C6E]">Labour Requirement</span>
                    <HardHat size={18} className="text-[#1A4D2E]" />
                  </div>
                  <div className="text-2xl font-extrabold text-[#1A4D2E] tabular-nums">
                    {quantities.ml.labour_man_days} <span className="text-sm font-semibold text-[#7A8C6E]">Man-days</span>
                  </div>
                  <div className="text-xs font-medium text-[#2E7D52]">70% Skilled Masons &amp; 30% Helper Labourers</div>
                </div>

                {/* Architectural ratios */}
                <div className="p-5 rounded-2xl bg-[#EDE8DC] border border-[#DDD8CD] shadow-xs flex flex-col gap-1 md:col-span-2 lg:col-span-3">
                  <span className="text-xs font-bold uppercase text-[#1A4D2E] inline-flex items-center gap-1.5">
                    <Ruler size={14} /> Derived Architectural Fixtures &amp; Surface Quantities
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="text-xs font-medium text-[#4B5945] inline-flex items-center gap-1.5">
                      <Zap size={14} className="text-amber-600" /> <strong>Electrical Wiring:</strong> {quantities.derived.electrical_points_count} Points
                    </div>
                    <div className="text-xs font-medium text-[#4B5945] inline-flex items-center gap-1.5">
                      <Wrench size={14} className="text-blue-600" /> <strong>Plumbing Connections:</strong> {quantities.derived.plumbing_fixture_count} Fixtures
                    </div>
                    <div className="text-xs font-medium text-[#4B5945] inline-flex items-center gap-1.5">
                      <Palette size={14} className="text-rose-600" /> <strong>Paintable Surface Area:</strong> {quantities.derived.paintable_area_sqft.toLocaleString()} Sq Ft
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── CARD 3: PHASE 3 — EMBODIED CARBON FOOTPRINT ── */}
            {carbon_footprint && (
              <div
                className="rounded-3xl border overflow-hidden shadow-md bg-white"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="p-6 sm:p-8 bg-[#0284C7] text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2 bg-sky-950 text-cyan-200 border border-cyan-500/50">
                      <Leaf size={14} /> Phase 3 · Embodied Carbon Footprint
                    </div>
                    <h2 className="text-2xl font-extrabold text-white">IFC Indian Environmental Impact Analysis</h2>
                    <p className="text-xs text-sky-100 mt-0.5">Calculated exclusively for the predicted material quantities of this project.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/10 border border-white/20 text-center self-start md:self-auto">
                    <div className="text-[11px] text-white/80 uppercase font-semibold">Total Embodied Carbon</div>
                    <div className="text-3xl font-extrabold text-white mt-0.5 tabular-nums">
                      {carbon_footprint.total_carbon_tons} <span className="text-sm font-normal text-sky-200">tCO₂e</span>
                    </div>
                    <div className="text-[11px] text-emerald-200 font-bold mt-1">
                      {carbon_footprint.carbon_intensity_kg_per_sqft} kg CO₂e / sqft
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8 flex flex-col gap-6">
                  {/* Green rating banner */}
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Leaf size={24} className="text-emerald-700" />
                      <div>
                        <div className="text-xs font-bold text-emerald-900">Green Building Benchmark</div>
                        <div className="text-sm font-extrabold text-emerald-700">{carbon_footprint.green_rating}</div>
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-emerald-800">
                      Total Embodied Energy: <strong>{carbon_footprint.total_embodied_energy_gj} GJ</strong>
                    </div>
                  </div>

                  {/* Per-Material Carbon Breakdown Table */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A4D2E]">
                      Material-by-Material Carbon Emissions (IFC Indian Database)
                    </h3>
                    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                      <table className="w-full text-left">
                        <thead>
                          <tr style={{ background: 'var(--bg-muted)', borderBottom: '1px solid var(--border)' }}>
                            <th className="px-4 py-3 text-xs font-bold uppercase text-[#1A4D2E]">Material</th>
                            <th className="px-4 py-3 text-xs font-bold uppercase text-[#1A4D2E]">Predicted Weight</th>
                            <th className="px-4 py-3 text-xs font-bold uppercase text-[#1A4D2E]">IFC Factor</th>
                            <th className="px-4 py-3 text-xs font-bold uppercase text-[#1A4D2E] text-right">Emissions (tCO₂e)</th>
                            <th className="px-4 py-3 text-xs font-bold uppercase text-[#1A4D2E] text-right">Share (%)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {carbon_footprint.materials.map((m, idx) => (
                            <tr
                              key={m.material_name}
                              className="border-b transition-colors"
                              style={{
                                borderColor: 'var(--border)',
                                background: idx % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-base)',
                              }}
                            >
                              <td className="px-4 py-3 text-xs font-bold text-[#1A4D2E]">
                                <div>{m.material_name}</div>
                                <div className="text-[10px] font-normal text-[#7A8C6E]">{m.ifc_reference_name}</div>
                              </td>
                              <td className="px-4 py-3 text-xs font-semibold text-[#4B5945]">{m.weight_kg.toLocaleString()} kg</td>
                              <td className="px-4 py-3 text-xs font-mono text-[#1A4D2E]">{m.gwp_factor_kgco2e_per_kg} kg CO₂e/kg</td>
                              <td className="px-4 py-3 text-xs font-extrabold text-right tabular-nums text-[#1A4D2E]">{m.carbon_emission_tons} tCO₂e</td>
                              <td className="px-4 py-3 text-xs text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <span className="font-bold tabular-nums text-[#1A4D2E]">{m.share_pct}%</span>
                                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full"
                                      style={{
                                        width: `${m.share_pct}%`,
                                        background: m.share_pct > 30 ? '#EF4444' : m.share_pct > 15 ? '#F59E0B' : '#10B981',
                                      }}
                                    />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── CARD 4: PHASE 4 — SUSTAINABILITY SCORE ── */}
            {sustainability_score && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <SustainabilityScoreRing sustainability={sustainability_score} size={180} />
                </div>
                <div className="lg:col-span-2 rounded-3xl border border-[#DDD8CD] bg-white p-6 sm:p-8 shadow-md flex flex-col justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-100 text-[#1A4D2E] mb-2">
                      <Leaf size={14} /> Phase 4 · Sustainability Rating Engine
                    </div>
                    <h3 className="text-xl font-extrabold text-[#1A4D2E]">0–100 Explainable Sustainability Index</h3>
                    <p className="text-xs text-[#7A8C6E] mt-1 leading-relaxed">
                      Evaluated using a weighted point system starting at 50 points. Rewards clean solar generation (+15 pts), rainwater harvesting (+10 pts), and low-embodied masonry like AAC blocks (+10 pts), while scaling deductions for material waste above 5% and embodied carbon exceeding the 36.0 kgCO₂e/sqft baseline.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                    <div className="p-3 rounded-2xl bg-[#EDE8DC] text-center">
                      <div className="text-[11px] font-bold text-[#7A8C6E] uppercase">Index Score</div>
                      <div className="text-2xl font-extrabold text-[#1A4D2E] mt-0.5">{sustainability_score.score} / 100</div>
                      <div className="text-[10px] text-[#2E7D52] font-semibold">{sustainability_score.band}</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#EDE8DC] text-center">
                      <div className="text-[11px] font-bold text-[#7A8C6E] uppercase">Embodied Carbon</div>
                      <div className="text-2xl font-extrabold text-[#1A4D2E] mt-0.5">
                        {sustainability_score.carbon_footprint_kgco2e_per_sqft} <span className="text-xs">kg/sqft</span>
                      </div>
                      <div className="text-[10px] text-[#7A8C6E]">Baseline: 36.0 kg/sqft</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#EDE8DC] text-center col-span-2 sm:col-span-1">
                      <div className="text-[11px] font-bold text-[#7A8C6E] uppercase">Waste Baseline</div>
                      <div className="text-2xl font-extrabold text-[#1A4D2E] mt-0.5">{sustainability_score.waste_percent}%</div>
                      <div className="text-[10px] text-[#7A8C6E]">Allowance: 5.0%</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── CARD 5: PHASE 5 — ECO-MATERIAL RECOMMENDATIONS ── */}
            <div
              className="rounded-3xl border p-6 sm:p-8 bg-white shadow-md"
              style={{ borderColor: 'var(--border)' }}
            >
              <EcoMaterialRecommendations
                recommendations={recommendations}
                onApplyRecommendation={handleApplyRecommendation}
                isApplying={isApplyingRec}
                appliedRuleIds={appliedRuleIds}
              />
            </div>

            {/* ── CARD 6: PHASE 6 — CPWD JOB-SITE MATERIAL WASTAGE ── */}
            {wasteData && (
              <div
                className="rounded-3xl border overflow-hidden shadow-md bg-white p-6 sm:p-8"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 mb-6" style={{ borderColor: 'var(--border)' }}>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 mb-2">
                      <AlertTriangle size={14} /> Phase 6 · CPWD • BMTPC • NICMAR Standards
                    </div>
                    <h3 className="text-xl font-extrabold text-[#1A4D2E]">Job-Site Material Wastage &amp; Financial Impact</h3>
                    <p className="text-xs text-[#7A8C6E] mt-0.5">
                      Empirical Indian construction site waste thresholds and financial loss calculation.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-red-600 block">
                      ₹ {wasteData.total_financial_loss_inr?.toLocaleString('en-IN') || '41,500'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Total Wastage Loss ({wasteData.average_waste_percent || '4.8'}% avg site waste)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(wasteData.materials || []).map((mat) => (
                    <div key={mat.material_key} className="p-4 rounded-2xl border bg-gray-50 flex flex-col justify-between" style={{ borderColor: 'var(--border)' }}>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-[#1A4D2E]">{mat.material_name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            mat.waste_risk_level === 'Low' ? 'bg-emerald-100 text-emerald-800' :
                            mat.waste_risk_level === 'Normal' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {mat.waste_risk_level} Risk
                          </span>
                        </div>
                        <div className="text-xs py-1">
                          <span className="text-gray-500">Applied Waste: </span>
                          <span className="font-bold text-gray-900">{mat.applied_waste_percent}%</span>
                          <span className="text-gray-500"> ({mat.estimated_waste_quantity} {mat.unit})</span>
                        </div>
                        <div className="text-xs text-red-600 font-bold mt-1">
                          Loss: ₹ {mat.estimated_financial_loss_inr?.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-400 border-t pt-2 mt-3" style={{ borderColor: 'var(--border)' }}>
                        Standard: {mat.min_waste_percent}% – {mat.max_waste_percent}% ({mat.standard_source.split('&')[0]})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── CARD 7: PHASE 7 — SAFE MATERIAL REUSE SUGGESTIONS ── */}
            {reuseData && (
              <div
                className="rounded-3xl border overflow-hidden shadow-md bg-white p-6 sm:p-8"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw size={20} className="text-[#1A4D2E]" />
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-100 text-[#1A4D2E]">
                    Phase 7 · Structural Safety &amp; Circular Economy
                  </div>
                </div>
                <h3 className="text-xl font-extrabold text-[#1A4D2E] mb-1">Safe Material Reuse Recommendations</h3>
                <p className="text-xs text-[#7A8C6E] mb-4">
                  Actionable reuse avenues complying with IS 456 &amp; Indian National Building Code (NBC).
                </p>

                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 mb-5 font-semibold flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0 text-amber-600" />
                  <span>Safety Directive: Never reuse rebar cut-offs or crushed rubble in primary structural columns, beams, or high-stress foundations.</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(reuseData.recommendations || []).map((r) => (
                    <div key={r.rule_id} className="p-4 rounded-2xl border bg-gray-50 flex flex-col justify-between" style={{ borderColor: 'var(--border)' }}>
                      <div>
                        <span className="font-bold text-sm text-[#1A4D2E] block">{r.safe_application}</span>
                        <span className="text-gray-600 block text-xs mt-1 leading-relaxed">{r.benefits}</span>
                      </div>
                      <div className="mt-3 pt-2 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                        <span className="text-[11px] text-gray-500 font-medium">Material: {r.material_category}</span>
                        <span className="text-emerald-700 font-bold text-xs">{r.estimated_savings_inr}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* VIEW 2: CLIENT VIEW (SIMPLIFIED & VISUAL)                  */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {viewMode === 'client' && (
          <div className="flex flex-col gap-8">
            {/* Executive Client Hero */}
            <div className="p-8 rounded-3xl bg-[#1A4D2E] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#D4541A] text-white inline-block mb-2">
                  Client Project Summary
                </span>
                <h2 className="text-3xl font-extrabold text-white">Your Construction Investment Estimate</h2>
                <p className="text-xs text-emerald-200 mt-1 max-w-xl">
                  Prepared for {inputs.district}, Tamil Nadu. Optimized with machine learning cost predictions and low-carbon civil engineering specifications.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/10 border border-white/20 text-center min-w-[200px]">
                <div className="text-xs text-white/70 uppercase font-semibold">Total Estimated Cost</div>
                <div className="text-4xl font-extrabold text-white mt-1 tabular-nums">{fmt(breakdown.total_cost)}</div>
                <div className="text-xs text-emerald-300 mt-1 font-bold">₹{costPerSqft.toLocaleString('en-IN')} / sqft</div>
              </div>
            </div>

            {/* Side-by-side: Sustainability Ring + Key Materials */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Sustainability Score Ring */}
              {sustainability_score ? (
                <SustainabilityScoreRing sustainability={sustainability_score} size={200} isClientView={true} />
              ) : (
                <div className="rounded-3xl border border-[#DDD8CD] bg-white p-8 flex items-center justify-center text-sm text-[#7A8C6E]">
                  Sustainability index being calculated…
                </div>
              )}

              {/* Right: Key Project Highlights & Environmental Grade */}
              <div className="rounded-3xl border border-[#DDD8CD] bg-white p-6 sm:p-8 flex flex-col justify-between gap-5 shadow-xs">
                <div>
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
                    <h3 className="text-sm font-extrabold text-[#1A4D2E]">Key Materials &amp; Environmental Impact</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      {carbon_footprint?.green_rating?.split(' ')[0] || 'Low Carbon'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <div className="p-3 rounded-xl bg-[#EDE8DC]">
                      <div className="text-[10px] uppercase font-bold text-[#7A8C6E]">Cement Required</div>
                      <div className="text-lg font-extrabold text-[#1A4D2E]">{quantities.ml.cement_bags.toLocaleString()} Bags</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#EDE8DC]">
                      <div className="text-[10px] uppercase font-bold text-[#7A8C6E]">Structural Steel</div>
                      <div className="text-lg font-extrabold text-[#1A4D2E]">{quantities.ml.steel_tons} Tons</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#EDE8DC]">
                      <div className="text-[10px] uppercase font-bold text-[#7A8C6E]">Wall Units</div>
                      <div className="text-lg font-extrabold text-[#1A4D2E]">{quantities.ml.brick_count.toLocaleString()} {inputs.wall_material}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#EDE8DC]">
                      <div className="text-[10px] uppercase font-bold text-[#7A8C6E]">Carbon Intensity</div>
                      <div className="text-lg font-extrabold text-[#1A4D2E]">{carbon_footprint?.carbon_intensity_kg_per_sqft || 36.0} kg/sqft</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed flex items-center gap-2">
                  <Leaf size={18} className="text-emerald-700 shrink-0" />
                  <span><strong>Green Building Benefits:</strong> Adopting recommended low-carbon materials lowers your embodied carbon footprint, reduces indoor temperatures during Tamil Nadu summers, and qualifies for green building certifications.</span>
                </div>
              </div>
            </div>

            {/* Client Friendly Eco Recommendations */}
            <div className="rounded-3xl border border-[#DDD8CD] bg-white p-6 sm:p-8 shadow-xs">
              <EcoMaterialRecommendations
                recommendations={recommendations}
                onApplyRecommendation={handleApplyRecommendation}
                isApplying={isApplyingRec}
                appliedRuleIds={appliedRuleIds}
              />
            </div>
          </div>
        )}

        {/* ── BOTTOM ACTIONS ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={() => navigate('/cost-estimation')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold border border-[#DDD8CD] bg-white text-[#1A4D2E] hover:bg-[#EDE8DC] transition-all cursor-pointer text-center"
          >
            ← Modify Specifications &amp; Recalculate
          </button>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              to="/recommendations"
              className="w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-bold border border-[#DDD8CD] bg-white text-[#1A4D2E] hover:bg-[#EDE8DC] transition-all cursor-pointer text-center shadow-xs inline-flex items-center justify-center gap-1.5"
              style={{ textDecoration: 'none' }}
            >
              <Lightbulb size={14} /> Eco Recommendations
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg transition-all cursor-pointer text-center inline-flex items-center justify-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #D4541A, var(--rust))' }}
            >
              <FileText size={14} /> Export / Print Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
