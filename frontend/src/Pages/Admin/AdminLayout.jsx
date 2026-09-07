import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import './AdminLayout.css';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="admin-wrapper">
      {/* Super Admin Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <span className="admin-sidebar-badge">Super Admin</span>
          <h2 className="admin-sidebar-title">EcoBuild Platform</h2>
        </div>

        <nav className="admin-sidebar-nav">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <span>📊</span> Dashboard
          </NavLink>

          <NavLink
            to="/admin/architects"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <span>📐</span> Architects / Builders
          </NavLink>

          <NavLink
            to="/admin/projects"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <span>🏗️</span> Platform Projects
          </NavLink>

          <NavLink
            to="/admin/customers"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <span>👥</span> Platform Customers
          </NavLink>

          <NavLink
            to="/admin/plans"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <span>💳</span> Plans & Subscriptions
          </NavLink>

          <NavLink
            to="/admin/usage"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <span>📈</span> Usage Analytics
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <strong>{user?.name || 'Administrator'}</strong>
            <div>{user?.email}</div>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="admin-main">
        <header className="admin-topbar">
          <h1 className="admin-page-title">SaaS Platform Administration</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{
              background: '#dcfce7',
              color: '#166534',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700
            }}>
              ● System Online
            </span>
          </div>
        </header>

        <div className="admin-content-body">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
