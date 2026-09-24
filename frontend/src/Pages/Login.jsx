import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Cpu, Leaf, BarChart3, Building2 } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const query = new URLSearchParams(location.search);
  const isExpired = query.get('expired') === 'true';

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) { setError('Please enter both email and password.'); return; }
    try {
      setLoading(true); setError('');
      const user = await login(email, password);
      if (user.role === 'SUPER_ADMIN') navigate('/admin/dashboard', { replace: true });
      else if (user.role === 'CUSTOMER') navigate('/customer/dashboard', { replace: true });
      else navigate('/projects', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">

      {/* ── Left Branding Panel ── */}
      <div className="auth-panel-left" style={{ background: 'var(--global-gradient-hero)' }}>
        <div className="auth-left-grid" />
        <div className="auth-left-content">
          <Link to="/" className="auth-brand">
            <div className="auth-brand-icon">
              <Building2 size={20} color="var(--blueprint)" />
            </div>
            <div>
              <div className="auth-brand-name">EcoBuild AI</div>
              <div className="auth-brand-sub">Smart Construction Platform</div>
            </div>
          </Link>

          <h2 className="auth-left-headline">
            The smartest way<br />to <span>estimate, build</span><br />and go green.
          </h2>
          <p className="auth-left-desc">
            AI-driven cost estimation, embodied carbon analytics, and 11-stage
            progress monitoring — built for Indian construction standards.
          </p>

          <div className="auth-left-pills">
            {[
              { icon: <Cpu size={18} color="#ffffff" />, bg: 'var(--blueprint)', title: 'XGBoost AI Engine', sub: '95%+ prediction accuracy' },
              { icon: <Leaf size={18} color="#ffffff" />, bg: 'var(--eco)', title: 'IFC Carbon Analytics', sub: 'Indian emission standards' },
              { icon: <BarChart3 size={18} color="#ffffff" />, bg: 'var(--ink)', title: '11-Stage Monitoring', sub: 'CPWD / BMTPC compliance' },
            ].map((p) => (
              <div className="auth-pill" key={p.title}>
                <div className="auth-pill-icon" style={{ background: p.bg }}>{p.icon}</div>
                <div className="auth-pill-text">
                  <strong>{p.title}</strong>
                  <span>{p.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="auth-panel-right">
        <div className="auth-form-card">
          <h1 className="auth-form-title">Welcome back</h1>
          <p className="auth-form-sub">
            Sign in with your EcoBuild AI credentials.
            Contact your administrator if you need access.
          </p>

          {isExpired && !error && (
            <div className="auth-alert auth-alert-info" style={{ marginBottom: '1rem' }}>
              Session expired. Please sign in again.
            </div>
          )}
          {error && (
            <div className="auth-alert" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} id="login-form">
            <div className="auth-field">
              <label htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                className={`auth-input${error ? ' error' : ''}`}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                required autoFocus
              />
            </div>

            <div className="auth-field">
              <label htmlFor="login-password" style={{ display: 'flex', justifyContent: 'space-between' }}>
                Password
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: '0.75rem', padding: 0 }}
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </label>
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                className={`auth-input${error ? ' error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                required
              />
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
