import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import './CustomerLayout.css';

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="customer-wrapper">
      {/* Customer Sidebar */}
      <aside className="customer-sidebar">
        <div className="customer-sidebar-header">
          <span className="customer-sidebar-badge">Client Portal</span>
          <h2 className="customer-sidebar-title">EcoBuild AI</h2>
        </div>

        <nav className="customer-sidebar-nav">
          <NavLink
            to="/customer/dashboard"
            className={({ isActive }) => `customer-nav-item ${isActive ? 'active' : ''}`}
          >
            <span>📊</span> Dashboard
          </NavLink>

          <NavLink
            to="/customer/project"
            className={({ isActive }) => `customer-nav-item ${isActive ? 'active' : ''}`}
          >
            <span>🏡</span> My Project
          </NavLink>

          <NavLink
            to="/customer/materials"
            className={({ isActive }) => `customer-nav-item ${isActive ? 'active' : ''}`}
          >
            <span>🧱</span> Materials
          </NavLink>

          <NavLink
            to="/customer/cost"
            className={({ isActive }) => `customer-nav-item ${isActive ? 'active' : ''}`}
          >
            <span>💰</span> Cost Breakdown
          </NavLink>

          <NavLink
            to="/customer/sustainability"
            className={({ isActive }) => `customer-nav-item ${isActive ? 'active' : ''}`}
          >
            <span>🌱</span> Carbon & Eco
          </NavLink>

          <NavLink
            to="/customer/progress"
            className={({ isActive }) => `customer-nav-item ${isActive ? 'active' : ''}`}
          >
            <span>📅</span> Construction Stages
          </NavLink>

          <NavLink
            to="/customer/photos"
            className={({ isActive }) => `customer-nav-item ${isActive ? 'active' : ''}`}
          >
            <span>📷</span> Site Photos
          </NavLink>
        </nav>

        <div className="customer-sidebar-footer">
          <div className="customer-user-info">
            <strong>{user?.name || 'Customer'}</strong>
            <div>{user?.email}</div>
          </div>
          <button className="customer-logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Customer Content */}
      <main className="customer-main">
        <header className="customer-topbar">
          <h1 className="customer-page-title">Homeowner & Client Monitoring Portal</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{
              background: '#e8f5e9',
              color: '#1b4332',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 700
            }}>
              🔒 Verified Read-Only Portal
            </span>
          </div>
        </header>

        <div className="customer-content-body">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
