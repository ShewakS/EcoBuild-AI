import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import './GetStarted.css';

const PLANS = [
  {
    id: 'Basic',
    price: 'Rs. 999',
    period: '/month',
    tagline: 'Perfect for solo architects',
    popular: false,
    features: [
      '3 Active Projects',
      '20 AI Predictions / month',
      'Cost and Quantity Estimation',
      'Embodied Carbon Analytics',
      'CPWD Waste Tracking',
      'Email Support',
    ],
    missing: ['Sustainability Scoring', 'Material Reuse Module', 'Site Gallery', 'Priority Support'],
    cta: 'Request Basic Access',
    plan: 'Basic',
  },
  {
    id: 'Professional',
    price: 'Rs. 2,999',
    period: '/month',
    tagline: 'Most popular for growing firms',
    popular: true,
    features: [
      '15 Active Projects',
      '100 AI Predictions / month',
      'Cost and Quantity Estimation',
      'Embodied Carbon Analytics',
      'CPWD Waste Tracking',
      'Sustainability Scoring',
      'Material Reuse Module',
      'Site Inspection Gallery',
      'Priority Email Support',
    ],
    missing: ['Dedicated Account Manager'],
    cta: 'Request Professional Access',
    plan: 'Professional',
  },
  {
    id: 'Enterprise',
    price: 'Custom',
    period: '',
    tagline: 'For large firms and enterprises',
    popular: false,
    features: [
      'Unlimited Projects',
      'Unlimited AI Predictions',
      'All Professional Features',
      'Analytics Dashboard',
      'Dedicated Account Manager',
      'API Access',
      'Custom Integrations',
      'SLA and Priority Support',
    ],
    missing: [],
    cta: 'Contact Sales',
    plan: 'Enterprise',
  },
];

const FAQS = [
  { q: 'Is there a free trial?', a: 'Yes — start with the Basic plan at no cost for the first 14 days. No credit card required.' },
  { q: 'How accurate are the AI predictions?', a: 'Our XGBoost model is trained on thousands of Indian construction projects and achieves 95%+ accuracy for material quantities and cost estimates.' },
  { q: 'Can I upgrade my plan later?', a: 'Absolutely. You can upgrade or downgrade your plan at any time from your account settings.' },
  { q: 'What Indian standards does EcoBuild AI follow?', a: 'We follow CPWD 2022 Data Book, BMTPC waste benchmarks, NICMAR norms, and IFC Indian emission factors for carbon analytics.' },
  { q: 'Can I add customer accounts?', a: 'Yes — Architects can invite customers to view their project status through the read-only Customer Portal at no extra cost.' },
];

export default function GetStarted() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const handlePlanClick = () => {
    navigate('/contact');
  };

  return (
    <div className="gs-page">

      {/* ── Hero ── */}
      <section className="gs-hero" style={{ background: 'var(--global-gradient-hero)' }}>
        <div className="gs-hero-inner">
          <div className="gs-badge">Simple, Transparent Pricing</div>
          <h1 className="gs-title">
            Choose the plan that<br />
            <span className="gs-title-accent">fits your firm</span>
          </h1>
          <p className="gs-subtitle">
            Start free, scale as you grow. All plans include our core AI estimation engine.
          </p>
        </div>
      </section>

      {/* ── Plan Cards ── */}
      <section className="gs-plans-section">
        <div className="gs-plans-grid">
          {PLANS.map((plan) => (
            <div
              className={`gs-plan-card ${plan.popular ? 'gs-plan-popular' : ''}`}
              key={plan.id}
            >
              {plan.popular && <div className="gs-popular-badge">Most Popular</div>}
              <div className="gs-plan-name">{plan.id}</div>
              <div className="gs-plan-tagline">{plan.tagline}</div>
              <div className="gs-plan-price">
                <span className="gs-price-amount">{plan.price}</span>
                <span className="gs-price-period">{plan.period}</span>
              </div>

              <button
                className={`gs-plan-btn ${plan.popular ? 'gs-plan-btn-primary' : 'gs-plan-btn-secondary'}`}
                onClick={() => handlePlanClick(plan.plan)}
                id={`plan-${plan.id.toLowerCase()}-btn`}
              >
                {plan.cta}
              </button>

              <div className="gs-plan-divider" />

              <ul className="gs-feature-list">
                {plan.features.map((f) => (
                  <li key={f} className="gs-feature-item gs-feature-yes flex items-center gap-1.5">
                    <Check size={14} className="gs-feature-check text-emerald-600 shrink-0" /> {f}
                  </li>
                ))}
                {plan.missing.map((f) => (
                  <li key={f} className="gs-feature-item gs-feature-no flex items-center gap-1.5">
                    <X size={14} className="gs-feature-check text-gray-400 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="gs-faq-section">
        <div className="gs-faq-inner">
          <div className="gs-section-label">Frequently Asked Questions</div>
          <h2 className="gs-section-title">Everything you need to know</h2>

          <div className="gs-faq-list">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className={`gs-faq-item ${openFaq === i ? 'open' : ''}`}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="gs-faq-question">
                  {faq.q}
                  <span className="gs-faq-chevron">{openFaq === i ? '▲' : '▼'}</span>
                </div>
                {openFaq === i && (
                  <div className="gs-faq-answer">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="gs-bottom-cta">
        <h2 className="gs-cta-title">Still have questions?</h2>
        <p className="gs-cta-desc">Our team is happy to walk you through the platform and help you choose the right plan.</p>
        <div className="gs-cta-btns">
          <Link to="/contact" className="gs-btn-primary" id="gs-contact-btn">Contact Us</Link>
          <Link to="/login" className="gs-btn-secondary" id="gs-login-btn">Sign In</Link>
        </div>
      </section>
    </div>
  );
}
