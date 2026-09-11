import React from 'react';
import { Link } from 'react-router-dom';
import {
  BrainCircuit, IndianRupee, Leaf, Star, Trash2, RefreshCw,
  CheckCircle, ArrowRight, Building2, Users, BarChart3
} from 'lucide-react';
import Hero from '../Components/Hero';
import './LandingPage.css';

/* ── Feature list ── */
const FEATURES = [
  {
    Icon: BrainCircuit,
    title: 'AI Quantity Prediction',
    desc: 'XGBoost ML model predicts material quantities — cement, steel, sand, bricks — trained on Indian construction data.',
  },
  {
    Icon: IndianRupee,
    title: 'Cost Estimation',
    desc: 'CPWD-aligned cost breakdowns per line item. Transparent, market-current estimates in seconds.',
  },
  {
    Icon: Leaf,
    title: 'Carbon Analytics',
    desc: 'IFC Indian emission factors compute embodied carbon per material in tCO2e with green rating benchmarks.',
  },
  {
    Icon: Star,
    title: 'Sustainability Scoring',
    desc: 'Rule-based 0-100 score with solar, rainwater, material type, waste, and carbon factor breakdowns.',
  },
  {
    Icon: Trash2,
    title: 'CPWD Waste Tracking',
    desc: 'CPWD / BMTPC / NICMAR waste benchmarks flag compliance issues per material category.',
  },
  {
    Icon: RefreshCw,
    title: 'Safe Material Reuse',
    desc: 'Evaluate recovered materials for safe re-entry with safety classification and condition checks.',
  },
];

/* ── Roles ── */
const ROLES = [
  {
    Icon: Building2,
    label: 'Super Admin',
    title: 'Platform Control',
    desc: 'Full platform oversight — manage architects, subscriptions, usage analytics, and all active projects.',
    feats: ['Manage Architect Accounts', 'Control Subscription Plans', 'View All Projects', 'Platform Analytics'],
    color: 'var(--alert)',
    bg: '#FAF0EB',
    border: '#E5C0AA',
  },
  {
    Icon: Users,
    label: 'Architect',
    title: 'Workspace Command',
    desc: 'End-to-end project management with AI cost, material, carbon, and sustainability intelligence.',
    feats: ['AI Cost and Quantity Estimation', '11-Stage Progress Monitoring', 'Carbon Analytics', 'Site Inspection Gallery'],
    color: 'var(--blueprint)',
    bg: 'var(--blueprint-light)',
    border: '#AABFEA',
  },
  {
    Icon: BarChart3,
    label: 'Customer',
    title: 'Project Visibility',
    desc: 'Read-only portal giving homeowners full transparency into their construction project status.',
    feats: ['Real-Time Progress Tracking', 'Material and Cost Breakdown', 'Sustainability Score View', 'Site Photo Gallery'],
    color: 'var(--eco)',
    bg: 'var(--eco-light)',
    border: '#91CCAA',
  },
];

/* ── Main page ── */
export default function LandingPage() {
  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh', fontFamily: 'var(--font-sans)' }}>

      {/* ── HERO ── */}
      <Hero />

      {/* ── DIVIDER ── */}
      <hr className="divider" style={{ margin: 0 }} />

      {/* ── FEATURES ── */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div className="section-container">
          <div className="section-label">Platform Capabilities</div>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 700,
              color: 'var(--ink)',
              marginBottom: '0.75rem',
              maxWidth: 540,
            }}
          >
            Six modules. One estimation pipeline.
          </h2>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', marginBottom: '3rem', maxWidth: 520, lineHeight: 1.7 }}>
            From initial quantity prediction to green certification benchmarks — all
            computed from one set of project inputs.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1px',
              border: '1px solid var(--concrete)',
              borderRadius: 'var(--r-card)',
              overflow: 'hidden',
              background: 'var(--concrete)',
            }}
          >
            {FEATURES.map(({ Icon, title, desc }) => (
              <div
                key={title}
                style={{
                  background: '#ffffff',
                  padding: '1.5rem',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--blueprint-light)'}
                onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
              >
                <div style={{ marginBottom: '0.75rem' }}>
                  <Icon size={20} color="var(--blueprint)" strokeWidth={1.5} />
                </div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.4rem' }}>
                  {title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider" style={{ margin: 0 }} />

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--ink)' }}>
        <div className="section-container">
          <div className="section-label" style={{ color: 'var(--blueprint-200, #AABFEA)' }}>
            Estimation Pipeline
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '0.75rem',
            }}
          >
            How one project input becomes six outputs.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', marginBottom: '3rem', maxWidth: 480, lineHeight: 1.7 }}>
            A single set of building parameters runs through six sequential modules
            to produce quantities, cost, carbon, sustainability, waste, and reuse analysis.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0', maxWidth: 720 }}>
            {[
              { n: '01', label: 'ML Quantities', desc: 'XGBoost predicts cement bags, steel kg, bricks, sand, and aggregate from 35 features.' },
              { n: '02', label: 'Cost Breakdown', desc: 'CPWD unit rates applied to quantities give material, labour, and overhead cost per item.' },
              { n: '03', label: 'Carbon Footprint', desc: 'IFC Indian emission factors compute kgCO2e per material with intensity and green ratings.' },
              { n: '04', label: 'Sustainability Score', desc: 'Rule-based 0-100 score covering solar, rainwater, material type, waste, and carbon.' },
              { n: '05', label: 'Waste Analysis', desc: 'CPWD / BMTPC benchmarks flag waste percentage compliance per material.' },
              { n: '06', label: 'Reuse Evaluation', desc: 'Safety classification for recovered materials entering the project stream.' },
            ].map((step, i, arr) => (
              <div
                key={step.n}
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  padding: '1.25rem 0',
                  borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    color: 'var(--blueprint)',
                    fontWeight: 500,
                    minWidth: 28,
                    paddingTop: 3,
                  }}
                >
                  {step.n}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.25rem' }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                    {step.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider" style={{ margin: 0, borderColor: 'rgba(255,255,255,0.08)' }} />

      {/* ── ROLES ── */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div className="section-container">
          <div className="section-label">Access Model</div>
          <h2
            style={{
              fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
              fontWeight: 700,
              color: 'var(--ink)',
              marginBottom: '0.75rem',
            }}
          >
            Three portals. One platform.
          </h2>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.875rem', marginBottom: '3rem', maxWidth: 480, lineHeight: 1.7 }}>
            Purpose-built dashboards for every stakeholder. Access is granted by administrators
            — no public self-registration.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1rem',
            }}
          >
            {ROLES.map(({ Icon, label, title, desc, feats, color, bg, border }) => (
              <div
                key={label}
                className="card"
                style={{ padding: '1.5rem', borderColor: border }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                  <Icon size={16} color={color} strokeWidth={1.5} />
                  <span
                    className="badge"
                    style={{ background: bg, color, border: `1px solid ${border}` }}
                  >
                    {label}
                  </span>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.4rem' }}>
                  {title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
                  {desc}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {feats.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--ink)' }}>
                      <CheckCircle size={12} color={color} strokeWidth={2} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider" style={{ margin: 0 }} />

      {/* ── CTA ── */}
      <section
        style={{ padding: '4rem 1.5rem', background: 'var(--blueprint-light)' }}
      >
        <div
          className="section-container"
          style={{ textAlign: 'center', maxWidth: 560 }}
        >
          <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.75rem' }}>
            Request access to EcoBuild AI.
          </h2>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            Accounts are created by your platform administrator. Contact us to get set up
            or sign in if you already have credentials.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn-primary" id="cta-signin-btn">
              Sign in to Platform
              <ArrowRight size={15} />
            </Link>
            <Link to="/contact" className="btn-secondary" id="cta-contact-btn">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          padding: '2rem 1.5rem',
          borderTop: '1px solid var(--concrete)',
          background: 'var(--ink)',
        }}
      >
        <div
          className="section-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Building2 size={18} color="var(--blueprint)" strokeWidth={1.5} />
            <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem', fontFamily: 'var(--font-sans)' }}>
              EcoBuild AI
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>Smart Construction Platform</span>
          </div>

          <nav style={{ display: 'flex', gap: '1.25rem' }}>
            {[
              { to: '/about', label: 'About Us' },
              { to: '/get-started', label: 'Pricing' },
              { to: '/contact', label: 'Contact' },
              { to: '/login', label: 'Sign In' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-mono)' }}>
            &copy; {new Date().getFullYear()} EcoBuild AI &middot; Tamil Nadu, India
          </div>
        </div>
      </footer>
    </div>
  );
}
