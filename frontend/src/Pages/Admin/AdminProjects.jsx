import React, { useState, useEffect } from 'react';
import { getAdminProjects } from '../../Assets/api';

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        const res = await getAdminProjects();
        setProjects(res || []);
      } catch (err) {
        setError(err.message || 'Failed to load platform projects');
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.project_name && p.project_name.toLowerCase().includes(q)) ||
      (p.project_id && p.project_id.toLowerCase().includes(q)) ||
      (p.architect_name && p.architect_name.toLowerCase().includes(q)) ||
      (p.location && p.location.toLowerCase().includes(q)) ||
      (p.client_name && p.client_name.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1b4332' }}>Platform Projects Directory</h2>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Multi-tenant platform oversight of all registered construction projects
          </p>
        </div>
        <div style={{ width: '300px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search projects, architects, locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
                <th>Project Details</th>
                <th>Architect / Organization</th>
                <th>Client / Customer</th>
                <th>Location</th>
                <th>Current Stage</th>
                <th>Progress</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading platform projects...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No matching projects found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.project_id}>
                    <td>
                      <strong>{p.project_name}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        <code>{p.project_id}</code>
                      </div>
                    </td>
                    <td>
                      <div>{p.architect_name || 'Assigned Architect'}</div>
                      {p.organization_id && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Tenant: {p.organization_id}
                        </div>
                      )}
                    </td>
                    <td>
                      <div>{p.customer_name || p.client_name || 'Pending Customer'}</div>
                      {p.customer_email && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {p.customer_email}
                        </div>
                      )}
                    </td>
                    <td>{p.location}</td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#2d6a4f', fontWeight: 600 }}>
                        {p.current_stage || 'Planning'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '60px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${p.overall_progress_percent || 0}%`,
                            height: '100%',
                            background: '#2d6a4f'
                          }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                          {p.overall_progress_percent || 0}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge-status badge-status-active">
                        {p.status || 'In Progress'}
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
