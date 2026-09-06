import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getEstimate } from '../Assets/api';

function fmt(n) {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)} L`;
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
        <div className="w-20 h-20 rounded-3xl bg-[#EDE8DC] flex items-center justify-center text-4xl">📋</div>
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

  const { inputs, breakdown, quantities, carbon_footprint, created_at, estimate_id } = estimate;
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
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-[#DDD8CD] bg-white text-[#1A4D2E] hover:bg-[#EDE8DC] transition-all cursor-pointer shadow-xs"
            >
              🖨️ Print / Save PDF
            </button>
            <Link
              to="/cost-estimation"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm hover:shadow-md transition-all cursor-pointer"
              style={{ background: 'linear-gradient(135deg, var(--green-mid), var(--green-deep))', textDecoration: 'none' }}
            >
              + New Estimate
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8">
        {/* ── PROJECT SPECIFICATIONS RIBBON ── */}
        <div
          className="rounded-2xl border p-5 flex flex-col gap-3 shadow-xs"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: 'var(--border)' }}>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1A4D2E]">📌 Selected Project Parameters</span>
            <span className="text-xs font-semibold text-[#7A8C6E]">{inputs.residential_type} · {inputs.district}</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { icon: '📍', key: 'District', val: inputs.district },
              { icon: '🏡', key: 'Type', val: inputs.residential_type },
              { icon: '📐', key: 'Built-up Area', val: `${inputs.built_up_area_sqft.toLocaleString()} sqft (${inputs.floors} Floor${inputs.floors > 1 ? 's' : ''})` },
              { icon: '🗺️', key: 'Plot Area', val: `${inputs.plot_area_sqft.toLocaleString()} sqft` },
              { icon: '🛏️', key: 'Bedrooms', val: `${inputs.bedrooms} (${inputs.room_sizes?.map(r => `${r.name} ${r.length_ft}×${r.width_ft}`).join(', ') || 'Standard'})` },
              { icon: '🍳', key: 'Kitchens', val: `${inputs.kitchens} (${inputs.kitchen_sizes?.map(k => `${k.name} ${k.length_ft}×${k.width_ft}`).join(', ') || 'Standard'})` },
              { icon: '🚿', key: 'Bathrooms', val: inputs.bathrooms },
              { icon: '🚗', key: 'Parking', val: `${inputs.parking} Bay${inputs.parking > 1 ? 's' : ''}` },
              { icon: '🧱', key: 'Wall Material', val: inputs.wall_material },
              { icon: '🌱', key: 'Soil & Foundation', val: `${inputs.soil_type} · ${inputs.foundation_type} (${inputs.foundation_depth_ft} ft)` },
              { icon: '✨', key: 'Quality', val: `${inputs.finish_quality} (${inputs.flooring})` },
            ].map(({ icon, key, val }) => (
              <span key={key} className="px-3 py-1.5 rounded-xl bg-[#EDE8DC] text-xs font-semibold text-[#1A4D2E]">
                {icon} <strong>{key}:</strong> {val}
              </span>
            ))}
            {inputs.solar_panels && (
              <span className="px-3 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-xs font-bold text-amber-900">☀️ Solar Panels</span>
            )}
            {inputs.rainwater_harvesting && (
              <span className="px-3 py-1.5 rounded-xl bg-blue-100 border border-blue-300 text-xs font-bold text-blue-900">💧 Rainwater Harvesting</span>
            )}
          </div>
        </div>

        {/* ── CARD 1: PHASE 1 — ML COST PREDICTION ── */}
        <div
          className="rounded-3xl border overflow-hidden shadow-md"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="p-6 sm:p-8 bg-[#1A4D2E] text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2 bg-[#D4541A] text-white">
                🤖 Phase 1 · ML Cost Model Prediction
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
                { label: 'Materials (52%)', val: breakdown.material_cost, icon: '🧱', desc: 'Cement, Steel, Bricks, Sand & Aggregates' },
                { label: 'Labour (22%)', val: breakdown.labour_cost, icon: '👷', desc: 'Masons, Bar-benders, Helpers & Carpenters' },
                { label: 'Electrical (6%)', val: breakdown.electrical_cost, icon: '⚡', desc: 'Point wiring, switches & conduit lines' },
                { label: 'Plumbing (5%)', val: breakdown.plumbing_cost, icon: '🔧', desc: 'Piping, sanitary ware & bathroom fittings' },
                { label: 'Painting (5%)', val: breakdown.painting_cost, icon: '🎨', desc: 'Interior emulsion & exterior weather coat' },
                { label: 'Finishing (6%)', val: breakdown.finishing_cost, icon: '✨', desc: 'Vitrified/Granite flooring & door frames' },
                { label: 'Approvals & Overheads (4%)', val: breakdown.approval_misc_cost, icon: '📋', desc: 'Statutory planning fees & contingencies' },
              ].map((item) => {
                const pct = ((item.val / breakdown.total_cost) * 100).toFixed(1);
                return (
                  <div key={item.label} className="p-4 rounded-2xl bg-white border border-[#DDD8CD] shadow-xs flex flex-col justify-between gap-2">
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-[#7A8C6E]">
                        <span className="flex items-center gap-1.5">
                          <span>{item.icon}</span>
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

        {/* ── CARD 2: PHASE 2 — ML MATERIAL QUANTITY PREDICTION ── */}
        <div
          className="rounded-3xl border overflow-hidden shadow-md"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="p-6 sm:p-8 bg-[#2E7D52] text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2 bg-emerald-950 text-emerald-300 border border-emerald-600/50">
                🤖 Phase 2 · ML Material Quantity Prediction
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
                <span className="text-lg">🏗️</span>
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
                <span className="text-lg">🔩</span>
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
                <span className="text-lg">🧱</span>
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
                <span className="text-lg">🏖️</span>
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
                <span className="text-lg">🪨</span>
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
                <span className="text-lg">👷</span>
              </div>
              <div className="text-2xl font-extrabold text-[#1A4D2E] tabular-nums">
                {quantities.ml.labour_man_days} <span className="text-sm font-semibold text-[#7A8C6E]">Man-days</span>
              </div>
              <div className="text-xs font-medium text-[#2E7D52]">70% Skilled Masons &amp; 30% Helper Labourers</div>
            </div>

            {/* Architectural ratios */}
            <div className="p-5 rounded-2xl bg-[#EDE8DC] border border-[#DDD8CD] shadow-xs flex flex-col gap-1 md:col-span-2 lg:col-span-3">
              <span className="text-xs font-bold uppercase text-[#1A4D2E]">📐 Derived Architectural Fixtures &amp; Surface Quantities</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="text-xs font-medium text-[#4B5945]">⚡ <strong>Electrical Wiring:</strong> {quantities.derived.electrical_points_count} Points</div>
                <div className="text-xs font-medium text-[#4B5945]">🔧 <strong>Plumbing Connections:</strong> {quantities.derived.plumbing_fixture_count} Fixtures</div>
                <div className="text-xs font-medium text-[#4B5945]">🎨 <strong>Paintable Surface Area:</strong> {quantities.derived.paintable_area_sqft.toLocaleString()} Sq Ft</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── CARD 3: PHASE 3 — EMBODIED CARBON FOOTPRINT ── */}
        {carbon_footprint && (
          <div
            className="rounded-3xl border overflow-hidden shadow-md"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="p-6 sm:p-8 bg-[#0284C7] text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2 bg-sky-950 text-cyan-200 border border-cyan-500/50">
                  🌱 Phase 3 · Embodied Carbon Footprint
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
                  <span className="text-2xl">🌿</span>
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

              {/* Carbon Mitigation Tips */}
              <div className="p-4 rounded-2xl bg-white border border-[#DDD8CD] shadow-xs flex flex-col gap-2">
                <span className="text-xs font-bold uppercase text-[#1A4D2E]">💡 Eco-Optimization Recommendations</span>
                <ul className="list-disc list-inside text-xs text-[#4B5945] flex flex-col gap-1">
                  {carbon_footprint.reduction_tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
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
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg transition-all cursor-pointer text-center"
            style={{ background: 'linear-gradient(135deg, #D4541A, var(--rust))' }}
          >
            📄 Export / Print Report
          </button>
        </div>
      </div>
    </div>
  );
}
