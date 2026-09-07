import React, { useState, useEffect } from 'react';
import { getAdminCustomers } from '../../Assets/api';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        const res = await getAdminCustomers();
        setCustomers(res || []);
      } catch (err) {
        setError(err.message || 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1b4332' }}>Platform Customer Accounts</h2>
        <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
          Registered clients and building owners with read-only project monitoring access
        </p>
      </div>

      {error && (
        <div className="login-alert-error" style={{ marginBottom: '1.5rem' }}>
          <span>⚠</span> {error}
        </div>
      )}

      <div className="admin-section-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Contact Details</th>
                <th>Tenant Organization</th>
                <th>Assigned Projects</th>
                <th>Status</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No customer accounts registered yet.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.user_id}>
                    <td>
                      <strong>{c.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        <code>{c.user_id}</code>
                      </div>
                    </td>
                    <td>
                      <div>{c.email}</div>
                      {c.phone && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.phone}</div>}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#334155' }}>
                        {c.organization_id || 'Global'}
                      </span>
                    </td>
                    <td>
                      {c.projects && c.projects.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          {c.projects.map((pr) => (
                            <span key={pr.project_id} style={{ fontSize: '0.82rem', color: '#1b4332', fontWeight: 600 }}>
                              📁 {pr.project_name} (<code>{pr.project_id}</code>)
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                          {c.assigned_project_ids?.join(', ') || 'None assigned'}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge-status badge-status-${c.status || 'active'}`}>
                        {c.status || 'active'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
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
