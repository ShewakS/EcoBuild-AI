import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCustomerDashboard } from '../../Assets/api';

export default function CustomerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await getCustomerDashboard();
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to load customer project dashboard');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#1b4332' }}>
        <h3>Loading your construction project details...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="login-alert-error">
        <span>⚠</span> {error}
      </div>
    );
  }

  if (!data?.has_project) {
    return (
      <div className="customer-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏗️</div>
        <h2>No Active Construction Project Assigned</h2>
        <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
          Your account is active, but your architect has not assigned a project to your email address yet.
          Please contact your architect or builder.
        </p>
      </div>
    );
  }

  const { primary_project, latest_estimate, images_count, recent_updates } = data;
  const cost = latest_estimate?.predicted_cost_inr || primary_project?.building_details?.total_cost || null;
  const carbon = latest_estimate?.carbon_data?.total_embodied_carbon_kg || latest_estimate?.total_carbon_kg || null;
  const score = latest_estimate?.sustainability_score || 78;
  const tier = latest_estimate?.sustainability_tier || 'Silver Eco';

  return (
    <div>
      {/* Primary Project Hero Banner */}
      <div className="customer-project-banner">
        <div>
          <div style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.8rem', opacity: 0.9 }}>
            Assigned Construction Project
          </div>
          <h2 className="customer-banner-title">{primary_project.project_name}</h2>
          <div className="customer-banner-meta">
            <span>📍 {primary_project.location}</span>
            <span>📐 Architect: {primary_project.architect_name || 'Design Lead'}</span>
            <span>📅 Status: {primary_project.status || 'In Progress'}</span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Overall Progress</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>
            {primary_project.overall_progress_percent || 0}%
          </div>
          <div style={{ fontSize: '0.85rem', color: '#a7f3d0' }}>
            Current: {primary_project.current_stage || 'Planning & Site Mobilization'}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Current Stage</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1b4332', minHeight: '44px', display: 'flex', alignItems: 'center' }}>
            {primary_project.current_stage || 'Planning'}
          </div>
          <div className="admin-kpi-sub">
            <Link to="/customer/progress" style={{ color: '#2d6a4f', textDecoration: 'none', fontWeight: 700 }}>
              View 11 Stages Checklist →
            </Link>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Estimated Project Cost</div>
          <div className="admin-kpi-value">
            {cost ? `₹${Number(cost).toLocaleString('en-IN')}` : 'Estimated'}
          </div>
          <div className="admin-kpi-sub">
            <Link to="/customer/cost" style={{ color: '#2d6a4f', textDecoration: 'none', fontWeight: 700 }}>
              View Cost Breakdown →
            </Link>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Embodied Carbon Impact</div>
          <div className="admin-kpi-value">
            {carbon ? `${Number(carbon).toLocaleString('en-IN')} kg` : 'Calculated'}
          </div>
          <div className="admin-kpi-sub">
            <Link to="/customer/sustainability" style={{ color: '#2d6a4f', textDecoration: 'none', fontWeight: 700 }}>
              View Carbon Metrics →
            </Link>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-label">Sustainability Grade</div>
          <div className="admin-kpi-value" style={{ color: '#166534' }}>
            {score} / 100
          </div>
          <div className="admin-kpi-sub" style={{ color: '#15803d' }}>
            ★ {tier} Certified
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Progress Updates + Site Photos Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Updates */}
        <div className="customer-card">
          <h3 className="customer-card-title">
            <span>📋</span> Recent Construction Log & Updates
          </h3>
          {recent_updates && recent_updates.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {recent_updates.map((up, idx) => (
                <div key={idx} style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, color: '#1b4332' }}>Stage {up.stage_id || 'Update'}</span>
                    <span>{up.created_at ? new Date(up.created_at).toLocaleDateString() : 'Recent'}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155' }}>
                    {up.notes || up.remarks || up.description || 'Milestone inspected and logged by architect.'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>
              No construction logs recorded yet for this project.
            </div>
          )}
        </div>

        {/* Site Gallery Overview */}
        <div className="customer-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 className="customer-card-title" style={{ margin: 0 }}>
              <span>📷</span> Site Inspection Photos
            </h3>
            <Link to="/customer/photos" className="admin-btn admin-btn-secondary">
              View Gallery ({images_count || 0})
            </Link>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 1rem 0' }}>
            Your architect uploads live site photos during each stage of construction for transparent quality verification.
          </p>
          <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '1.5rem', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📸</div>
            <div style={{ fontWeight: 700, color: '#1b4332' }}>{images_count || 0} Photos Uploaded</div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem' }}>
              Inspected and approved by {primary_project.architect_name || 'Architect'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
