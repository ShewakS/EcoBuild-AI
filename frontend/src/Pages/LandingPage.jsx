import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, ShieldCheck, CheckCircle2,
  ArrowRight, Sparkles, Award,
  Eye, PhoneCall, Heart, Calendar,
  Wind, Sparkle, Camera, MessageSquare
} from 'lucide-react';
import Hero from '../Components/Hero';
import './LandingPage.css';

/* ── Architectural Typologies for Homeowner Vision ── */
const RESIDENCE_STYLES = {
  courtyard: {
    name: 'Biophilic Courtyard Villa',
    subtitle: 'Passive solar cooling &bull; Open-to-sky central greenery',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    desc: 'Centred around a lush living courtyard that channels natural cross-breezes and ambient daylight into every living space, reducing artificial cooling requirements by 40%.',
    highlights: ['Natural Cross-Ventilation', 'Thermal AAC Block Shell', 'Rainwater Recharge Pit', 'Courtyard Garden View'],
    baseCostPerSqft: 2150,
    coolingBonus: '3.8°C Naturally Cooler'
  },
  minimalist: {
    name: 'Modern Minimalist Glasshouse',
    subtitle: 'Cantilevered terraces &bull; Double-glazed panoramic vistas',
    img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
    desc: 'Clean geometric lines seamlessly blending indoor and outdoor living. Built with recycled steel structural framing, low-emissivity glass, and acoustic insulation.',
    highlights: ['Floor-to-Ceiling Natural Light', 'Recycled Structural Steel', 'Soundproof UPVC Glazing', 'Solar Ready Rooftop'],
    baseCostPerSqft: 2450,
    coolingBonus: 'Acoustically Insulated'
  },
  penthouse: {
    name: 'Urban Eco-Duplex',
    subtitle: 'Rooftop terrace garden &bull; Net-zero solar generation',
    img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80',
    desc: 'Optimized for modern multi-generation urban living. Incorporates organic terrace gardens, solar rooftop canopies, and non-toxic Italian breathable plastering.',
    highlights: ['5.5 kW Rooftop Solar Canopy', 'Organic Terrace Gardening', 'Low-VOC Non-Toxic Finishes', 'Zero Thermal Bridge Design'],
    baseCostPerSqft: 2350,
    coolingBonus: '65% Energy Independent'
  }
};

/* ── Four Client Guarantees ── */
const CLIENT_GUARANTEES = [
  {
    icon: ShieldCheck,
    title: 'The CPWD Price-Lock Guarantee',
    desc: 'Never worry about contractor extortion or sudden price inflation. Your turnkey construction cost is contractually indexed against CPWD regional rates before work begins.',
    badge: 'Zero Surprise Bills'
  },
  {
    icon: Camera,
    title: 'Live Photographic Inspection Feed',
    desc: 'Watch your home rise with total joy. Your lead architect uploads high-resolution site inspection photos for every concrete pour, column rebar spacing, and curing cycle.',
    badge: '100% Visual Verification'
  },
  {
    icon: Wind,
    title: 'Naturally Cooler, Breathable Air',
    desc: 'Live in a home that breathes. By replacing kiln-fired red bricks with thermal AAC blocks and non-toxic mineral finishes, ambient indoor temperatures drop by 3° to 5°C naturally.',
    badge: 'Health & Wellness'
  },
  {
    icon: MessageSquare,
    title: 'Direct Architect & Concierge Access',
    desc: 'No middleman contractor chaos. You have direct, one-tap access to your Lead Architect via WhatsApp and scheduled on-site walkthroughs whenever you want.',
    badge: 'White-Glove Support'
  }
];

/* ── 5-Step Journey ── */
const JOURNEY_STEPS = [
  {
    step: '01',
    title: 'Architectural Vision & Spatial Design',
    desc: 'Meet your dedicated lead architect to co-create your layout, room flow, natural lighting orientation, and bespoke aesthetic preferences.'
  },
  {
    step: '02',
    title: 'Guaranteed Turnkey Budget Locking',
    desc: 'Receive a transparent, line-by-line financial roadmap calibrated with regional CPWD benchmarks. No hidden fees, no budget drift.'
  },
  {
    step: '03',
    title: 'Foundation & Structural Execution',
    desc: 'Watch ground-breaking, footing excavation, and column framing come alive with weekly verified photo logs and structural audit sign-offs.'
  },
  {
    step: '04',
    title: 'Bespoke Finishes & Eco-Fixtures',
    desc: 'Select premium sustainable materials — from vitrified anti-skid tiles and UPVC triple-track windows to rainwater harvesting and solar canopies.'
  },
  {
    step: '05',
    title: 'The Housewarming Celebration',
    desc: 'Receive the keys to your certified green sanctuary, complete with warranties, municipal occupancy clearances, and official sustainability certificates.'
  }
];

export default function LandingPage() {
  const [selectedStyle, setSelectedStyle] = useState('courtyard');
  const [areaSqft, setAreaSqft] = useState(3200);

  const activeStyle = RESIDENCE_STYLES[selectedStyle];

  const estimatedBudget = useMemo(() => {
    const total = Math.round(areaSqft * activeStyle.baseCostPerSqft);
    return (total / 100000).toFixed(2);
  }, [areaSqft, activeStyle]);

  return (
    <div className="landing-page-root">
      {/* ── 1. Inspiring Customer Hero ── */}
      <Hero />

      {/* ── 2. Trust & Indian Architectural Integrity Strip ── */}
      <section className="standards-strip-section">
        <div className="standards-container">
          <div className="standards-label">ENGINEERED IN COMPLIANCE WITH INDIAN NATIONAL STANDARDS</div>
          <div className="standards-logos-grid">
            <div className="standard-item">
              <span className="standard-title">CPWD 2024</span>
              <span className="standard-desc">Price-Lock Schedule</span>
            </div>
            <div className="standard-divider" />
            <div className="standard-item">
              <span className="standard-title">IFC India</span>
              <span className="standard-desc">Green Building Carbon Data</span>
            </div>
            <div className="standard-divider" />
            <div className="standard-item">
              <span className="standard-title">BMTPC</span>
              <span className="standard-desc">Zero-Waste Norms</span>
            </div>
            <div className="standard-divider" />
            <div className="standard-item">
              <span className="standard-title">IGBC &amp; GRIHA</span>
              <span className="standard-desc">Green Certified Homes</span>
            </div>
            <div className="standard-divider" />
            <div className="standard-item">
              <span className="standard-title">CoA Registered</span>
              <span className="standard-desc">Council of Architecture</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Interactive Home Vision & Living Experience Configurator ── */}
      <section id="vision-explorer" className="vision-configurator-section">
        <div className="section-inner">
          <div className="section-badge-center">
            <Sparkles size={13} className="text-emerald-500" />
            <span>Interactive Living Experience</span>
          </div>
          <h2 className="section-heading-center">
            Envision Your Future Sanctuary
          </h2>
          <p className="section-subtext-center">
            Select your architectural lifestyle and explore how spatial orientation and sustainable construction deliver both luxury and lasting financial peace of mind.
          </p>

          <div className="vision-configurator-card">
            {/* Left: Style & Area Controls */}
            <div className="vision-controls-side">
              <span className="control-section-label">1. Choose Your Architectural Typology</span>
              
              <div className="style-selector-cards">
                {Object.entries(RESIDENCE_STYLES).map(([key, st]) => (
                  <div
                    key={key}
                    className={`style-card-option ${selectedStyle === key ? 'active' : ''}`}
                    onClick={() => setSelectedStyle(key)}
                  >
                    <div className="style-option-header">
                      <strong className="style-option-name">{st.name}</strong>
                      {selectedStyle === key && <CheckCircle2 size={16} className="text-emerald-600" />}
                    </div>
                    <div className="style-option-sub" dangerouslySetInnerHTML={{ __html: st.subtitle }} />
                  </div>
                ))}
              </div>

              <div className="area-slider-group">
                <div className="slider-label-row">
                  <span className="slider-title">Built-up Living Area</span>
                  <span className="slider-val-badge">{areaSqft.toLocaleString('en-IN')} sq.ft</span>
                </div>
                <input
                  type="range"
                  min="1200"
                  max="7500"
                  step="100"
                  value={areaSqft}
                  onChange={(e) => setAreaSqft(Number(e.target.value))}
                  className="custom-range-bar"
                />
                <div className="slider-limits">
                  <span>1,200 sq.ft (Villa)</span>
                  <span>4,000 sq.ft</span>
                  <span>7,500 sq.ft (Estate)</span>
                </div>
              </div>

              <div className="vision-assurance-note">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>
                  Every estimate includes turnkey civil construction, premium finishes, architectural blueprints, and CPWD-locked material rates.
                </span>
              </div>
            </div>

            {/* Right: Architectural Living Preview */}
            <div className="vision-preview-side">
              <div className="preview-media-box">
                <img src={activeStyle.img} alt={activeStyle.name} className="preview-media-img" />
                <div className="preview-top-badge">
                  <Sparkle size={12} className="text-emerald-400" />
                  <span>{activeStyle.coolingBonus}</span>
                </div>
                <div className="preview-bottom-caption">
                  <h3 className="preview-title">{activeStyle.name}</h3>
                  <p className="preview-desc">{activeStyle.desc}</p>
                  <div className="preview-feature-tags">
                    {activeStyle.highlights.map((h, i) => (
                      <span key={i} className="tag-pill">{h}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="preview-budget-strip">
                <div className="budget-cell">
                  <span className="budget-lbl">Estimated Turnkey Investment</span>
                  <span className="budget-val">₹{estimatedBudget} Lakhs</span>
                  <span className="budget-sub">CPWD Price-Locked &bull; Turnkey</span>
                </div>
                <Link to="/contact" className="btn-request-consultation">
                  <span>Request Custom Plans</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. The Four Client Guarantees ── */}
      <section className="client-guarantees-section">
        <div className="section-inner">
          <div className="section-badge-center">
            <Award size={13} className="text-emerald-500" />
            <span>The EcoBuild Standard</span>
          </div>
          <h2 className="section-heading-center">
            Four Commitments to Every Homeowner
          </h2>
          <p className="section-subtext-center">
            We eliminate the anxiety, disputes, and unpredictability of traditional construction with rock-solid guarantees.
          </p>

          <div className="guarantees-grid">
            {CLIENT_GUARANTEES.map((g, i) => {
              const IconComp = g.icon;
              return (
                <div key={i} className="guarantee-card">
                  <div className="guarantee-header-row">
                    <div className="guarantee-icon-box">
                      <IconComp size={22} />
                    </div>
                    <span className="guarantee-badge">{g.badge}</span>
                  </div>
                  <h3 className="guarantee-title">{g.title}</h3>
                  <p className="guarantee-desc">{g.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. The 5-Step Journey to Your Home ── */}
      <section className="homeowner-journey-section">
        <div className="section-inner">
          <div className="section-badge-center">
            <Calendar size={13} className="text-emerald-500" />
            <span>How It Works</span>
          </div>
          <h2 className="section-heading-center">
            A Transparent Journey From First Sketch to Key Handover
          </h2>
          <p className="section-subtext-center">
            You don’t have to guess what happens next. Track every milestone with complete peace of mind.
          </p>

          <div className="journey-horizontal-timeline">
            {JOURNEY_STEPS.map((s, idx) => (
              <div key={idx} className="timeline-step-card">
                <div className="timeline-step-num">{s.step}</div>
                <h4 className="timeline-step-title">{s.title}</h4>
                <p className="timeline-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Client Stories & Verified Testimonials ── */}
      <section className="client-stories-section">
        <div className="section-inner">
          <div className="section-badge-center">
            <Heart size={13} className="text-emerald-500" />
            <span>Homeowner Stories</span>
          </div>
          <h2 className="section-heading-center">
            Loved by Families and Architects Across India
          </h2>
          <p className="section-subtext-center">
            Hear from property owners who turned the dream of building a home into an enjoyable reality.
          </p>

          <div className="stories-grid">
            <div className="story-card">
              <p className="story-quote">
                &ldquo;Building our villa in Chennai was completely stress-free. Every Friday, our architect uploaded clear photo updates of the foundation and slab casting. Best of all: we didn&rsquo;t pay a single rupee over the agreed budget.&rdquo;
              </p>
              <div className="story-author-info">
                <div className="author-avatar blue">AK</div>
                <div>
                  <div className="author-name">Amit Kapoor</div>
                  <div className="author-detail">Homeowner &bull; Emerald Horizon Residence, Chennai</div>
                </div>
              </div>
            </div>

            <div className="story-card">
              <p className="story-quote">
                &ldquo;EcoBuild AI transformed our architectural practice. Our clients love having their own private portal to track construction milestones. It completely eliminated the constant back-and-forth phone calls and WhatsApp confusion.&rdquo;
              </p>
              <div className="story-author-info">
                <div className="author-avatar green">PS</div>
                <div>
                  <div className="author-name">Ar. Priya Sharma</div>
                  <div className="author-detail">Principal Architect &bull; Studio Green Arch, Bengaluru</div>
                </div>
              </div>
            </div>

            <div className="story-card">
              <p className="story-quote">
                &ldquo;The CPWD price-lock guarantee saved us from the massive steel price spike that happened earlier this year. Our budget was respected, our AAC block walls keep our living room naturally cool, and we couldn&rsquo;t be happier.&rdquo;
              </p>
              <div className="story-author-info">
                <div className="author-avatar amber">NR</div>
                <div>
                  <div className="author-name">Neha &amp; Vikram Rao</div>
                  <div className="author-detail">Homeowners &bull; Serene Villa, Coimbatore</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Inspiring Closing Call to Action ── */}
      <section className="closing-homeowner-cta">
        <div className="cta-container">
          <div className="cta-inner text-center">
            <h2 className="cta-title">
              Ready to Build Your Home With Confidence?
            </h2>
            <p className="cta-desc">
              Experience the clarity of transparent budgets, verified site progress, and certified sustainable living. Explore our live client portal demo or consult with our architectural team today.
            </p>
            <div className="cta-button-group">
              <Link to="/customer/dashboard" className="cta-btn-primary" id="landing-portal-preview">
                <Eye size={16} />
                <span>Experience Customer Portal</span>
              </Link>
              <Link to="/contact" className="cta-btn-secondary" id="landing-contact-team">
                <PhoneCall size={15} />
                <span>Consult Our Architectural Team</span>
              </Link>
              <Link to="/login" className="cta-btn-ghost" id="landing-signin-architect">
                <span>Architect Workspace</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Elegant Footer ── */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-top-row">
            <div className="footer-brand-col">
              <div className="footer-brand-logo">
                <Building2 size={20} className="text-emerald-400" />
                <span className="brand-text">EcoBuild AI</span>
              </div>
              <p className="footer-brand-desc">
                The premier sustainable construction intelligence platform. Empowering homeowners and architects with guaranteed CPWD budgets, verified milestone photo logs, and certified green living across India.
              </p>
              <div className="footer-compliance-badges">
                <span className="comp-pill">CPWD 2024 Calibrated</span>
                <span className="comp-pill">IFC India EDGE</span>
                <span className="comp-pill">BMTPC Certified</span>
              </div>
            </div>

            <div className="footer-links-col">
              <h4 className="footer-heading">Homeowner</h4>
              <ul className="footer-link-list">
                <li><Link to="/customer/dashboard">Client Portal</Link></li>
                <li><a href="#vision-explorer">Design Your Sanctuary</a></li>
                <li><Link to="/about">Our Story &amp; Philosophy</Link></li>
                <li><Link to="/contact">Schedule Site Visit</Link></li>
              </ul>
            </div>

            <div className="footer-links-col">
              <h4 className="footer-heading">Architect</h4>
              <ul className="footer-link-list">
                <li><Link to="/cost-estimation">Cost &amp; Quantity BOQ</Link></li>
                <li><Link to="/recommendations">Eco Materials Engine</Link></li>
                <li><Link to="/projects">11-Stage Site Manager</Link></li>
                <li><Link to="/login">Architect Sign In</Link></li>
              </ul>
            </div>

            <div className="footer-links-col">
              <h4 className="footer-heading">Standards</h4>
              <ul className="footer-link-list">
                <li><span className="text-slate-400">CPWD Schedule of Rates 2024</span></li>
                <li><span className="text-slate-400">IFC Indian Carbon Emission Dataset</span></li>
                <li><span className="text-slate-400">BMTPC Waste Norms</span></li>
                <li><span className="text-slate-400">Council of Architecture Standards</span></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom-row">
            <div className="footer-copyright">
              &copy; {new Date().getFullYear()} EcoBuild AI Platform. All rights reserved &bull; Engineered in India for the Sustainable Built Environment.
            </div>
            <div className="footer-legal-links">
              <span>Privacy Policy</span>
              <span className="dot-sep">&bull;</span>
              <span>Terms of Service</span>
              <span className="dot-sep">&bull;</span>
              <span>CPWD Rate Index License</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
