import React from 'react';
import { Leaf } from 'lucide-react';

export default function SustainabilityScoreRing({ sustainability, size = 180, isClientView = false }) {
  if (!sustainability) return null;

  const {
    score = 50,
    band = 'Fair',
    breakdown = [],
    waste_percent = 5.0,
    carbon_footprint_kgco2e_per_sqft = 36.0,
    baseline_carbon_per_sqft = 36.0,
  } = sustainability;

  // Band color mappings matching the app's palette
  // Excellent / Good: Forest Green (#1A4D2E / #2E7D52)
  // Fair: Muted Amber (#D97706)
  // Needs Improvement: Muted Rust (#D4541A)
  let ringColor = '#2E7D52';
  let badgeBg = '#E8F5E9';
  let badgeText = '#1A4D2E';
  let bandBorder = '#A5D6A7';

  if (band === 'Excellent') {
    ringColor = '#1A4D2E';
    badgeBg = '#E8F5E9';
    badgeText = '#1A4D2E';
    bandBorder = '#81C784';
  } else if (band === 'Good') {
    ringColor = '#2E7D52';
    badgeBg = '#E8F5E9';
    badgeText = '#2E7D52';
    bandBorder = '#A5D6A7';
  } else if (band === 'Fair') {
    ringColor = '#D97706';
    badgeBg = '#FEF3C7';
    badgeText = '#92400E';
    bandBorder = '#FCD34D';
  } else {
    // Needs Improvement
    ringColor = '#D4541A';
    badgeBg = '#FFEDD5';
    badgeText = '#9A3412';
    bandBorder = '#FDBA74';
  }

  // SVG circular geometry
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  return (
    <div
      className={`rounded-3xl border flex flex-col transition-all shadow-xs ${
        isClientView ? 'p-6 sm:p-8 bg-white' : 'p-6 bg-white'
      }`}
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: badgeBg }}>
            <Leaf size={16} color="var(--eco)" />
          </span>

          <div>
            <h3 className="text-sm font-extrabold text-[#1A4D2E]">Sustainability Score</h3>
            <p className="text-[11px] text-[#7A8C6E]">Explainable rule-based environmental rating</p>
          </div>
        </div>
        <span
          className="px-3 py-1 rounded-full text-xs font-extrabold border shadow-2xs"
          style={{ background: badgeBg, color: badgeText, borderColor: bandBorder }}
        >
          {band}
        </span>
      </div>

      {/* Center Circular Ring */}
      <div className="flex flex-col items-center justify-center py-6">
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#EDE8DC"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress Stroke */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={ringColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
            />
          </svg>

          {/* Centered Score Label */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight tabular-nums" style={{ color: ringColor }}>
              {score}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A8C6E]">out of 100</span>
          </div>
        </div>

        {/* Benchmarks summary */}
        <div className="flex items-center justify-center gap-4 mt-2 text-center text-xs text-[#7A8C6E]">
          <div>
            Embodied Carbon: <strong className="text-[#1A4D2E]">{carbon_footprint_kgco2e_per_sqft}</strong> kg/sqft
          </div>
          <div>•</div>
          <div>
            Job-site Waste: <strong className="text-[#1A4D2E]">{waste_percent}%</strong>
          </div>
        </div>
      </div>

      {/* Contributing Factor Pills List */}
      <div className="flex flex-col gap-2 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1A4D2E]">Contributing Factors</span>
          <span className="text-[11px] text-[#7A8C6E]">Starting baseline: 50 pts</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {breakdown.map((item, idx) => {
            const isBase = item.factor.includes('Baseline');
            const isPositive = item.points > 0 && !isBase;
            const isNegative = item.points < 0;

            let pillBg = '#F3F4F6';
            let pillBorder = '#E5E7EB';
            let pillText = '#4B5563';

            if (isBase) {
              pillBg = '#EDE8DC';
              pillBorder = '#DDD8CD';
              pillText = '#1A4D2E';
            } else if (isPositive) {
              pillBg = '#ECFDF5';
              pillBorder = '#A7F3D0';
              pillText = '#065F46';
            } else if (isNegative) {
              pillBg = '#FEF2F2';
              pillBorder = '#FECACA';
              pillText = '#991B1B';
            }

            return (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium shadow-2xs group relative cursor-default"
                style={{ background: pillBg, borderColor: pillBorder, color: pillText }}
                title={item.description}
              >
                <span className="font-extrabold">
                  {isBase ? '50' : item.points > 0 ? `+${item.points}` : item.points}
                </span>
                <span>{item.factor}</span>
              </div>
            );
          })}
        </div>

        {isClientView && (
          <p className="text-xs text-[#7A8C6E] mt-2 italic leading-relaxed">
            Every project starts at a 50-point benchmark. Clean energy adoption and eco-materials boost your score, while material waste and embodied emissions reduce it.
          </p>
        )}
      </div>
    </div>
  );
}
