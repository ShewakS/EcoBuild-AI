import React, { useState } from 'react';
import { Leaf } from 'lucide-react';

export default function EcoMaterialRecommendations({
  recommendations = [],
  onApplyRecommendation,
  isApplying = false,
  appliedRuleIds = [],
}) {
  const [activeApplyingId, setActiveApplyingId] = useState(null);

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="rounded-3xl border border-[#DDD8CD] bg-white p-6 sm:p-8 shadow-xs text-center flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
          <Leaf size={24} color="#1A4D2E" />
        </div>
        <div>
          <h4 className="text-base font-extrabold text-[#1A4D2E]">Optimal Eco-Materials Selected</h4>
          <p className="text-xs text-[#7A8C6E] max-w-md mx-auto mt-1">
            Your current material selections already align with green building best practices for this project scope.
          </p>
        </div>
      </div>
    );
  }

  const handleApply = async (rec) => {
    if (!onApplyRecommendation) return;
    setActiveApplyingId(rec.rule_id);
    try {
      await onApplyRecommendation(rec);
    } finally {
      setActiveApplyingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-100 text-[#1A4D2E] mb-1">
            🌿 Low-Carbon Material Alternatives
          </div>
          <h3 className="text-xl font-extrabold text-[#1A4D2E]">Explainable Eco Recommendations</h3>
          <p className="text-xs text-[#7A8C6E]">
            Rule-based suggestions tailored to your project specs to reduce embodied carbon and boost sustainability.
          </p>
        </div>
        <span className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-[#EDE8DC] text-xs font-bold text-[#1A4D2E]">
          {recommendations.length} Optimization{recommendations.length > 1 ? 's' : ''} Available
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {recommendations.map((rec) => {
          const isApplied = appliedRuleIds.includes(rec.rule_id);
          const isCurrentApplying = isApplying && activeApplyingId === rec.rule_id;

          // Cost delta badge styling
          let deltaBadge = null;
          if (rec.estimated_cost_delta_percent !== null && rec.estimated_cost_delta_percent !== undefined) {
            const delta = rec.estimated_cost_delta_percent;
            const isSaving = delta < 0;
            const deltaText = isSaving ? `${delta}% material cost` : `+${delta}% material cost`;

            deltaBadge = (
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                  isSaving
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-stone-100 text-stone-700 border-stone-300'
                }`}
              >
                {deltaText}
              </span>
            );
          }

          return (
            <div
              key={rec.rule_id}
              className={`rounded-3xl border bg-white p-6 shadow-xs flex flex-col justify-between gap-4 transition-all duration-200 ${
                isApplied ? 'ring-2 ring-emerald-600/40 bg-emerald-50/20' : 'hover:shadow-md'
              }`}
              style={{ borderColor: isApplied ? '#2E7D52' : 'var(--border)' }}
            >
              <div className="flex flex-col gap-3">
                {/* Header: Category & Cost Delta */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#7A8C6E]">
                    {rec.category || 'Material Specification'}
                  </span>
                  {deltaBadge}
                </div>

                {/* Switcher Card: Current Choice -> Suggested Alternative */}
                <div className="rounded-2xl p-3.5 bg-[#EDE8DC]/50 border border-[#DDD8CD] flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] font-bold uppercase text-[#7A8C6E] block">Current</span>
                    <span className="text-xs font-bold text-gray-700">{rec.current_choice}</span>
                  </div>
                  <div className="px-2 text-sm text-[#1A4D2E] font-extrabold">➔</div>
                  <div className="flex-1 text-right">
                    <span className="text-[10px] font-bold uppercase text-emerald-700 block">Suggested</span>
                    <span className="text-xs font-extrabold text-[#1A4D2E]">{rec.suggested_alternative}</span>
                  </div>
                </div>

                {/* Reason Explanation */}
                <p className="text-xs text-[#4B5945] leading-relaxed">
                  💡 <strong className="text-[#1A4D2E]">Why:</strong> {rec.reason}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                {isApplied ? (
                  <div className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-[#1A4D2E]">
                    <span>✓</span>
                    <span>Applied to Project</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isApplying}
                    onClick={() => handleApply(rec)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, var(--green-mid), var(--green-deep))',
                      opacity: isApplying ? 0.7 : 1,
                    }}
                  >
                    {isCurrentApplying ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Recalculating Impact…</span>
                      </>
                    ) : (
                      <>
                        <span>⚡ Apply this suggestion</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
