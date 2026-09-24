import React, { useState, useEffect } from 'react';
import { getAdminDashboard } from '../../Assets/api';
import { AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getAdminDashboard();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load platform dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#1b4332' }}>
        <h3>Loading platform metrics...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="login-alert-error" style={{ margin: '1rem' }}>
        <AlertTriangle size={16} /> {error}
      </div>
    );
  }

  const { overview, plans_distribution, usage_statistics, recent_projects } = data || {};

  return (
    <div>
      {/* Top Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1b4332' }}>Platform Health & KPI Overview</h2>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Real-time platform-wide figures computed from MongoDB
          </p>
        </div>
        <button className="admin-btn admin-btn-secondary flex items-center gap-1.5" onClick={fetchDashboard}>
          <RefreshCw size={14} /> Refresh Metrics
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Architects / Builders</div>
          <div className="admin-kpi-value">{overview?.total_architects || 0}</div>
          <div className="admin-kpi-sub flex items-center gap-1"><CheckCircle2 size={12} /> {overview?.active_architects || 0} Active accounts</div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Platform Projects</div>
          <div className="admin-kpi-value">{overview?.total_projects || 0}</div>
          <div className="admin-kpi-sub flex items-center gap-1"><CheckCircle2 size={12} /> {overview?.active_projects || 0} In Progress</div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Platform Customers</div>
          <div className="admin-kpi-value">{overview?.total_customers || 0}</div>
          <div className="admin-kpi-sub flex items-center gap-1"><CheckCircle2 size={12} /> {overview?.active_customers || 0} Active accounts</div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Active Subscriptions</div>
          <div className="admin-kpi-value">{overview?.active_subscriptions || 0}</div>
          <div className="admin-kpi-sub">100% Tenant Health</div>
        </div>
      </div>

      {/* Plans & Usage Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Plans Distribution */}
        <div className="admin-section-card" style={{ marginBottom: 0 }}>
          <div className="admin-section-header">
            <h3 className="admin-section-title">Subscription Plan Distribution</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.88rem', fontWeight: 600 }}>
                <span>Basic Tier</span>
                <span>{plans_distribution?.Basic || 0} tenants</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${((plans_distribution?.Basic || 0) / (overview?.total_architects || 1)) * 100}%`,
                  height: '100%',
                  background: '#0284c7'
                }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.88rem', fontWeight: 600 }}>
                <span>Professional Tier</span>
                <span>{plans_distribution?.Professional || 0} tenants</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${((plans_distribution?.Professional || 0) / (overview?.total_architects || 1)) * 100}%`,
                  height: '100%',
                  background: '#2d6a4f'
                }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.88rem', fontWeight: 600 }}>
                <span>Enterprise Tier</span>
                <span>{plans_distribution?.Enterprise || 0} tenants</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${((plans_distribution?.Enterprise || 0) / (overview?.total_architects || 1)) * 100}%`,
                  height: '100%',
                  background: '#7c3aed'
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* AI & Platform Usage Breakdown */}
        <div className="admin-section-card" style={{ marginBottom: 0 }}>
          <div className="admin-section-header">
            <h3 className="admin-section-title">Platform Operations Tracked</h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Total: {usage_statistics?.total_records || 0} calls
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                Material Predictions
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1b4332' }}>
                {usage_statistics?.actions_breakdown?.material_prediction || 0}
              </div>
            </div>

            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                Carbon Analyses
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1b4332' }}>
                {usage_statistics?.actions_breakdown?.carbon_analysis || 0}
              </div>
            </div>

            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                Sustainability Scores
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1b4332' }}>
                {usage_statistics?.actions_breakdown?.sustainability_scoring || 0}
              </div>
            </div>

            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                CPWD / Reuse Queries
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1b4332' }}>
                {usage_statistics?.actions_breakdown?.waste_analysis || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects Registered Across Platform */}
      <div className="admin-section-card">
        <div className="admin-section-header">
          <h3 className="admin-section-title">Latest Construction Projects on Platform</h3>
        </div>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Project ID</th>
                <th>Project Name</th>
                <th>Architect</th>
                <th>Client</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent_projects && recent_projects.length > 0 ? (
                recent_projects.map((p) => (
                  <tr key={p.project_id}>
                    <td><code>{p.project_id}</code></td>
                    <td><strong>{p.project_name}</strong></td>
                    <td>{p.architect_name || 'N/A'}</td>
                    <td>{p.client_name || 'N/A'}</td>
                    <td>{p.location}</td>
                    <td>
                      <span className="badge-status badge-status-active">
                        {p.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8' }}>
                    No projects found on the platform.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
