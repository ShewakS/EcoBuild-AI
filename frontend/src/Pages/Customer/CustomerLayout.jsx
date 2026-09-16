import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Home, Boxes, DollarSign, Leaf, Calendar, Camera, ShieldCheck } from 'lucide-react';
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
            <LayoutDashboard size={16} /> Dashboard
          </NavLink>

          <NavLink
            to="/customer/project"
            className={({ isActive }) => `customer-nav-item ${isActive ? 'active' : ''}`}
          >
            <Home size={16} /> My Project
          </NavLink>

          <NavLink
            to="/customer/materials"
            className={({ isActive }) => `customer-nav-item ${isActive ? 'active' : ''}`}
          >
            <Boxes size={16} /> Materials
          </NavLink>

          <NavLink
            to="/customer/cost"
            className={({ isActive }) => `customer-nav-item ${isActive ? 'active' : ''}`}
          >
            <DollarSign size={16} /> Cost Breakdown
          </NavLink>

          <NavLink
            to="/customer/sustainability"
            className={({ isActive }) => `customer-nav-item ${isActive ? 'active' : ''}`}
          >
            <Leaf size={16} /> Carbon & Eco
          </NavLink>

          <NavLink
            to="/customer/progress"
            className={({ isActive }) => `customer-nav-item ${isActive ? 'active' : ''}`}
          >
            <Calendar size={16} /> Construction Stages
          </NavLink>

          <NavLink
            to="/customer/photos"
            className={({ isActive }) => `customer-nav-item ${isActive ? 'active' : ''}`}
          >
            <Camera size={16} /> Inspection Photos
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
            <span className="inline-flex items-center gap-1" style={{
              background: '#e8f5e9',
              color: '#1b4332',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 700
            }}>
              <ShieldCheck size={14} /> Verified Read-Only Portal
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
