import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Heart,
  Compass,
  Leaf,
  Scale
} from 'lucide-react';
import './AboutUs.css';

const PILLARS = [
  {
    icon: Compass,
    title: 'Architectural Integrity',
    desc: 'Every structure begins with human emotion and architectural vision. We provide the intelligence to ensure visionary designs never get diluted by cost panic or procurement compromises.'
  },
  {
    icon: ShieldCheck,
    title: 'Radical Financial Honesty',
    desc: 'No hidden contingencies, no inflated contractor markups. By benchmarking directly against the Central Public Works Department (CPWD) schedule, we give homeowners 100% budget certainty before ground is broken.'
  },
  {
    icon: Leaf,
    title: 'Ecological Responsibility',
    desc: 'Constructing a home shouldn’t cost the earth. We audit embodied carbon from day one, championing breathable AAC blocks, fly ash pozzolana cement, and circular material reuse that slash carbon by up to 35%.'
  },
  {
    icon: Heart,
    title: 'Homeowner Peace of Mind',
    desc: 'Building your dream home should be one of the most joyful chapters of your life. We replace fragmented phone calls and site anxiety with transparent photo verification and milestone clarity.'
  }
];

const LEADERSHIP = [
  {
    name: 'Ar. Priya Sharma',
    role: 'Principal Architect & Co-Founder',
    creds: 'B.Arch (SPA Delhi), LEED AP &bull; Council of Architecture CA/2018/94821',
    bio: 'With over 14 years pioneering sustainable residential villas across South India, Priya leads the architectural intelligence and design framework at EcoBuild.',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Eng. Rajesh Verma',
    role: 'Head of Civil Engineering & Costing',
    creds: 'M.Tech (IIT Delhi) &bull; Former Senior Engineer, CPWD Infrastructure',
    bio: 'Bringing 22 years of public works and high-rise structural engineering expertise, Rajesh oversees our CPWD cost calibration and Indian Standards compliance.',
    img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Dr. Anandhi Sundaram',
    role: 'Chief Sustainability & Carbon Scientist',
    creds: 'Ph.D in Environmental LCA &bull; Advisor, Green Building Council',
    bio: 'Specialist in embodied carbon accounting and IFC EDGE datasets. Anandhi formulated our proprietary 0–100 sustainability scoring framework.',
    img: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=600&q=80'
  }
];

const MANIFESTO_POINTS = [
  'We believe homebuilders deserve complete financial transparency, with zero hidden escalation clauses.',
  'We believe sustainable materials must be cost-competitive and readily accessible in Indian regional markets.',
  'We believe true quality is proven through verified on-site photographic documentation, not verbal promises.',
  'We believe the future of Indian construction belongs to architects and builders who build with ecological pride.'
];

export default function AboutUs() {
  return (
    <div className="about-unique-root">
      {/* ── 1. Editorial Hero Section ── */}
      <section className="about-editorial-hero">
        <div className="about-hero-container">
          <div className="about-hero-badge">
            <Sparkles size={14} className="text-emerald-400" />
            <span>Our Story &amp; Philosophy</span>
          </div>

          <h1 className="about-hero-headline">
            Reimagining How India Builds — With <span className="hero-text-accent">Certainty</span> and <span className="hero-text-green">Conscience</span>.
          </h1>

          <p className="about-hero-subhead">
            We founded EcoBuild AI with a singular conviction: building your sanctuary should be an inspiring, joyous experience — free from budget anxiety, hidden expenses, and ecological compromise.
          </p>

          <div className="about-hero-stats-strip">
            <div className="hero-stat-cell">
              <span className="stat-number">₹520+ Cr</span>
              <span className="stat-label">Construction Cost Modeled</span>
            </div>
            <div className="stat-divider" />
            <div className="hero-stat-cell">
              <span className="stat-number">1,400+</span>
              <span className="stat-label">Homes &amp; Sanctuaries Built</span>
            </div>
            <div className="stat-divider" />
            <div className="hero-stat-cell">
              <span className="stat-number">28,000 t</span>
              <span className="stat-label">Embodied CO2e Mitigated</span>
            </div>
            <div className="stat-divider" />
            <div className="hero-stat-cell">
              <span className="stat-number">0%</span>
              <span className="stat-label">Surprise Cost Overruns</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. The Narrative Story (Why We Exist) ── */}
      <section className="about-story-section">
        <div className="about-content-wrapper">
          <div className="story-split-grid">
            <div className="story-text-column">
              <span className="story-label">Chapter 01 &bull; The Origin</span>
              <h2 className="story-title">The Broken Promise of Modern Construction</h2>
              <div className="story-paragraphs">
                <p>
                  Across India, over 80% of residential and commercial projects exceed their original budget or delivery timeline. For most families and visionary architects, the dream of building a space turns into a draining ordeal of unpredictable contractor invoices, disputed change orders, and anxious job-site visits.
                </p>
                <p>
                  At the same time, traditional construction consumes massive amounts of energy. The raw materials used in our foundations and walls — ordinary red bricks, uncalibrated concrete mixes, and unmanaged steel offcuts — silently generate over a third of global carbon emissions.
                </p>
                <p className="story-highlight">
                  We built EcoBuild AI to heal this divide. By bringing verified Indian engineering benchmarks (CPWD, BMTPC, and IFC India) together with intuitive digital transparency, we ensure every homeowner and architect can build with total peace of mind.
                </p>
              </div>
            </div>

            <div className="story-visual-column">
              <div className="architectural-feature-card">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80"
                  alt="Modern Sustainable Residence Architecture"
                  className="feature-card-img"
                />
                <div className="feature-card-overlay">
                  <span className="overlay-pill">EcoBuild Certified Build</span>
                  <h4 className="overlay-title">The Glasshouse Villa &bull; Bengaluru</h4>
                  <p className="overlay-sub">3,450 sq.ft &bull; AAC Blocks, Fly Ash PPC &amp; 100% Rainwater Harvesting</p>
                  <div className="overlay-tags">
                    <span>Zero Budget Creep</span>
                    <span>32% Carbon Reduction</span>
                    <span>11 Stages Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Four Core Pillars of Excellence ── */}
      <section className="about-pillars-section">
        <div className="about-content-wrapper">
          <div className="text-center-wrapper">
            <span className="section-eyebrow">Our Guiding Convictions</span>
            <h2 className="section-main-title">Four Pillars That Guide Everything We Build</h2>
            <p className="section-sub-desc">
              We operate at the intersection of architectural beauty, structural science, and human dignity.
            </p>
          </div>

          <div className="pillars-cards-grid">
            {PILLARS.map((p, idx) => {
              const PillarIcon = p.icon;
              return (
                <div key={idx} className="pillar-editorial-card">
                  <div className="pillar-icon-wrap">
                    <PillarIcon size={24} />
                  </div>
                  <h3 className="pillar-card-title">{p.title}</h3>
                  <p className="pillar-card-desc">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. Indian Standards & Engineering Heritage ── */}
      <section className="about-standards-heritage">
        <div className="about-content-wrapper">
          <div className="heritage-box">
            <div className="heritage-header">
              <Scale size={24} className="text-emerald-400" />
              <div>
                <span className="heritage-label">ENGINEERING FOUNDATION</span>
                <h3 className="heritage-title">Grounded in Authentic Indian Construction Science</h3>
              </div>
            </div>
            <p className="heritage-intro">
              Unlike generic overseas software that uses American or European assumptions, EcoBuild AI is calibrated strictly to the climate zones, soil classifications, and public works schedules of India.
            </p>

            <div className="heritage-grid">
              <div className="heritage-item">
                <div className="heritage-item-title">CPWD Delhi Schedule of Rates (DSR)</div>
                <div className="heritage-item-desc">
                  Calibrated against the 2024 regional Analysis of Rates for accurate labour-to-material constants, itemized unit rates, and finish multipliers.
                </div>
              </div>

              <div className="heritage-item">
                <div className="heritage-item-title">IFC Indian Carbon Emission Datasets</div>
                <div className="heritage-item-desc">
                  Official Global Warming Potential (GWP) and Embodied Energy (EE) factors tailored to Indian cement kilns, steel mills, and regional quarries.
                </div>
              </div>

              <div className="heritage-item">
                <div className="heritage-item-title">BMTPC &amp; NICMAR Waste Norms</div>
                <div className="heritage-item-desc">
                  Guidelines from the Building Materials &amp; Technology Promotion Council that benchmark allowable site loss and classify safe material reuse.
                </div>
              </div>

              <div className="heritage-item">
                <div className="heritage-item-title">IS 456:2000 Plain &amp; Reinforced Concrete</div>
                <div className="heritage-item-desc">
                  Bureau of Indian Standards concrete design mix constants that safeguard structural integrity and earthquake resilience across all zones.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Leadership & Visionaries ── */}
      <section className="about-leadership-section">
        <div className="about-content-wrapper">
          <div className="text-center-wrapper">
            <span className="section-eyebrow">The Leadership Team</span>
            <h2 className="section-main-title">Led by Architects, Engineers &amp; Scientists</h2>
            <p className="section-sub-desc">
              Combining decades of hands-on job-site experience with cutting-edge computational intelligence.
            </p>
          </div>

          <div className="leadership-cards-grid">
            {LEADERSHIP.map((leader, i) => (
              <div key={i} className="leader-card">
                <div className="leader-photo-wrap">
                  <img src={leader.img} alt={leader.name} className="leader-photo" />
                </div>
                <div className="leader-info">
                  <h4 className="leader-name">{leader.name}</h4>
                  <div className="leader-role">{leader.role}</div>
                  <div
                    className="leader-creds"
                    dangerouslySetInnerHTML={{ __html: leader.creds }}
                  />
                  <p className="leader-bio">{leader.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. The EcoBuild Manifesto ── */}
      <section className="about-manifesto-section">
        <div className="about-content-wrapper">
          <div className="manifesto-card">
            <div className="manifesto-header">
              <span className="manifesto-badge">The EcoBuild Manifesto</span>
              <h3 className="manifesto-title">Our Sacred Promises to the Built Environment</h3>
            </div>

            <div className="manifesto-list">
              {MANIFESTO_POINTS.map((point, index) => (
                <div key={index} className="manifesto-item">
                  <span className="manifesto-num">0{index + 1}</span>
                  <p className="manifesto-text">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Inspiring Call to Action ── */}
      <section className="about-closing-cta">
        <div className="about-content-wrapper text-center">
          <h2 className="cta-headline">
            Ready to Experience the New Standard in Construction?
          </h2>
          <p className="cta-subhead">
            Whether you are designing a sustainable residence or preparing to build your family home, we are here to ensure every step is transparent, precise, and inspiring.
          </p>

          <div className="cta-actions-row">
            <Link to="/get-started" className="btn-about-primary">
              <span>View Access Plans</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="btn-about-secondary">
              <span>Contact Architectural Team</span>
            </Link>
            <Link to="/customer/dashboard" className="btn-about-ghost">
              <span>Experience Customer Portal</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
