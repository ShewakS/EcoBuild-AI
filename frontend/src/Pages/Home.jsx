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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-5xl">
        {/* Architect Workspace */}
        <Link
          to="/projects"
          id="home-architect-workspace-link"
          className="group block rounded-2xl p-7 border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F5FBF7 100%)',
            borderColor: 'var(--green-mid)',
            boxShadow: 'var(--shadow-card)',
            textDecoration: 'none',
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform duration-200 group-hover:scale-110"
            style={{ background: 'linear-gradient(135deg, var(--green-mid), var(--green-deep))' }}
          >
            📐
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--green-mid)] mb-1">
            New Command Center
          </div>
          <h2
            className="text-xl font-bold mb-2 group-hover:underline decoration-2 underline-offset-2"
            style={{ color: 'var(--green-deep)' }}
          >
            Architect Workspace
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Manage construction projects, 11-stage progress monitoring, CPWD waste compliance, site inspection photos, and sustainability scoring.
          </p>
          <div
            className="mt-5 inline-flex items-center gap-1 text-sm font-semibold"
            style={{ color: 'var(--green-deep)' }}
          >
            Open workspace
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Cost Estimation */}
        <Link
          to="/cost-estimation"
          id="home-cost-estimation-link"
          className="group block rounded-2xl p-7 border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-card)',
            textDecoration: 'none',
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform duration-200 group-hover:scale-110"
            style={{ background: 'linear-gradient(135deg, var(--rust), #B23B0E)' }}
          >
            🏗️
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            ML Models
          </div>
          <h2
            className="text-xl font-bold mb-2 group-hover:underline decoration-2 underline-offset-2"
            style={{ color: 'var(--green-deep)' }}
          >
            Cost Estimation
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Enter specifications to generate XGBoost cost, material quantities, and Indian embodied carbon footprint predictions.
          </p>
          <div
            className="mt-5 inline-flex items-center gap-1 text-sm font-semibold"
            style={{ color: 'var(--rust)' }}
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
          className="rounded-2xl p-7 border"
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
          <div className="text-[10px] font-bold uppercase tracking-wider text-sky-600 mb-1">
            IFC Indian Standards
          </div>
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: 'var(--green-deep)' }}
          >
            Carbon Analytics
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Official IFC Indian emission factors calculate embodied carbon per material (tCO₂e), green rating, and eco-optimizations.
          </p>
          <div
            className="mt-5 inline-flex items-center gap-1 text-sm font-semibold"
            style={{ color: '#0284C7' }}
          >
            Included in system
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
