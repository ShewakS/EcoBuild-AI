import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, ArrowRight, CheckCircle2, ShieldCheck,
  Sparkles, Eye, Calendar
} from 'lucide-react';
import './Hero.css';

const SHOWCASE_PERSPECTIVES = {
  exterior: {
    title: 'The Emerald Horizon Residence',
    location: 'Indiranagar, Bengaluru &bull; G+2 Luxury Villa (3,450 sq.ft)',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    tag: 'Architectural Exterior',
    highlight: 'Passive solar orientation with cantilevered shading decks and natural stone cladding.',
    milestone: 'Stage 6 of 11: Masonry & Structural Framing Completed',
    guarantee: '100% Price Lock &bull; Zero Budget Creep'
  },
  interior: {
    title: 'Sunlit Living Sanctuary',
    location: 'High-Ceiling Open Living & Dining Integration',
    img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80',
    tag: 'Interior & Air Quality',
    highlight: 'Non-toxic low-VOC finishes, cross-ventilated courtyard, and acoustic insulation.',
    milestone: 'Interior Electrical & Plumbing Conduits Verified',
    guarantee: 'Certified Toxin-Free Living Environment'
  },
  site: {
    title: 'Verified Field Inspection Log',
    location: 'On-Site Quality Audit &bull; Inspected Today, 11:30 AM',
    img: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1000&q=80',
    tag: 'Live Inspection Feed',
    highlight: 'M25 concrete cube strength verified at 32.4 MPa. Rebar spacing signed off.',
    milestone: 'Signed by Ar. Priya Sharma (Council of Architecture)',
    guarantee: 'CPWD 2024 Engineering Compliance'
  }
};

export default function Hero() {
  const [activeView, setActiveView] = useState('exterior');
  const currentShowcase = SHOWCASE_PERSPECTIVES[activeView];

  return (
    <div className="hero-wrapper">
      <div className="hero-grid-overlay" />
      <div className="hero-container">
        {/* Left Side: Human-Centric Value Proposition */}
        <div className="hero-text-side">
          <div className="hero-badge-tag">
            <span className="hero-badge-dot" />
            <Sparkles size={13} className="text-emerald-400" />
            <span>The Premier Sustainable Home Building Experience</span>
          </div>

          <h1 className="hero-title">
            Build Your Dream Home With <span className="hero-title-highlight">Absolute Certainty</span>.
          </h1>

          <p className="hero-subtitle">
            From architectural vision to the housewarming ceremony — enjoy guaranteed turnkey budgets, verified weekly photo updates, and certified green living. No contractor surprises, no budget anxiety.
          </p>

          <div className="hero-actions">
            <Link to="/customer/dashboard" className="hero-btn-primary" id="hero-customer-portal-btn">
              <Eye size={16} />
              <span>Explore Homeowner Portal</span>
            </Link>
            <a href="#vision-explorer" className="hero-btn-secondary" id="hero-explore-btn">
              <Building2 size={15} />
              <span>Design Your Home</span>
            </a>
            <Link to="/login" className="hero-btn-ghost" id="hero-architect-btn">
              <span>Architect Sign In</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="hero-trust-bar">
            <div className="hero-trust-item">
              <span className="hero-trust-val">₹520+ Cr</span>
              <span className="hero-trust-lbl">Built with Certainty</span>
            </div>
            <div className="hero-trust-sep" />
            <div className="hero-trust-item">
              <span className="hero-trust-val">1,400+</span>
              <span className="hero-trust-lbl">Families In Their Homes</span>
            </div>
            <div className="hero-trust-sep" />
            <div className="hero-trust-item">
              <span className="hero-trust-val">0%</span>
              <span className="hero-trust-lbl">Surprise Overruns</span>
            </div>
            <div className="hero-trust-sep" />
            <div className="hero-trust-item">
              <span className="hero-trust-val">100%</span>
              <span className="hero-trust-lbl">Photo Verified</span>
            </div>
          </div>
        </div>

        {/* Right Side: Architectural Residence Showcase (Not an analytics dashboard) */}
        <div className="hero-showcase-container">
          <div className="residence-showcase-card">
            {/* Visual View Switcher */}
            <div className="showcase-nav-bar">
              <button
                type="button"
                className={`showcase-nav-btn ${activeView === 'exterior' ? 'active' : ''}`}
                onClick={() => setActiveView('exterior')}
              >
                <span>Architectural Exterior</span>
              </button>
              <button
                type="button"
                className={`showcase-nav-btn ${activeView === 'interior' ? 'active' : ''}`}
                onClick={() => setActiveView('interior')}
              >
                <span>Living Sanctuaries</span>
              </button>
              <button
                type="button"
                className={`showcase-nav-btn ${activeView === 'site' ? 'active' : ''}`}
                onClick={() => setActiveView('site')}
              >
                <span>Live Site Inspection</span>
              </button>
            </div>

            {/* Architectural Visual Container */}
            <div className="residence-img-viewport">
              <img
                src={currentShowcase.img}
                alt={currentShowcase.title}
                className="residence-main-img"
              />

              {/* Floating Live Badge */}
              <div className="floating-live-chip">
                <span className="pulse-indicator" />
                <span>{currentShowcase.tag}</span>
              </div>

              {/* Bottom Card Overlay */}
              <div className="residence-overlay-content">
                <div className="residence-header-row">
                  <div>
                    <h3 className="residence-title">{currentShowcase.title}</h3>
                    <div
                      className="residence-location"
                      dangerouslySetInnerHTML={{ __html: currentShowcase.location }}
                    />
                  </div>
                  <div className="residence-status-badge">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>On Schedule</span>
                  </div>
                </div>

                <p className="residence-highlight-text">
                  {currentShowcase.highlight}
                </p>

                <div className="residence-footer-chips">
                  <span className="chip-item">
                    <Calendar size={12} className="text-emerald-300" />
                    <span>{currentShowcase.milestone}</span>
                  </span>
                  <span className="chip-item guarantee">
                    <ShieldCheck size={12} className="text-blue-300" />
                    <span dangerouslySetInnerHTML={{ __html: currentShowcase.guarantee }} />
                  </span>
                </div>
              </div>
            </div>

            {/* Showcase Bottom Assurance Bar */}
            <div className="showcase-assurance-bar">
              <div className="assurance-lead">
                <div className="lead-thumb">PS</div>
                <div>
                  <div className="lead-title">Lead Architect: Ar. Priya Sharma</div>
                  <div className="lead-sub">CoA Reg. CA/2018/94821 &bull; Studio Green Arch</div>
                </div>
              </div>
              <Link to="/customer/dashboard" className="btn-peek-portal">
                <span>View Client Portal</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
