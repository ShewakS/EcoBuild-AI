import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowRight } from 'lucide-react';
import './Hero.css';

function AnnotatedBlueprintSvg() {
  return (
    <svg
      viewBox="0 0 680 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      aria-label="Blueprint illustration of residential building with AI estimate callouts"
      role="img"
    >
      {/* Background blueprint grid */}
      <defs>
        <pattern id="hero-grid-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="20" y2="0" stroke="#E7E9EC" strokeWidth="0.75" />
          <line x1="0" y1="0" x2="0" y2="20" stroke="#E7E9EC" strokeWidth="0.75" />
        </pattern>
      </defs>
      <rect width="680" height="420" fill="url(#hero-grid-pattern)" />

      {/* Ground line */}
      <line x1="50" y1="365" x2="630" y2="365" stroke="#2B5CB0" strokeWidth="1.5" strokeLinecap="round" />

      {/* Building foundation */}
      <rect x="160" y="350" width="360" height="15" fill="#EEF3FB" stroke="#2B5CB0" strokeWidth="1" />

      {/* Outer walls */}
      <line x1="170" y1="350" x2="170" y2="125" stroke="#2B5CB0" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="510" y1="350" x2="510" y2="125" stroke="#2B5CB0" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="170" y1="125" x2="510" y2="125" stroke="#2B5CB0" strokeWidth="1.5" strokeLinecap="round" />

      {/* Roof */}
      <polyline points="150,125 340,60 530,125" stroke="#2B5CB0" strokeWidth="2" strokeLinejoin="round" />

      {/* Floor lines */}
      <line x1="170" y1="240" x2="510" y2="240" stroke="#7F9EDE" strokeWidth="1" strokeDasharray="5 4" />
      <line x1="170" y1="180" x2="510" y2="180" stroke="#7F9EDE" strokeWidth="1" strokeDasharray="5 4" />

      {/* Ground floor door & windows */}
      <rect x="195" y="265" width="65" height="75" fill="#EEF3FB" stroke="#2B5CB0" strokeWidth="1" />
      <line x1="227" y1="265" x2="227" y2="340" stroke="#7F9EDE" strokeWidth="0.75" />
      <rect x="310" y="290" width="60" height="60" fill="none" stroke="#2B5CB0" strokeWidth="1" />
      <line x1="340" y1="290" x2="340" y2="350" stroke="#7F9EDE" strokeWidth="0.75" />
      <rect x="420" y="265" width="65" height="75" fill="#EEF3FB" stroke="#2B5CB0" strokeWidth="1" />
      <line x1="452" y1="265" x2="452" y2="340" stroke="#7F9EDE" strokeWidth="0.75" />

      {/* Floor 1 & 2 windows */}
      <rect x="195" y="200" width="55" height="30" fill="#EEF3FB" stroke="#7F9EDE" strokeWidth="1" />
      <rect x="312" y="200" width="55" height="30" fill="#EEF3FB" stroke="#7F9EDE" strokeWidth="1" />
      <rect x="430" y="200" width="55" height="30" fill="#EEF3FB" stroke="#7F9EDE" strokeWidth="1" />
      <rect x="200" y="140" width="50" height="35" fill="#EEF3FB" stroke="#7F9EDE" strokeWidth="1" />
      <rect x="315" y="140" width="50" height="35" fill="#EEF3FB" stroke="#7F9EDE" strokeWidth="1" />
      <rect x="430" y="140" width="50" height="35" fill="#EEF3FB" stroke="#7F9EDE" strokeWidth="1" />

      {/* Solar panel roof attachment */}
      <rect x="295" y="75" width="90" height="36" rx="1" fill="#EBF5EF" stroke="#3E8E5E" strokeWidth="1" />
      <line x1="315" y1="75" x2="315" y2="111" stroke="#3E8E5E" strokeWidth="0.5" />
      <line x1="335" y1="75" x2="335" y2="111" stroke="#3E8E5E" strokeWidth="0.5" />
      <line x1="355" y1="75" x2="355" y2="111" stroke="#3E8E5E" strokeWidth="0.5" />

      {/* Dimension arrow */}
      <line x1="525" y1="125" x2="525" y2="350" stroke="#7F9EDE" strokeWidth="1" strokeDasharray="3 3" />
      <polyline points="521,135 525,125 529,135" stroke="#7F9EDE" strokeWidth="1" fill="none" />
      <polyline points="521,340 525,350 529,340" stroke="#7F9EDE" strokeWidth="1" fill="none" />
      <text x="548" y="240" fontSize="9" fill="#6B7898" fontFamily="IBM Plex Mono" textAnchor="middle" transform="rotate(90, 548, 240)">G+2 Structure</text>

      {/* ── Callout 1: Materials ── */}
      <line x1="170" y1="240" x2="90" y2="175" stroke="#2B5CB0" strokeWidth="1" strokeDasharray="4 3" />
      <circle cx="90" cy="173" r="3" fill="#2B5CB0" />
      <rect x="8" y="105" width="155" height="60" rx="3" fill="#ffffff" stroke="#E7E9EC" strokeWidth="1" />
      <text x="16" y="123" fontSize="8" fill="#6B7898" fontFamily="IBM Plex Mono" fontWeight="600">Material prediction</text>
      <text x="16" y="140" fontSize="10" fill="#16213E" fontFamily="IBM Plex Mono" fontWeight="600">1,243 bags cement</text>
      <text x="16" y="154" fontSize="9.5" fill="#2B5CB0" fontFamily="IBM Plex Mono">18.4 t steel</text>

      {/* ── Callout 2: Cost ── */}
      <line x1="510" y1="240" x2="590" y2="185" stroke="#2B5CB0" strokeWidth="1" strokeDasharray="4 3" />
      <circle cx="590" cy="183" r="3" fill="#2B5CB0" />
      <rect x="516" y="113" width="155" height="60" rx="3" fill="#ffffff" stroke="#E7E9EC" strokeWidth="1" />
      <text x="524" y="131" fontSize="8" fill="#6B7898" fontFamily="IBM Plex Mono" fontWeight="600">Cost estimate</text>
      <text x="524" y="148" fontSize="10" fill="#16213E" fontFamily="IBM Plex Mono" fontWeight="600">Rs. 42.6 L</text>
      <text x="524" y="162" fontSize="9" fill="#2B5CB0" fontFamily="IBM Plex Mono">total project cost</text>

      {/* ── Callout 3: Carbon & Score ── */}
      <line x1="340" y1="365" x2="340" y2="400" stroke="#3E8E5E" strokeWidth="1" strokeDasharray="4 3" />
      <circle cx="340" cy="366" r="3" fill="#3E8E5E" />
      <rect x="235" y="378" width="210" height="36" rx="3" fill="#ffffff" stroke="#E7E9EC" strokeWidth="1" />
      <text x="245" y="393" fontSize="8" fill="#6B7898" fontFamily="IBM Plex Mono" fontWeight="600">Carbon &amp; rating</text>
      <text x="245" y="406" fontSize="9" fill="#3E8E5E" fontFamily="IBM Plex Mono">84.2 tCO2e | Score: 72/100 Good</text>

      {/* ── Callout 4: Solar ── */}
      <line x1="340" y1="75" x2="340" y2="40" stroke="#3E8E5E" strokeWidth="1" strokeDasharray="4 3" />
      <circle cx="340" cy="75" r="3" fill="#3E8E5E" />
      <rect x="255" y="15" width="170" height="24" rx="3" fill="#EBF5EF" stroke="#91CCAA" strokeWidth="1" />
      <text x="265" y="31" fontSize="9" fill="#3E8E5E" fontFamily="IBM Plex Mono">Solar generation (+15 pts)</text>
    </svg>
  );
}

export default function Hero() {
  return (
    <div className="hero-wrapper" style={{ background: 'var(--global-gradient-hero)', color: '#ffffff' }}>
      <div className="hero-grid-overlay" />
      <div className="hero-container">
        {/* Left Side: Headline & CTAs */}
        <div className="hero-text-side">
          <div className="hero-badge-tag">
            <Building2 size={14} />
            <span>Smart Construction Platform</span>
          </div>

          <h1 className="hero-title" style={{ color: '#ffffff' }}>
            AI-driven material estimates, cost breakdown, and <span className="hero-highlight" style={{ color: '#90B5F0' }}>carbon analytics</span>.
          </h1>

          <p className="hero-subtitle" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
            EcoBuild AI combines machine learning with Indian engineering standards (CPWD, IFC, BMTPC) to deliver instant, accurate construction intelligence.
          </p>

          <div className="hero-actions">
            <Link to="/login" className="btn-primary" id="hero-signin-btn" style={{ background: 'var(--blueprint)', borderColor: 'var(--blueprint)', color: '#ffffff' }}>
              Sign in to Platform
              <ArrowRight size={15} />
            </Link>
            <Link to="/contact" className="btn-secondary" id="hero-contact-btn" style={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.35)' }}>
              Request Access
            </Link>
          </div>

          <div className="hero-standards-strip">
            <span className="hero-standard-item">CPWD 2022 Data Book</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
            <span className="hero-standard-item">IFC Indian Factors</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
            <span className="hero-standard-item">BMTPC Standards</span>
          </div>
        </div>

        {/* Right Side: Graphic Illustration */}
        <div className="hero-graphic-card">
          <AnnotatedBlueprintSvg />
        </div>
      </div>
    </div>
  );
}
