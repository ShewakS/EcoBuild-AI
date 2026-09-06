import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-6 py-20"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Hero */}
      <div className="text-center max-w-2xl mb-14">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 tracking-wide uppercase"
          style={{ background: 'var(--bg-muted)', color: 'var(--green-muted)' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: 'var(--green-mid)' }}
          />
          AI Cost &amp; Quantity Estimation Platform · Tamil Nadu
        </div>

        <h1
          className="text-5xl font-extrabold tracking-tight mb-5 leading-tight"
          style={{ color: 'var(--green-deep)' }}
        >
          Build smarter.<br />
          <span style={{ color: 'var(--rust)' }}>Price it right.</span>
        </h1>

        <p className="text-lg leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          EcoBuild AI uses advanced machine learning: XGBoost predicts total project cost and
          required material quantities, coupled with IFC Indian embodied carbon emission analytics.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
        {/* Cost Estimation */}
        <Link
          to="/cost-estimation"
          id="home-cost-estimation-link"
          className="group block rounded-2xl p-8 border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-card)',
            textDecoration: 'none',
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform duration-200 group-hover:scale-110"
            style={{ background: 'linear-gradient(135deg, var(--green-mid), var(--green-deep))' }}
          >
            🏗️
          </div>
          <h2
            className="text-xl font-bold mb-2 group-hover:underline decoration-2 underline-offset-2"
            style={{ color: 'var(--green-deep)' }}
          >
            Cost Estimation
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Enter your project specifications across room dimensions, structural parameters, and
            finishes to generate ML-powered cost, material quantities, and carbon footprint predictions.
          </p>
          <div
            className="mt-5 inline-flex items-center gap-1 text-sm font-semibold"
            style={{ color: 'var(--green-mid)' }}
          >
            Estimate now
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Carbon Footprint info card */}
        <div
          id="home-carbon-info-card"
          className="rounded-2xl p-8 border"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #0284C7, #0369A1)' }}
          >
            🌱
          </div>
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: 'var(--green-deep)' }}
          >
            Carbon Footprint Analysis
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Automatically included with every estimation. IFC Indian emission factors calculate
            embodied carbon per material (tCO₂e), green building rating, and eco-optimization tips.
          </p>
          <div
            className="mt-5 inline-flex items-center gap-1 text-sm font-semibold"
            style={{ color: '#0284C7' }}
          >
            Included in estimation
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* AI Features explanation */}
      <div
        className="mt-12 max-w-3xl w-full rounded-2xl p-6 border"
        style={{
          background: 'var(--panel-bg)',
          borderColor: 'var(--panel-muted)',
        }}
      >
        <div className="flex items-start gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--green-muted)' }}>
              Three-Phase Intelligence Architecture
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              {[
                { icon: '💰', title: 'Phase 1 — ML Cost Prediction', body: 'Trained XGBoost model predicts project cost directly based on location, area, structure, and finishes.' },
                { icon: '🤖', title: 'Phase 2 — ML Material Quantities', body: 'Stage 1 ML Regressor predicts exact physical quantities of cement, steel, bricks, sand, and aggregate.' },
                { icon: '🌱', title: 'Phase 3 — Carbon Footprint', body: 'Calculates embodied carbon emissions (tCO₂e) and energy using official IFC Indian construction factors.' },
              ].map(({ icon, title, body }) => (
                <div key={title} className="flex flex-col gap-1.5">
                  <div className="text-xl">{icon}</div>
                  <div className="font-semibold" style={{ color: 'white' }}>{title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', lineHeight: '1.5' }}>{body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
