import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import {
  Building2, FolderOpen, Calculator, Leaf, ShieldCheck,
  LayoutDashboard, LogOut, Menu, X, ChevronRight, User
} from 'lucide-react';

/* ── Link sets per role ── */
const PUBLIC_LINKS = [
  { to: '/',            label: 'Home' },
  { to: '/about',       label: 'About' },
  { to: '/get-started', label: 'Pricing' },
  { to: '/contact',     label: 'Contact' },
];

const ARCHITECT_LINKS = [
  { to: '/projects',        label: 'Projects',       Icon: FolderOpen },
  { to: '/cost-estimation', label: 'Cost Estimator', Icon: Calculator },
  { to: '/recommendations', label: 'Eco Materials',  Icon: Leaf },
];

const ADMIN_LINKS = [
  { to: '/admin/dashboard',   label: 'Dashboard',   Icon: LayoutDashboard },
  { to: '/admin/architects',  label: 'Architects',  Icon: Building2 },
  { to: '/admin/projects',    label: 'Projects',    Icon: FolderOpen },
];

const CUSTOMER_LINKS = [
  { to: '/customer/dashboard', label: 'My Project', Icon: LayoutDashboard },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLanding = location.pathname === '/';

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinks = !isAuthenticated
    ? PUBLIC_LINKS
    : role === 'ARCHITECT'
      ? ARCHITECT_LINKS
      : role === 'SUPER_ADMIN'
        ? ADMIN_LINKS
        : role === 'CUSTOMER'
          ? CUSTOMER_LINKS
          : [];

  /* Colors per theme mode */
  const bg = isLanding ? 'rgba(22,33,62,0.92)' : 'rgba(255,255,255,0.97)';
  const borderColor = isLanding ? 'rgba(255,255,255,0.07)' : 'var(--concrete)';
  const textColor = isLanding ? 'rgba(255,255,255,0.8)' : 'var(--ink)';
  const activeBg = isLanding ? 'rgba(43,92,176,0.2)' : 'var(--blueprint-light)';
  const activeColor = isLanding ? '#90B5F0' : 'var(--blueprint)';

  /* Role badge styling */
  const roleMeta = {
    SUPER_ADMIN: { label: 'Super Admin', color: '#C4622D', bg: '#FAF0EB' },
    ARCHITECT:   { label: 'Architect',   color: 'var(--blueprint)', bg: 'var(--blueprint-light)' },
    CUSTOMER:    { label: 'Customer',    color: 'var(--eco)',       bg: 'var(--eco-light)' },
  };
  const rm = roleMeta[role] || roleMeta.ARCHITECT;

  return (
    <>
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 100, width: '100%',
          background: bg,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <div
          style={{
            maxWidth: 1200, margin: '0 auto',
            padding: '0 1.5rem', height: 60,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}
            aria-label="EcoBuild AI home"
          >
            <div
              style={{
                width: 32, height: 32,
                background: 'var(--blueprint)',
                borderRadius: 3,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Building2 size={17} color="#ffffff" strokeWidth={1.5} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isLanding ? '#ffffff' : 'var(--ink)', lineHeight: 1.2, fontFamily: 'var(--font-sans)' }}>
                EcoBuild AI
              </div>
              <div style={{ fontSize: '0.6rem', color: isLanding ? 'rgba(255,255,255,0.35)' : 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
                Smart Construction Platform
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map(({ to, label, Icon }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    padding: '0.4rem 0.75rem',
                    borderRadius: 3,
                    fontSize: '0.82rem', fontWeight: 500,
                    textDecoration: 'none',
                    color: active ? activeColor : textColor,
                    background: active ? activeBg : 'transparent',
                  }}
                  aria-current={active ? 'page' : undefined}
                >
                  {Icon && <Icon size={13} strokeWidth={1.75} />}
                  {label}
                </Link>
              );
            })}

            {/* Admin console shortcut for SUPER_ADMIN when not on admin links */}
            {role === 'SUPER_ADMIN' && (
              <Link
                to="/admin/dashboard"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 3, fontSize: '0.8rem', fontWeight: 600,
                  textDecoration: 'none',
                  background: '#FAF0EB', color: 'var(--alert)',
                  border: '1px solid #E5C0AA',
                }}
              >
                <ShieldCheck size={13} strokeWidth={1.75} />
                Admin Console
              </Link>
            )}

            {/* Divider */}
            <div style={{ width: 1, height: 20, background: borderColor, margin: '0 0.4rem' }} />

            {/* Auth controls */}
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link
                  to="/profile"
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textDecoration: 'none' }}
                  aria-label="Profile"
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isLanding ? '#ffffff' : 'var(--ink)', lineHeight: 1.2 }}>
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <span
                    className="badge"
                    style={{ background: rm.bg, color: rm.color, marginTop: 2, fontSize: '0.6rem' }}
                  >
                    {rm.label}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  id="navbar-logout-btn"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    padding: '0.4rem 0.75rem',
                    background: 'transparent',
                    color: isLanding ? 'rgba(255,255,255,0.5)' : 'var(--ink-muted)',
                    border: `1px solid ${borderColor}`,
                    borderRadius: 3,
                    fontSize: '0.8rem', fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={13} strokeWidth={1.75} />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                id="navbar-signin-btn"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.4rem 1rem',
                  borderRadius: 3, fontSize: '0.82rem', fontWeight: 600,
                  textDecoration: 'none',
                  background: 'var(--blueprint)',
                  color: '#ffffff',
                }}
              >
                Sign In
                <ChevronRight size={13} strokeWidth={2} />
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-[#16213E] focus:outline-none"
            aria-label="Toggle navigation menu"
            style={{ color: isLanding ? '#ffffff' : 'var(--ink)' }}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div
            className="md:hidden border-b px-6 py-4 flex flex-col gap-3"
            style={{ background: bg, borderColor: borderColor }}
          >
            {navLinks.map(({ to, label, Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-medium py-1.5"
                style={{ color: isActive(to) ? activeColor : textColor }}
              >
                {Icon && <Icon size={15} />}
                {label}
              </Link>
            ))}
            {!isAuthenticated && (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="btn-primary justify-center text-xs py-2 mt-2"
              >
                Sign In <ChevronRight size={14} />
              </Link>
            )}
          </div>
        )}
      </header>
    </>
  );
}
