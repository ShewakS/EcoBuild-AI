import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const query = new URLSearchParams(location.search);
  const isExpired = query.get('expired') === 'true';

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const loggedUser = await login(email, password);

      // Redirect according to role
      if (loggedUser.role === 'SUPER_ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (loggedUser.role === 'CUSTOMER') {
        navigate('/customer/dashboard', { replace: true });
      } else {
        navigate('/projects', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="ecobuild-login-container">
      <div className="ecobuild-login-card">
        <div className="login-header">
          <div className="login-badge">EcoBuild AI Platform</div>
          <h1 className="login-title">Account Portal</h1>
          <p className="login-subtitle">Sign in to access your projects and analytics</p>
        </div>

        {isExpired && !error && (
          <div className="login-alert-info">
            Your session has expired. Please log in again to continue.
          </div>
        )}

        {error && (
          <div className="login-alert-error">
            <span>⚠</span> {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials Quick Pills */}
        <div className="demo-credentials-section">
          <div className="demo-title">Quick Demo Login (1-Click)</div>
          <div className="demo-pills-grid">
            <button
              type="button"
              className="demo-pill"
              onClick={() => fillDemo('admin@ecobuild.ai', 'Admin@12345')}
            >
              <span className="demo-pill-role">
                <span className="demo-badge-admin">SUPER ADMIN</span> Platform Admin
              </span>
              <span className="demo-pill-email">admin@ecobuild.ai</span>
            </button>

            <button
              type="button"
              className="demo-pill"
              onClick={() => fillDemo('architect@ecobuild.ai', 'Architect@12345')}
            >
              <span className="demo-pill-role">
                <span className="demo-badge-arch">ARCHITECT</span> Ar. Priya Sharma
              </span>
              <span className="demo-pill-email">architect@ecobuild.ai</span>
            </button>

            <button
              type="button"
              className="demo-pill"
              onClick={() => fillDemo('customer@ecobuild.ai', 'Customer@12345')}
            >
              <span className="demo-pill-role">
                <span className="demo-badge-cust">CUSTOMER</span> Amit Kapoor
              </span>
              <span className="demo-pill-email">customer@ecobuild.ai</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
