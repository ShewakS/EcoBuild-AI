import React, { useState, useEffect } from 'react';
import { getAdminSubscriptions } from '../../Assets/api';

export default function AdminPlans() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSubs() {
      try {
        setLoading(true);
        const res = await getAdminSubscriptions();
        setSubs(res || []);
      } catch (err) {
        setError(err.message || 'Failed to load tenant subscriptions');
      } finally {
        setLoading(false);
      }
    }
    loadSubs();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1b4332' }}>SaaS Plans & Tenant Subscriptions</h2>
        <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
          Configurable platform plan limits, tenant quota allocations, and subscription statuses
        </p>
      </div>

      {error && (
        <div className="login-alert-error" style={{ marginBottom: '1.5rem' }}>
          <span>⚠</span> {error}
        </div>
      )}

      {/* Plans Tier Comparison Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="admin-kpi-card" style={{ borderTop: '4px solid #0284c7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="badge-plan badge-plan-basic">Basic Plan</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>₹0 / Starter</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem 0' }}>
            For independent estimators & small residential developers
          </p>
          <ul style={{ paddingLeft: '1.2rem', margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#334155', lineHeight: '1.6' }}>
            <li>Up to <strong>3 Projects</strong></li>
            <li>Up to <strong>20 ML Analyses</strong></li>
            <li>Cost & Stage-1 Material Quantities</li>
            <li>IFC Embodied Carbon Calculations</li>
          </ul>
        </div>

        <div className="admin-kpi-card" style={{ borderTop: '4px solid #2d6a4f' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="badge-plan badge-plan-pro">Professional Plan</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Recommended</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem 0' }}>
            For architectural studios & commercial builders
          </p>
          <ul style={{ paddingLeft: '1.2rem', margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#334155', lineHeight: '1.6' }}>
            <li>Up to <strong>15 Projects</strong></li>
            <li>Up to <strong>100 ML Analyses</strong></li>
            <li>Safe Material Reuse & CPWD Waste</li>
            <li>11-Stage Inspection & Site Photos</li>
            <li>Customer Invitation & Portal Access</li>
          </ul>
        </div>

        <div className="admin-kpi-card" style={{ borderTop: '4px solid #7c3aed' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="badge-plan badge-plan-enterprise">Enterprise Tier</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Custom Scale</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem 0' }}>
            For large construction firms and government infra projects
          </p>
          <ul style={{ paddingLeft: '1.2rem', margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#334155', lineHeight: '1.6' }}>
            <li><strong>Unlimited Projects</strong></li>
            <li><strong>Unlimited ML Predictions</strong></li>
            <li>Consolidated Multi-Project Analytics</li>
            <li>Dedicated Database & Priority SLA</li>
          </ul>
        </div>
      </div>

      {/* Active Tenant Subscriptions Table */}
      <div className="admin-section-card">
        <div className="admin-section-header">
          <h3 className="admin-section-title">Active Tenant Subscriptions</h3>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Subscription ID</th>
                <th>Organization / Studio</th>
                <th>Plan Tier</th>
                <th>Projects Quota</th>
                <th>Analyses Usage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading subscriptions...
                  </td>
                </tr>
              ) : subs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No tenant subscriptions found.
                  </td>
                </tr>
              ) : (
                subs.map((s) => (
                  <tr key={s.subscription_id}>
                    <td>
                      <code>{s.subscription_id}</code>
                    </td>
                    <td>
                      <strong>{s.organization_name || s.organization_id}</strong>
                      {s.contact_email && (
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {s.contact_email}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge-plan badge-plan-${(s.plan || 'pro').toLowerCase()}`}>
                        {s.plan}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>
                        {s.current_usage?.projects_count || 0} / {s.usage_limits?.max_projects || '∞'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>
                        {s.current_usage?.predictions_count || 0} / {s.usage_limits?.max_predictions || '∞'}
                      </span>
                    </td>
                    <td>
                      <span className="badge-status badge-status-active">
                        {s.status || 'active'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
