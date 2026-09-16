import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { postEcoRecommendations, postEstimateCost, getEcoRules } from '../Assets/api';
import SustainabilityScoreRing from '../Components/SustainabilityScoreRing';
import EcoMaterialRecommendations from '../Components/EcoMaterialRecommendations';
import { Lightbulb, X, Pin, Boxes, Home, Sparkles, Tag, Sun, Droplets, BarChart3, ArrowRight } from 'lucide-react';

export default function Recommendations() {
  const navigate = useNavigate();

  const [estimate, setEstimate] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedRuleIds, setAppliedRuleIds] = useState([]);
  const [notification, setNotification] = useState(null);

  // Default project inputs if none in storage
  const defaultInputs = {
    district: 'Chennai',
    building_type: 'Residential',
    residential_type: 'Individual Villa',
    built_up_area_sqft: 1500,
    plot_area_sqft: 2000,
    floors: 1,
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    soil_type: 'Sandy',
    land_type: 'Flat',
    foundation_type: 'Strip',
    foundation_depth_ft: 5,
    wall_material: 'Brick',
    roof_type: 'RCC Flat',
    flooring: 'Marble',
    finish_quality: 'Premium',
    solar_panels: false,
    rainwater_harvesting: false,
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      let activeInputs = defaultInputs;
      let activeEstimate = null;

      try {
        const stored = sessionStorage.getItem('ecobuild_latest_estimate');
        if (stored) {
          activeEstimate = JSON.parse(stored);
          setEstimate(activeEstimate);
          activeInputs = activeEstimate.inputs;
        }
      } catch {
        // ignore
      }

      try {
        const [recsRes, rulesRes] = await Promise.all([
          postEcoRecommendations(activeInputs),
          getEcoRules().catch(() => []),
        ]);
        setRecommendations(recsRes.recommendations || []);
        setRules(rulesRes || []);
      } catch (err) {
        console.error('Failed to load recommendations:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyRecommendation = async (rec) => {
    setIsApplying(true);
    setNotification(null);

    try {
      const currentInputs = estimate ? estimate.inputs : defaultInputs;
      const updatedInputs = {
        ...currentInputs,
        ...rec.apply_field_update,
      };

      // Recalculate full estimation (Cost ML + Material ML + Carbon IFC + Sustainability Rule Engine)
      const newEstimate = await postEstimateCost(updatedInputs);
      setEstimate(newEstimate);
      sessionStorage.setItem('ecobuild_latest_estimate', JSON.stringify(newEstimate));

      // Re-evaluate recommendations
      const newRecs = await postEcoRecommendations(updatedInputs);
      setRecommendations(newRecs.recommendations || []);
      setAppliedRuleIds((prev) => [...prev, rec.rule_id]);

      setNotification({
        type: 'success',
        message: `Applied "${rec.suggested_alternative}"! Cost, carbon, and sustainability scores were recalculated automatically.`,
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Failed to recalculate estimation. Please try again.',
      });
    } finally {
      setIsApplying(false);
    }
  };

  const inputs = estimate ? estimate.inputs : defaultInputs;
  const sustainability = estimate ? estimate.sustainability_score : null;

  return (
    <div className="flex-1 flex flex-col pb-16" style={{ background: 'var(--bg-base)' }}>
      {/* ── Top Header Banner ── */}
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
            <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-emerald-100 text-[#1A4D2E] shadow-2xs">
              <Lightbulb size={20} />
            </span>
            <div>
              <h1 className="text-lg font-extrabold text-[#1A4D2E]">Eco-Material Recommendations Engine</h1>
              <p className="text-xs text-[#7A8C6E]">
                Explainable low-carbon substitutions stored in MongoDB &amp; evaluated on your project specs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/cost-estimation/results')}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-[#DDD8CD] bg-white text-[#1A4D2E] hover:bg-[#EDE8DC] transition-all cursor-pointer shadow-xs"
            >
              ← Back to Estimation Report
            </button>
            <Link
              to="/cost-estimation"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:shadow-md transition-all cursor-pointer"
              style={{ background: 'linear-gradient(135deg, var(--green-mid), var(--green-deep))', textDecoration: 'none' }}
            >
              Edit Specs
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8">
        {/* Notification Toast */}
        {notification && (
          <div
            className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-red-50 border-red-300 text-red-900'
            }`}
          >
            <span>{notification.message}</span>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-gray-500 hover:text-gray-800 ml-4 font-extrabold text-sm"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── PROJECT PARAMETERS SUMMARY ── */}
        <div
          className="rounded-3xl border p-6 flex flex-col gap-3 shadow-xs bg-white"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: 'var(--border)' }}>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1A4D2E] inline-flex items-center gap-1">
              <Pin size={14} /> Evaluated Project Specifications
            </span>
            <span className="text-xs font-semibold text-[#7A8C6E]">
              {inputs.district}, Tamil Nadu · {inputs.built_up_area_sqft} sqft
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { label: 'Wall Material', val: inputs.wall_material, Icon: Boxes },
              { label: 'Roof Type', val: inputs.roof_type, Icon: Home },
              { label: 'Flooring', val: inputs.flooring, Icon: Sparkles },
              { label: 'Quality', val: inputs.finish_quality, Icon: Tag },
              { label: 'Solar Panels', val: inputs.solar_panels ? 'Installed (Yes)' : 'None (No)', Icon: Sun },
              { label: 'Rainwater Harvesting', val: inputs.rainwater_harvesting ? 'Installed (Yes)' : 'None (No)', Icon: Droplets },
            ].map(({ label, val, Icon }) => (
              <span key={label} className="px-3 py-1.5 rounded-xl bg-[#EDE8DC] text-xs font-semibold text-[#1A4D2E] inline-flex items-center gap-1.5">
                <Icon size={14} /> <strong>{label}:</strong> {val}
              </span>
            ))}
          </div>
        </div>

        {/* ── SUSTAINABILITY SCORE OVERVIEW (IF ESTIMATE EXISTS) ── */}
        {sustainability && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <SustainabilityScoreRing sustainability={sustainability} size={170} />
            </div>
            <div className="lg:col-span-2 rounded-3xl border border-[#DDD8CD] bg-white p-6 shadow-xs flex flex-col justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-100 text-[#1A4D2E] mb-2">
                  <BarChart3 size={14} /> Live Environmental Impact
                </div>
                <h3 className="text-lg font-extrabold text-[#1A4D2E]">Instant Optimization Impact</h3>
                <p className="text-xs text-[#7A8C6E] mt-1 leading-relaxed">
                  When you click <strong>"Apply this suggestion"</strong>, EcoBuild AI instantaneously updates your specifications, queries the XGBoost ML models, calculates embodied carbon via the IFC Indian dataset, and updates your Sustainability Index.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="p-3 rounded-2xl bg-[#EDE8DC] text-center">
                  <div className="text-[11px] font-bold text-[#7A8C6E] uppercase">Current Score</div>
                  <div className="text-xl font-extrabold text-[#1A4D2E] mt-0.5">{sustainability.score} / 100</div>
                  <div className="text-[10px] text-[#2E7D52] font-semibold">{sustainability.band}</div>
                </div>

                <div className="p-3 rounded-2xl bg-[#EDE8DC] text-center">
                  <div className="text-[11px] font-bold text-[#7A8C6E] uppercase">Embodied Carbon</div>
                  <div className="text-xl font-extrabold text-[#1A4D2E] mt-0.5">
                    {sustainability.carbon_footprint_kgco2e_per_sqft} <span className="text-xs">kg/sqft</span>
                  </div>
                  <div className="text-[10px] text-[#7A8C6E]">Baseline: 36.0</div>
                </div>

                <div className="p-3 rounded-2xl bg-[#EDE8DC] text-center col-span-2 sm:col-span-1">
                  <div className="text-[11px] font-bold text-[#7A8C6E] uppercase">Waste Allowance</div>
                  <div className="text-xl font-extrabold text-[#1A4D2E] mt-0.5">{sustainability.waste_percent}%</div>
                  <div className="text-[10px] text-[#7A8C6E]">Baseline: 5.0%</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── RECOMMENDATION CARDS DECK ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 border-4 border-[#1A4D2E] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-[#1A4D2E]">Evaluating eco-material rules…</p>
          </div>
        ) : (
          <EcoMaterialRecommendations
            recommendations={recommendations}
            onApplyRecommendation={handleApplyRecommendation}
            isApplying={isApplying}
            appliedRuleIds={appliedRuleIds}
          />
        )}

        {/* ── MONGODB RULES TRANSPARENCY ACCORDION ── */}
        {rules && rules.length > 0 && (
          <div className="rounded-3xl border border-[#DDD8CD] bg-[#EDE8DC]/40 p-6 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-[#1A4D2E]">Active Rules in MongoDB</h4>
                <p className="text-xs text-[#7A8C6E]">
                  Rules stored in the <code className="text-xs bg-white px-1.5 py-0.5 rounded border border-[#DDD8CD]">eco_material_rules</code> collection. New rules can be added via admin/DB without deploying code.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white text-[#1A4D2E] border border-[#DDD8CD]">
                {rules.length} Rules Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {rules.map((rule) => (
                <div key={rule.rule_id} className="p-3.5 rounded-2xl bg-white border border-[#DDD8CD] text-xs flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#1A4D2E]">{rule.category}</span>
                    <span className="text-[10px] font-mono text-gray-500">{rule.rule_id}</span>
                  </div>
                  <div className="text-gray-700">
                    IF <strong className="text-gray-900">{rule.field}</strong> {rule.condition_operator} <em>{JSON.stringify(rule.condition_value)}</em>
                    {rule.secondary_condition && ` AND ${rule.secondary_condition.field} ${rule.secondary_condition.operator} ${rule.secondary_condition.value}`}
                  </div>
                  <div className="text-emerald-800 font-semibold inline-flex items-center gap-1"><ArrowRight size={14} /> Suggest: {rule.suggested_alternative}</div>
                  <div className="text-[11px] text-[#7A8C6E] italic mt-0.5">{rule.reason}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
