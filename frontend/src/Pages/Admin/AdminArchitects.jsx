import React, { useState, useEffect } from 'react';
import {
  getAdminArchitects,
  createAdminArchitect,
  updateArchitectStatus,
  updateArchitectPlan,
} from '../../Assets/api';

export default function AdminArchitects() {
  const [architects, setArchitects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // New architect form state
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    email: '',
    phone: '',
    plan: 'Professional',
    password: 'Architect@12345',
  });
  const [creating, setCreating] = useState(false);

  const fetchArchitects = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getAdminArchitects();
      setArchitects(res || []);
    } catch (err) {
      setError(err.message || 'Failed to load architects list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchitects();
  }, []);

  const handleStatusChange = async (userId, newStatus) => {
    try {
      setActionMessage('');
      await updateArchitectStatus(userId, newStatus);
      setActionMessage(`Architect status updated to "${newStatus}" successfully.`);
      fetchArchitects();
    } catch (err) {
      setError(err.message || 'Failed to update architect status');
    }
  };

  const handlePlanChange = async (userId, newPlan) => {
    try {
      setActionMessage('');
      await updateArchitectPlan(userId, newPlan);
      setActionMessage(`Architect subscription plan updated to "${newPlan}" successfully.`);
      fetchArchitects();
    } catch (err) {
      setError(err.message || 'Failed to update plan');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setError('Please provide at least a name and email.');
      return;
    }
    try {
      setCreating(true);
      setError('');
      await createAdminArchitect(formData);
      setShowModal(false);
      setFormData({
        name: '',
        company_name: '',
        email: '',
        phone: '',
        plan: 'Professional',
        password: 'Architect@12345',
      });
      setActionMessage('New Architect tenant created successfully!');
      fetchArchitects();
    } catch (err) {
      setError(err.message || 'Failed to create architect');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1b4332' }}>Architect & Builder Tenant Accounts</h2>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Manage architect organizations, access credentials, lifecycle statuses, and SaaS tiers
          </p>
        </div>
        <button
          className="admin-btn admin-btn-primary"
          onClick={() => setShowModal(true)}
          style={{ padding: '0.65rem 1.25rem', fontSize: '0.92rem' }}
        >
          ➕ Provision New Architect
        </button>
      </div>

      {actionMessage && (
        <div className="login-alert-info" style={{ marginBottom: '1.5rem' }}>
          ✓ {actionMessage}
        </div>
      )}

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
                <th>Architect Name</th>
                <th>Company / Studio</th>
                <th>Email & Phone</th>
                <th>Projects</th>
                <th>Plan Tier</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading architects...
                  </td>
                </tr>
              ) : architects.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No architect accounts found.
                  </td>
                </tr>
              ) : (
                architects.map((arch) => (
                  <tr key={arch.user_id}>
                    <td>
                      <strong>{arch.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}><code>{arch.user_id}</code></div>
                    </td>
                    <td>{arch.company_name || 'Individual Architect'}</td>
                    <td>
                      <div>{arch.email}</div>
                      {arch.phone && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{arch.phone}</div>}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#1b4332' }}>
                        {arch.projects_count || 0}
                      </span>
                    </td>
                    <td>
                      <select
                        className="form-input"
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.82rem', width: 'auto', borderRadius: '6px' }}
                        value={arch.plan || 'Professional'}
                        onChange={(e) => handlePlanChange(arch.user_id, e.target.value)}
                      >
                        <option value="Basic">Basic</option>
                        <option value="Professional">Professional</option>
                        <option value="Enterprise">Enterprise</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge-status badge-status-${arch.status || 'active'}`}>
                        {arch.status || 'active'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {arch.status !== 'active' && (
                          <button
                            className="admin-btn admin-btn-primary"
                            title="Activate account"
                            onClick={() => handleStatusChange(arch.user_id, 'active')}
                          >
                            Activate
                          </button>
                        )}
                        {arch.status !== 'suspended' && (
                          <button
                            className="admin-btn admin-btn-danger"
                            title="Suspend account access"
                            onClick={() => handleStatusChange(arch.user_id, 'suspended')}
                          >
                            Suspend
                          </button>
                        )}
                        {arch.status === 'active' && (
                          <button
                            className="admin-btn admin-btn-secondary"
                            title="Deactivate account"
                            onClick={() => handleStatusChange(arch.user_id, 'inactive')}
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Architect Modal */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Provision Architect Tenant Account</h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="login-form">
              <div className="form-group">
                <label>Architect / Lead Builder Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ar. Rajesh Mehra"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Company / Architectural Studio Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Mehra Sustainable Designs"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Login Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="rajesh@mehra-arch.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Subscription Plan Tier</label>
                <select
                  className="form-input"
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                >
                  <option value="Basic">Basic (Up to 3 Projects)</option>
                  <option value="Professional">Professional (Up to 15 Projects)</option>
                  <option value="Enterprise">Enterprise (Unlimited Projects & Priority Support)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Initial Temporary Password</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  style={{ flex: 1, padding: '0.8rem' }}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  style={{ flex: 1, padding: '0.8rem' }}
                  disabled={creating}
                >
                  {creating ? 'Provisioning...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
