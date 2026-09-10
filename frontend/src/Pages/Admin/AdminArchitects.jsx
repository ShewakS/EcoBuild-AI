import React, { useState, useEffect } from 'react';
import {
  getAdminArchitects,
  createAdminArchitect,
  updateArchitectStatus,
  updateArchitectPlan,
} from '../../Assets/api';
import { UserPlus, CheckCircle, AlertCircle, Copy, Eye, EyeOff } from 'lucide-react';

export default function AdminArchitects() {
  const [architects, setArchitects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [newCredentials, setNewCredentials] = useState(null); // { name, email, temp_password, email_sent }
  const [showPw, setShowPw] = useState(false);

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
      const result = await createAdminArchitect(formData);
      setShowModal(false);
      setFormData({ name: '', company_name: '', email: '', phone: '', plan: 'Professional', password: 'Architect@12345' });
      setNewCredentials({
        name: result.name || formData.name,
        email: result.email || formData.email,
        temp_password: result.temp_password,
        email_sent: result.email_sent,
      });
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
          className="btn-primary"
          onClick={() => setShowModal(true)}
          id="admin-create-architect-btn"
        >
          <UserPlus size={14} />
          Create Architect Account
        </button>
      </div>

      {actionMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'var(--eco-light)', border: '1px solid #91CCAA', borderRadius: 3, marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--eco)' }}>
          <CheckCircle size={14} />{actionMessage}
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: '#FAF0EB', border: '1px solid #E5C0AA', borderRadius: 3, marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--alert)' }}>
          <AlertCircle size={14} />{error}
        </div>
      )}

      {/* ── Credentials overlay (show once after creation) ── */}
      {newCredentials && (
        <div style={{ background: 'var(--blueprint-light)', border: '1px solid #AABFEA', borderRadius: 3, padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--blueprint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Architect Account Created</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: 2 }}>
                {newCredentials.email_sent
                  ? 'Credentials have been emailed to the architect.'
                  : 'Email delivery not configured. Share these credentials securely — they will not be shown again.'}
              </div>
            </div>
            <button onClick={() => setNewCredentials(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', fontSize: '1.1rem', lineHeight: 1 }}>&times;</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <div className="data-label" style={{ marginBottom: 4 }}>Name</div>
              <div className="data-value">{newCredentials.name}</div>
            </div>
            <div>
              <div className="data-label" style={{ marginBottom: 4 }}>Email</div>
              <div className="data-value">{newCredentials.email}</div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div className="data-label" style={{ marginBottom: 4 }}>Temporary Password</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <code style={{ flex: 1, padding: '0.4rem 0.6rem', background: '#ffffff', border: '1px solid #AABFEA', borderRadius: 2, fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                  {showPw ? newCredentials.temp_password : '•'.repeat(newCredentials.temp_password?.length || 12)}
                </code>
                <button onClick={() => setShowPw(p => !p)} title={showPw ? 'Hide' : 'Show'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)' }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  title="Copy to clipboard"
                  onClick={() => navigator.clipboard.writeText(newCredentials.temp_password)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blueprint)' }}
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </div>
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
