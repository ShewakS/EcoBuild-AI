import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import './ContactUs.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const SUBJECTS = [
  'General Enquiry',
  'Technical Support',
  'Billing and Subscriptions',
  'Partnership and Enterprise',
  'Feature Request',
  'Request Access',
];

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (f) => (e) => setForm(v => ({ ...v, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Submission failed. Please try again.');
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">

      {/* ── Hero ── */}
      <section className="contact-hero" style={{ background: 'var(--global-gradient-hero)' }}>
        <div className="contact-hero-inner">
          <div className="contact-badge">We're here to help</div>
          <h1 className="contact-title">Get in Touch</h1>
          <p className="contact-subtitle">
            Have a question, need a demo, or want to discuss an enterprise plan?
            Our team typically responds within one business day.
          </p>
        </div>
      </section>

      {/* ── Main ── */}
      <section className="contact-body">

        {/* Left Info Panel */}
        <div className="contact-info">
          <h2 className="contact-info-title">Contact Details</h2>

          <div className="contact-info-cards">
            {[
              { Icon: Mail,   label: 'Email',         value: 'support@ecobuild.ai' },
              { Icon: MapPin, label: 'Location',      value: 'Chennai, Tamil Nadu, India' },
              { Icon: Clock,  label: 'Support Hours', value: 'Mon-Fri, 9 AM - 6 PM IST' },
            ].map((c) => (
              <div className="contact-info-card" key={c.label}>
                <div className="contact-info-icon"><c.Icon size={16} color="var(--blueprint)" strokeWidth={1.5} /></div>
                <div>
                  <div className="contact-info-label">{c.label}</div>
                  <div className="contact-info-value">{c.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="contact-divider" />

          <h3 className="contact-info-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>Quick Links</h3>
          <div className="contact-quick-links">
            <Link to="/get-started" className="contact-quick-link">View Pricing Plans</Link>
            <Link to="/login"       className="contact-quick-link">Sign In to Platform</Link>
          </div>
        </div>

        {/* Right Form */}
        <div className="contact-form-wrap">
          {submitted ? (
            <div className="contact-success">
              <CheckCircle size={36} color="var(--eco)" strokeWidth={1.5} style={{ margin: '0 auto 1rem' }} />
              <h3 className="contact-success-title">Message Sent!</h3>
              <p className="contact-success-desc">
                Thank you for reaching out. We will get back to you at <strong>{form.email}</strong> within one business day.
              </p>
              <button
                className="contact-submit"
                onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' }); }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} id="contact-form">
              <h2 className="contact-form-title">Send us a message</h2>

              {error && (
                <div style={{ padding: '0.75rem', background: '#FAF0EB', border: '1px solid #E5C0AA', borderRadius: 3, fontSize: '0.82rem', color: 'var(--alert)', marginBottom: '1rem' }}>
                  {error}
                </div>
              )}

              <div className="contact-form-row">
                <div className="contact-field">
                  <label htmlFor="contact-name">Your Name *</label>
                  <input id="contact-name" type="text" className="contact-input"
                    placeholder="Ar. Priya Sharma" value={form.name} onChange={set('name')} required />
                </div>
                <div className="contact-field">
                  <label htmlFor="contact-email">Email Address *</label>
                  <input id="contact-email" type="email" className="contact-input"
                    placeholder="you@yourfirm.com" value={form.email} onChange={set('email')} required />
                </div>
              </div>

              <div className="contact-field">
                <label htmlFor="contact-phone">Phone Number</label>
                <input id="contact-phone" type="tel" className="contact-input"
                  placeholder="+91 98765 00000" value={form.phone} onChange={set('phone')} />
              </div>

              <div className="contact-field">
                <label htmlFor="contact-subject">Subject</label>
                <select id="contact-subject" className="contact-input contact-select"
                  value={form.subject} onChange={set('subject')}>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="contact-field">
                <label htmlFor="contact-message">Message *</label>
                <textarea id="contact-message" className="contact-input contact-textarea"
                  placeholder="Tell us how we can help..."
                  value={form.message} onChange={set('message')} rows={6} required />
              </div>

              <button id="contact-submit-btn" type="submit" className="contact-submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
                {!loading && <ArrowRight size={14} style={{ marginLeft: 4 }} />}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
