import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

const ARCHITECT_LINKS = [
  { to: '/projects', label: 'Projects Workspace' },
  { to: '/cost-estimation', label: 'Cost & Material Estimator' },
  { to: '/recommendations', label: 'Eco-Material Recommendations' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header
      className="sticky top-0 z-50 w-full border-b"
      style={{
        background: 'rgba(245,240,232,0.95)',
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
              SaaS Construction Platform
            </span>
          </span>
        </Link>

        {/* ── Nav links according to role ── */}
        <nav className="flex items-center gap-2" aria-label="Main navigation">
          {(!isAuthenticated || role === 'ARCHITECT') && (
            <>
              {ARCHITECT_LINKS.map(({ to, label }) => {
                const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
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
            </>
          )}

          {role === 'SUPER_ADMIN' && (
            <Link
              to="/admin/dashboard"
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-sm"
              style={{ background: '#c53030', textDecoration: 'none' }}
            >
              🛡️ Admin Console
            </Link>
          )}

          {role === 'CUSTOMER' && (
            <Link
              to="/customer/dashboard"
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-sm"
              style={{ background: '#2d6a4f', textDecoration: 'none' }}
            >
              🏡 Customer Portal
            </Link>
          )}

          {/* User badge & Authentication buttons */}
          <div className="flex items-center gap-2 ml-3 pl-3 border-l" style={{ borderColor: 'var(--border)' }}>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-gray-800 leading-tight">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded text-white inline-block mt-0.5"
                    style={{
                      background: role === 'SUPER_ADMIN' ? '#991b1b' : role === 'CUSTOMER' ? '#92400e' : '#1e40af'
                    }}
                  >
                    {role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-1.5 text-xs font-bold rounded-lg text-white transition-transform active:scale-95"
                style={{ background: 'var(--green-deep)', textDecoration: 'none' }}
              >
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

