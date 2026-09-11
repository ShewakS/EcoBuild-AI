import React, { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { User, Lock, Building2, Phone, Mail, CheckCircle, AlertCircle, Save } from 'lucide-react';
import BrandedLoader from '../Components/BrandedLoader';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function apiPatch(endpoint, data, token) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

function Toast({ type = 'success', message, onClose }) {
  return (
    <div className={`toast toast-${type} animate-fade-in`}>
      {type === 'success' ? <CheckCircle size={15} color="var(--eco)" /> : <AlertCircle size={15} color="var(--alert)" />}
      <div style={{ flex: 1, fontSize: '0.82rem', color: 'var(--ink)' }}>{message}</div>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', fontSize: '1rem', lineHeight: 1 }}
      >
        &times;
      </button>
    </div>
  );
}

export default function Profile() {
  const { user, token, role } = useAuth();
  const [toast, setToast] = useState(null);

  /* Profile form */
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    company_name: user?.company_name || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);

  /* Password form */
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await apiPatch('/api/auth/profile', {
        name: profileForm.name,
        phone: profileForm.phone,
        company_name: profileForm.company_name,
      }, token);
      showToast('success', 'Profile updated successfully.');
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) {
      showToast('error', 'New passwords do not match.');
      return;
    }
    if (pwForm.new_password.length < 6) {
      showToast('error', 'New password must be at least 6 characters.');
      return;
    }
    setPwSaving(true);
    try {
      await apiPatch('/api/auth/change-password', {
        old_password: pwForm.old_password,
        new_password: pwForm.new_password,
      }, token);
      setPwForm({ old_password: '', new_password: '', confirm: '' });
      showToast('success', 'Password changed successfully.');
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setPwSaving(false);
    }
  };

  if (!user) return <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}><BrandedLoader size="md" /></div>;

  const roleMeta = {
    SUPER_ADMIN: { label: 'Super Admin', color: 'var(--alert)', bg: '#FAF0EB' },
    ARCHITECT:   { label: 'Architect',   color: 'var(--blueprint)', bg: 'var(--blueprint-light)' },
    CUSTOMER:    { label: 'Customer',    color: 'var(--eco)',       bg: 'var(--eco-light)' },
  };
  const rm = roleMeta[role] || roleMeta.ARCHITECT;

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh', padding: '2rem 1.5rem' }}>
      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div className="section-label">Account Settings</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.25rem' }}>
            Your Profile
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Mail size={13} color="var(--ink-muted)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>{user.email}</span>
            <span className="badge" style={{ background: rm.bg, color: rm.color, fontSize: '0.65rem' }}>{rm.label}</span>
          </div>
        </div>

        {/* Profile Form */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <User size={16} color="var(--blueprint)" />
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink)' }}>Personal Information</h2>
          </div>

          <form onSubmit={handleProfileSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label" htmlFor="profile-name">Full Name</label>
                <input
                  id="profile-name"
                  type="text"
                  className="form-input"
                  value={profileForm.name}
                  onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="form-label" htmlFor="profile-phone">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Phone size={11} />Phone Number
                  </span>
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  className="form-input"
                  value={profileForm.phone}
                  onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 98765 00000"
                />
              </div>
              {role !== 'CUSTOMER' && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="profile-company">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Building2 size={11} />Company / Firm Name
                    </span>
                  </label>
                  <input
                    id="profile-company"
                    type="text"
                    className="form-input"
                    value={profileForm.company_name}
                    onChange={e => setProfileForm(f => ({ ...f, company_name: e.target.value }))}
                    placeholder="Studio Green Arch"
                  />
                </div>
              )}
            </div>

            <hr className="divider" />
            <button
              type="submit"
              className="btn-primary"
              disabled={profileSaving}
              id="profile-save-btn"
            >
              {profileSaving ? (
                <span className="animate-spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
              ) : <Save size={14} />}
              {profileSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Password Form */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <Lock size={16} color="var(--blueprint)" />
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink)' }}>Change Password</h2>
          </div>

          <form onSubmit={handlePasswordSave}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label" htmlFor="pw-old">Current Password</label>
                <input
                  id="pw-old"
                  type="password"
                  className="form-input"
                  value={pwForm.old_password}
                  onChange={e => setPwForm(f => ({ ...f, old_password: e.target.value }))}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label" htmlFor="pw-new">New Password</label>
                  <input
                    id="pw-new"
                    type="password"
                    className="form-input"
                    value={pwForm.new_password}
                    onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="pw-confirm">Confirm New Password</label>
                  <input
                    id="pw-confirm"
                    type="password"
                    className={`form-input${pwForm.confirm && pwForm.confirm !== pwForm.new_password ? ' error' : ''}`}
                    value={pwForm.confirm}
                    onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>

            <hr className="divider" />
            <button
              type="submit"
              className="btn-secondary"
              disabled={pwSaving}
              id="profile-change-pw-btn"
            >
              {pwSaving ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Plan info (Architects only) */}
        {role === 'ARCHITECT' && (
          <div className="card" style={{ padding: '1.25rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="data-label" style={{ marginBottom: '0.25rem' }}>Current Plan</div>
                <div className="data-value" style={{ fontSize: '1rem' }}>{user.plan || 'Professional'}</div>
              </div>
              <div>
                <div className="data-label" style={{ marginBottom: '0.25rem' }}>Organization</div>
                <div className="data-value">{user.company_name || 'N/A'}</div>
              </div>
              <div>
                <div className="data-label" style={{ marginBottom: '0.25rem' }}>Account Status</div>
                <span className="badge badge-eco">{user.status || 'Active'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
