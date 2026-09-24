import React, { useState, useEffect } from 'react';
import { getAdminUsage } from '../../Assets/api';
import { AlertTriangle } from 'lucide-react';

export default function AdminUsage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadUsage() {
      try {
        setLoading(true);
        const res = await getAdminUsage();
        setLogs(res || []);
      } catch (err) {
        setError(err.message || 'Failed to load usage logs');
      } finally {
        setLoading(false);
      }
    }
    loadUsage();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1b4332' }}>Platform Usage & Operation Auditing</h2>
        <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
          Audit trail of computational analyses executed across all tenants
        </p>
      </div>

      {error && (
        <div className="login-alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      <div className="admin-section-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Operation / Action</th>
                <th>Organization</th>
                <th>User ID</th>
                <th>Project ID</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading usage records...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No usage records recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((item) => (
                  <tr key={item.record_id || Math.random()}>
                    <td><code>{item.record_id}</code></td>
                    <td>
                      <span style={{
                        background: '#e8f5e9',
                        color: '#1b4332',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.82rem',
                        fontWeight: 700
                      }}>
                        {item.action?.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>{item.organization_id}</td>
                    <td><code>{item.user_id}</code></td>
                    <td><code>{item.project_id}</code></td>
                    <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      {item.timestamp ? new Date(item.timestamp).toLocaleString() : '—'}
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
