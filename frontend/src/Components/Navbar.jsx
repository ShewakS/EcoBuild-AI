import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/cost-estimation', label: 'Cost Estimation' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <header
      className="sticky top-0 z-50 w-full border-b"
      style={{
        background: 'rgba(245,240,232,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="EcoBuild AI home" style={{ textDecoration: 'none' }}>
          <span
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm group-hover:scale-105 transition-transform duration-200"
            style={{ background: 'linear-gradient(135deg, var(--green-mid), var(--green-deep))' }}
            aria-hidden="true"
          >
            🌿
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base tracking-tight" style={{ color: 'var(--green-deep)', fontWeight: 800 }}>
              EcoBuild AI
            </span>
            <span className="text-xs" style={{ color: 'var(--green-muted)', fontWeight: 500 }}>
              Tamil Nadu Construction Costs
            </span>
          </span>
        </Link>

        {/* ── Nav links ── */}
        <nav className="flex items-center gap-1" aria-label="Main navigation">
          {NAV_LINKS.map(({ to, label }) => {
            const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
            return (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive ? 'text-white shadow-sm' : 'hover:text-[var(--green-deep)]'
                }`}
                style={
                  isActive
                    ? { background: 'var(--green-deep)', color: 'white', textDecoration: 'none' }
                    : { color: 'var(--text-body)', textDecoration: 'none' }
                }
                aria-current={isActive ? 'page' : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
