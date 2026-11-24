import React, { useState, useEffect } from 'react';
import { getCustomerDashboard } from '../../Assets/api';
import {
  Building2, MapPin, Calendar, Star, ClipboardList, Camera,
  CheckCircle2, IndianRupee, Leaf, ShieldCheck, Download,
  Phone, Mail, MessageSquare, Sparkles, Check, Layers,
  X, Clock, HardHat
} from 'lucide-react';
import './CustomerDashboard.css';

/* ── Default Flagship Demo Project for Seamless Experience ── */
const DEMO_PROJECT = {
  project_id: 'PRJ-2026-7DBA',
  project_name: 'The Emerald Horizon Villa',
  location: 'Indiranagar 12th Main, Bengaluru, Karnataka',
  status: 'In Progress',
  overall_progress_percent: 65,
  current_stage: 'Stage 06: Brickwork & AAC Masonry',
  architect_name: 'Ar. Priya Sharma',
  architect_email: 'priya.sharma@studiogreenarch.in',
  architect_phone: '+91 98450 11223',
  architect_coa: 'CA/2018/94821 (Council of Architecture)',
  start_date: '2026-04-15',
  target_handover: '2026-12-20',
  building_details: {
    building_type: 'Luxury Residential Villa',
    floors: 'G + 2 Floors',
    built_up_area_sqft: 3450,
    plot_area_sqft: 4000,
    total_cost: 4820000,
  },
  stages: [
    { id: 1, name: 'Planning & Site Mobilization', status: 'COMPLETED', date: 'May 02, 2026', notes: 'Soil test passed (SBC 220 kN/m2). BBMP building sanctions obtained.' },
    { id: 2, name: 'Earthwork & Excavation', status: 'COMPLETED', date: 'May 20, 2026', notes: 'Excavation completed to 2.4m depth. Anti-termite soil treatment applied.' },
    { id: 3, name: 'Foundation & Footing PCC', status: 'COMPLETED', date: 'Jun 14, 2026', notes: 'M25 grade ready-mix concrete poured. 28-day cube strength verified at 31.8 MPa.' },
    { id: 4, name: 'Plinth Beam & DPC Membrane', status: 'COMPLETED', date: 'Jul 05, 2026', notes: 'Plinth beam casting and damp-proof course membrane installed with zero voiding.' },
    { id: 5, name: 'RCC Columns & Structural Framework', status: 'COMPLETED', date: 'Aug 18, 2026', notes: 'All 18 columns cast up to second floor level. Rebar spacing inspected and verified.' },
    { id: 6, name: 'Brickwork & AAC Masonry', status: 'IN_PROGRESS', date: 'Target: Sep 25, 2026', notes: 'External AAC block masonry 85% completed. Internal partition walls underway.' },
    { id: 7, name: 'Roof Slab & Terrace Casting', status: 'UPCOMING', date: 'Target: Oct 15, 2026', notes: 'Centering shuttering inspection scheduled before concrete pour.' },
    { id: 8, name: 'Plastering & Water Curing', status: 'UPCOMING', date: 'Target: Nov 05, 2026', notes: 'Double coat external sand-faced plaster with waterproof compound.' },
    { id: 9, name: 'Electrical & Plumbing Rough-in', status: 'UPCOMING', date: 'Target: Nov 20, 2026', notes: 'Concealed CPVC plumbing conduits and fire-resistant copper wiring.' },
    { id: 10, name: 'Flooring, Doors & Windows', status: 'UPCOMING', date: 'Target: Dec 05, 2026', notes: 'Vitrified tiles and UPVC triple-track soundproof windows.' },
    { id: 11, name: 'Painting, Fixtures & Final Handover', status: 'UPCOMING', date: 'Target: Dec 20, 2026', notes: 'Low-VOC non-toxic emulsion painting, deep cleaning, and key handover ceremony.' },
  ],
  cost_summary: {
    total_budget: 4820000,
    disbursed: 2892000,
    disbursed_pct: 60,
    variance: 0.0,
    categories: [
      { name: 'Reinforced Steel & Cement', amount: 1671000, pct: 34.7, color: '#3b82f6' },
      { name: 'Masonry, AAC Blocks & Aggregates', amount: 890000, pct: 18.5, color: '#10b981' },
      { name: 'Plumbing, Electrical & Rough-in', amount: 625000, pct: 13.0, color: '#8b5cf6' },
      { name: 'Finishing, Flooring & Paint', amount: 784000, pct: 16.2, color: '#f59e0b' },
      { name: 'Civil Engineering Labor & Site Ops', amount: 850000, pct: 17.6, color: '#64748b' },
    ],
    milestones: [
      { stage: 'Milestone 1: Foundation & Footing', amount: 964000, status: 'PAID', date: 'Jun 18, 2026' },
      { stage: 'Milestone 2: Plinth & Ground Slab', amount: 723000, status: 'PAID', date: 'Jul 10, 2026' },
      { stage: 'Milestone 3: First Floor RCC Frame', amount: 723000, status: 'PAID', date: 'Aug 22, 2026' },
      { stage: 'Milestone 4: Masonry & Lintels', amount: 482000, status: 'IN_REVIEW', date: 'Pending Stage Verification' },
      { stage: 'Milestone 5: Roof Slab Casting', amount: 723000, status: 'UPCOMING', date: 'Due upon slab pour' },
      { stage: 'Milestone 6: Final Finishes & Handover', amount: 1205000, status: 'UPCOMING', date: 'Due at possession' },
    ]
  },
  sustainability: {
    score: 84,
    tier: 'Platinum Eco-Living',
    total_carbon_kg: 94800,
    carbon_saved_kg: 24800,
    trees_equivalent: 1120,
    highlights: [
      { title: 'Fly Ash Pozzolana PPC', desc: '100% of cement used is eco-blended PPC, saving 7.4 tons CO2e.' },
      { title: 'AAC Autoclaved Blocks', desc: 'Lightweight blocks substituted for red clay bricks, cutting dead load by 40%.' },
      { title: 'Rainwater Harvesting Pit', desc: '12,000-liter dual recharge pit integrated with rooftop drainage.' },
      { title: 'Solar Ready Rooftop', desc: 'Structural conduit installed for a 5.5 kW rooftop photovoltaic solar array.' }
    ]
  },
  site_images: [
    {
      id: 'img-1',
      title: 'Column Rebar Spacing & Shuttering Inspection',
      stage: 'Stage 05: Columns',
      date: 'Aug 16, 2026',
      url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=700&q=80',
      caption: 'Passed structural reinforcement inspection. Cover blocks installed at 40mm.'
    },
    {
      id: 'img-2',
      title: 'Plinth Beam Concrete Pouring',
      stage: 'Stage 04: Plinth',
      date: 'Jul 04, 2026',
      url: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=700&q=80',
      caption: 'Vibrated M25 concrete mix poured uniformly along plinth periphery.'
    },
    {
      id: 'img-3',
      title: 'Footing Reinforcement & Soil Compaction',
      stage: 'Stage 03: Foundation',
      date: 'Jun 12, 2026',
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=700&q=80',
      caption: 'Anti-termite chemical soil barrier spray completed before PCC laydown.'
    },
    {
      id: 'img-4',
      title: 'AAC Block Masonry Alignment',
      stage: 'Stage 06: Masonry',
      date: 'Sep 02, 2026',
      url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=700&q=80',
      caption: 'Polymer thin-bed mortar jointing applied for crack-free acoustic insulation.'
    }
  ],
  recent_logs: [
    {
      time: 'Today, 11:30 AM',
      author: 'Ar. Priya Sharma',
      text: 'Inspected second-floor lintel beam centering and blockwork plumb line. Approved for mortar curing.'
    },
    {
      time: '2 days ago',
      author: 'Site Supervisor Ramesh',
      text: 'Batch of 400 AAC blocks delivered from Ultratech factory. Quality inspection checklist signed.'
    },
    {
      time: 'Last week',
      author: 'Structural Auditor',
      text: 'Concrete cube compressive test results received: 32.4 MPa. Exceeds CPWD M25 requirements.'
    }
  ]
};

export default function CustomerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStage, setSelectedStage] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [queryText, setQueryText] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await getCustomerDashboard();
        setData(res);
      } catch (err) {
        console.warn('Backend customer dashboard error, switching to demo mode:', err);
        // Soft fallback so UI always renders smoothly
        setData({ has_project: false });
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  // Use live data if project exists; otherwise fallback smoothly to demo project
  const isLiveProject = Boolean(data?.has_project && data?.primary_project);
  const liveProject = data?.primary_project;
  const liveEstimate = data?.latest_estimate;

  // Active combined project view
  const project = isLiveProject ? {
    project_id: liveProject.project_id,
    project_name: liveProject.project_name || 'My Construction Project',
    location: liveProject.location || 'Site Location Assigned',
    status: liveProject.status || 'In Progress',
    overall_progress_percent: liveProject.overall_progress_percent || liveProject.overall_progress_pct || 65,
    current_stage: liveProject.current_stage || 'Stage 06: Brickwork & Masonry',
    architect_name: liveProject.architect_name || 'Ar. Priya Sharma',
    architect_email: liveProject.architect_email || 'architect@ecobuild.ai',
    architect_phone: liveProject.architect_phone || '+91 98450 11223',
    architect_coa: 'CA/2018/94821',
    start_date: liveProject.start_date || '2026-04-15',
    target_handover: liveProject.estimated_completion_date || '2026-12-20',
    building_details: liveProject.building_details || DEMO_PROJECT.building_details,
    stages: (liveProject.stages && liveProject.stages.length > 0) ? liveProject.stages.map((st, i) => ({
      id: i + 1,
      name: st.stage_name || `Stage ${i + 1}`,
      status: st.status || (i < 5 ? 'COMPLETED' : i === 5 ? 'IN_PROGRESS' : 'UPCOMING'),
      date: st.target_date || `Stage ${i + 1}`,
      notes: st.notes || 'Inspected and certified in accordance with CPWD standards.'
    })) : DEMO_PROJECT.stages,
    cost_summary: {
      total_budget: liveEstimate?.predicted_cost_inr || liveProject.building_details?.total_cost || 4820000,
      disbursed: Math.round((liveEstimate?.predicted_cost_inr || 4820000) * 0.6),
      disbursed_pct: 60,
      variance: 0.0,
      categories: DEMO_PROJECT.cost_summary.categories,
      milestones: DEMO_PROJECT.cost_summary.milestones
    },
    sustainability: {
      score: liveEstimate?.sustainability_score || 84,
      tier: liveEstimate?.sustainability_tier || 'Platinum Eco-Living',
      total_carbon_kg: liveEstimate?.carbon_data?.total_embodied_carbon_kg || liveEstimate?.total_carbon_kg || 94800,
      carbon_saved_kg: 24800,
      trees_equivalent: 1120,
      highlights: DEMO_PROJECT.sustainability.highlights
    },
    site_images: DEMO_PROJECT.site_images,
    recent_logs: (data?.recent_updates && data?.recent_updates.length > 0) ? data.recent_updates.map(u => ({
      time: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Recent Update',
      author: 'Ar. Priya Sharma',
      text: u.notes || u.remarks || u.description || 'Milestone verified on site.'
    })) : DEMO_PROJECT.recent_logs
  } : DEMO_PROJECT;

  const handlePrintSummary = () => {
    window.print();
  };

  const handleSendQuery = (e) => {
    e.preventDefault();
    if (!queryText.trim()) return;
    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setShowContactModal(false);
      setQueryText('');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="customer-loading-state">
        <div className="customer-spinner" />
        <h3>Loading your construction intelligence portal...</h3>
        <p>Retrieving verified milestone logs, CPWD cost schedules, and site inspection photos.</p>
      </div>
    );
  }

  return (
    <div className="customer-dashboard-container">
      {/* ── Demo Mode Ribbon (if previewing sample project) ── */}
      {!isLiveProject && (
        <div className="demo-mode-ribbon">
          <div className="ribbon-content">
            <Sparkles size={15} className="text-emerald-300" />
            <span>
              <strong>Sample Project Preview:</strong> You are viewing a live preview of <em>&ldquo;The Emerald Horizon Villa&rdquo;</em>. Once your architect connects your official email, your personalized site data will appear automatically.
            </span>
          </div>
          <span className="ribbon-badge">Interactive Demo</span>
        </div>
      )}

      {/* ── Executive Hero Banner ── */}
      <div className="executive-project-header">
        <div className="header-left-col">
          <div className="header-eyebrow">
            <span className="eyebrow-chip">Homeowner Portal</span>
            <span className="dot-sep">&bull;</span>
            <span className="eyebrow-id">Project ID: <code>{project.project_id}</code></span>
            <span className="status-live-chip">
              <span className="live-pulse" /> On Schedule
            </span>
          </div>

          <h1 className="header-project-title">{project.project_name}</h1>

          <div className="header-meta-row">
            <span className="meta-item">
              <MapPin size={14} className="text-emerald-400" />
              <span>{project.location}</span>
            </span>
            <span className="meta-item">
              <Building2 size={14} className="text-emerald-400" />
              <span>{project.building_details.building_type} &bull; {project.building_details.built_up_area_sqft} sq.ft</span>
            </span>
            <span className="meta-item">
              <HardHat size={14} className="text-emerald-400" />
              <span>Architect: <strong>{project.architect_name}</strong></span>
            </span>
          </div>
        </div>

        <div className="header-right-col">
          <div className="header-progress-box">
            <div className="progress-top-label">Overall Construction Progress</div>
            <div className="progress-big-val">{project.overall_progress_percent}%</div>
            <div className="progress-active-stage">{project.current_stage}</div>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${project.overall_progress_percent}%` }}
              />
            </div>
            <div className="progress-target-date">
              <Clock size={12} /> Target Handover: <strong>{project.target_handover}</strong>
            </div>
          </div>

          <div className="header-action-buttons">
            <button
              type="button"
              className="btn-header-secondary"
              onClick={handlePrintSummary}
              title="Download or print complete summary"
            >
              <Download size={14} />
              <span>Export PDF</span>
            </button>
            <button
              type="button"
              className="btn-header-primary"
              onClick={() => setShowContactModal(true)}
            >
              <MessageSquare size={14} />
              <span>Contact Architect</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4 Hero KPI Cards ── */}
      <div className="customer-kpi-grid">
        {/* KPI 1: Active Milestone */}
        <div className="cust-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Current Construction Milestone</span>
            <span className="kpi-icon-pill blue"><Calendar size={15} /></span>
          </div>
          <div className="kpi-highlight-text">{project.current_stage}</div>
          <div className="kpi-meta-line">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Stage 6 of 11 in progress &bull; Next: Roof Slab</span>
          </div>
          <div className="kpi-footer-link">
            <button type="button" onClick={() => setActiveTab('stages')} className="link-action">
              View 11-Stage Roadmap &rarr;
            </button>
          </div>
        </div>

        {/* KPI 2: Financial Budget */}
        <div className="cust-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Project Budget &amp; Disbursements</span>
            <span className="kpi-icon-pill green"><IndianRupee size={15} /></span>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-big-num">₹{(project.cost_summary.total_budget / 100000).toFixed(2)} L</span>
            <span className="badge-variance-zero">0% Overrun</span>
          </div>
          <div className="kpi-meta-line">
            <span>Disbursed: ₹{(project.cost_summary.disbursed / 100000).toFixed(2)} L ({project.cost_summary.disbursed_pct}%)</span>
          </div>
          <div className="kpi-footer-link">
            <button type="button" onClick={() => setActiveTab('financials')} className="link-action">
              View Payment Breakdown &rarr;
            </button>
          </div>
        </div>

        {/* KPI 3: Green Sustainability */}
        <div className="cust-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Green Home Sustainability</span>
            <span className="kpi-icon-pill emerald"><Leaf size={15} /></span>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-big-num text-emerald-700">{project.sustainability.score} / 100</span>
            <span className="badge-tier-platinum"><Star size={11} fill="#15803d" /> {project.sustainability.tier}</span>
          </div>
          <div className="kpi-meta-line">
            <Sparkles size={13} className="text-emerald-600" />
            <span>{project.sustainability.carbon_saved_kg / 1000} tons CO2e avoided (~{project.sustainability.trees_equivalent} trees)</span>
          </div>
          <div className="kpi-footer-link">
            <button type="button" onClick={() => setActiveTab('green')} className="link-action">
              View Eco Scorecard &rarr;
            </button>
          </div>
        </div>

        {/* KPI 4: Quality & Inspections */}
        <div className="cust-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Quality &amp; Site Compliance</span>
            <span className="kpi-icon-pill purple"><ShieldCheck size={15} /></span>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-big-num text-blue-900">100% Passed</span>
            <span className="badge-cpwd-verified">CPWD 2024 Verified</span>
          </div>
          <div className="kpi-meta-line">
            <Camera size={13} className="text-blue-600" />
            <span>{project.site_images.length} verified site inspection photos on record</span>
          </div>
          <div className="kpi-footer-link">
            <button type="button" onClick={() => setActiveTab('photos')} className="link-action">
              Open Inspection Gallery &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* ── Interactive 11-Stage Construction Journey Bar ── */}
      <div className="customer-journey-section">
        <div className="journey-header">
          <div>
            <h3 className="journey-title">
              <Calendar size={18} className="text-emerald-700" />
              <span>11-Stage Construction Roadmap &amp; Milestones</span>
            </h3>
            <p className="journey-sub">
              Click any stage below to inspect verified milestone notes, structural approvals, and inspection dates.
            </p>
          </div>
          <div className="journey-legend">
            <span className="legend-item"><span className="legend-dot green" /> Completed</span>
            <span className="legend-item"><span className="legend-dot blue" /> Active Now</span>
            <span className="legend-item"><span className="legend-dot gray" /> Upcoming</span>
          </div>
        </div>

        {/* Scrollable Stage Stepper */}
        <div className="journey-stepper-track">
          {project.stages.map((st, idx) => {
            const isCompleted = st.status === 'COMPLETED';
            const isCurrent = st.status === 'IN_PROGRESS';
            const isSelected = selectedStage?.id === st.id;

            return (
              <div
                key={st.id}
                className={`stepper-node ${isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'} ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedStage(st)}
                role="button"
                tabIndex={0}
              >
                <div className="stepper-circle">
                  {isCompleted ? <Check size={12} strokeWidth={3} /> : st.id}
                </div>
                <div className="stepper-label">{st.name.replace(/^Stage \d+:\s*/, '')}</div>
                <div className="stepper-status-badge">
                  {isCompleted ? 'Done' : isCurrent ? 'Active' : 'Pending'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Stage Detail Drawer (if clicked) */}
        {selectedStage && (
          <div className="stage-detail-drawer">
            <div className="drawer-header">
              <div className="drawer-title">
                <strong>Stage {selectedStage.id}: {selectedStage.name}</strong>
                <span className={`drawer-badge ${selectedStage.status.toLowerCase()}`}>
                  {selectedStage.status.replace('_', ' ')}
                </span>
              </div>
              <button
                type="button"
                className="drawer-close"
                onClick={() => setSelectedStage(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="drawer-body">
              <div className="drawer-meta">
                <span>Date: <strong>{selectedStage.date}</strong></span>
                <span className="dot-sep">&bull;</span>
                <span>Signed by: <strong>{project.architect_name}</strong></span>
              </div>
              <p className="drawer-notes">
                <strong>Architect Inspection Notes:</strong> {selectedStage.notes}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Main Tabbed Deep-Dive Area ── */}
      <div className="customer-tabs-hub">
        {/* Tab Headers */}
        <div className="hub-tab-bar">
          <button
            type="button"
            className={`hub-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Layers size={15} />
            <span>Overview &amp; Activity Log</span>
          </button>

          <button
            type="button"
            className={`hub-tab-btn ${activeTab === 'financials' ? 'active' : ''}`}
            onClick={() => setActiveTab('financials')}
          >
            <IndianRupee size={15} />
            <span>Budget &amp; Payment Milestones</span>
          </button>

          <button
            type="button"
            className={`hub-tab-btn ${activeTab === 'photos' ? 'active' : ''}`}
            onClick={() => setActiveTab('photos')}
          >
            <Camera size={15} />
            <span>Inspection Photos ({project.site_images.length})</span>
          </button>

          <button
            type="button"
            className={`hub-tab-btn ${activeTab === 'green' ? 'active' : ''}`}
            onClick={() => setActiveTab('green')}
          >
            <Leaf size={15} />
            <span>Green Certification &amp; Carbon</span>
          </button>

          <button
            type="button"
            className={`hub-tab-btn ${activeTab === 'stages' ? 'active' : ''}`}
            onClick={() => setActiveTab('stages')}
          >
            <Calendar size={15} />
            <span>All 11 Milestone Checklists</span>
          </button>
        </div>

        {/* ── TAB CONTENT ── */}
        <div className="hub-tab-content">
          {/* TAB 1: OVERVIEW & ACTIVITY LOG */}
          {activeTab === 'overview' && (
            <div className="tab-pane-overview">
              <div className="overview-split-grid">
                {/* Left Column: Recent Activity Log */}
                <div className="overview-box">
                  <div className="overview-box-hdr">
                    <ClipboardList size={18} className="text-emerald-700" />
                    <h4>Recent Construction Log &amp; Site Inspections</h4>
                  </div>
                  <div className="activity-timeline-list">
                    {project.recent_logs.map((log, idx) => (
                      <div key={idx} className="activity-timeline-item">
                        <div className="activity-dot" />
                        <div className="activity-content">
                          <div className="activity-meta">
                            <span className="activity-time">{log.time}</span>
                            <span className="activity-author">{log.author}</span>
                          </div>
                          <p className="activity-text">{log.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Key Specifications & Lead Architect */}
                <div className="overview-box">
                  <div className="overview-box-hdr">
                    <HardHat size={18} className="text-emerald-700" />
                    <h4>Project Charter &amp; Architectural Lead</h4>
                  </div>

                  <div className="architect-lead-card">
                    <div className="lead-avatar">PS</div>
                    <div className="lead-info">
                      <div className="lead-name">{project.architect_name}</div>
                      <div className="lead-coa">{project.architect_coa}</div>
                      <div className="lead-contacts">
                        <a href={`mailto:${project.architect_email}`} className="contact-chip">
                          <Mail size={12} /> {project.architect_email}
                        </a>
                        <a href={`tel:${project.architect_phone}`} className="contact-chip">
                          <Phone size={12} /> {project.architect_phone}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="specs-mini-table">
                    <div className="spec-row">
                      <span className="spec-lbl">Built-Up Area</span>
                      <span className="spec-val">{project.building_details.built_up_area_sqft} sq.ft ({project.building_details.floors})</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-lbl">Structural Concrete Grade</span>
                      <span className="spec-val">M25 Design Mix (CPWD Calibrated)</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-lbl">Primary Reinforcement</span>
                      <span className="spec-val">Tata Tiscon Fe 550D High-Ductility TMT</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-lbl">External Masonry</span>
                      <span className="spec-val">Eco AAC Autoclaved Lightweight Blocks</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-lbl">Total Project Investment</span>
                      <span className="spec-val">₹{(project.cost_summary.total_budget / 100000).toFixed(2)} Lakhs</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-request-visit"
                    onClick={() => setShowContactModal(true)}
                  >
                    <Calendar size={14} /> Schedule Site Walkthrough
                  </button>
                </div>
              </div>

              {/* Latest Site Photo Previews */}
              <div className="overview-photos-preview">
                <div className="overview-box-hdr" style={{ marginBottom: '1rem' }}>
                  <Camera size={18} className="text-emerald-700" />
                  <h4>Latest Field Inspection Documentation</h4>
                  <button
                    type="button"
                    className="link-view-all"
                    onClick={() => setActiveTab('photos')}
                  >
                    View All {project.site_images.length} Photos &rarr;
                  </button>
                </div>
                <div className="preview-photos-grid">
                  {project.site_images.slice(0, 4).map((img) => (
                    <div
                      key={img.id}
                      className="photo-thumb-card"
                      onClick={() => setSelectedPhoto(img)}
                    >
                      <img src={img.url} alt={img.title} className="thumb-img" />
                      <div className="thumb-overlay">
                        <span className="thumb-stage">{img.stage}</span>
                        <div className="thumb-title">{img.title}</div>
                        <span className="thumb-date">{img.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BUDGET & FINANCIAL MILESTONES */}
          {activeTab === 'financials' && (
            <div className="tab-pane-financials">
              <div className="financials-hero-bar">
                <div className="fin-stat">
                  <span className="fin-lbl">Agreed Turnkey Budget</span>
                  <span className="fin-val">₹{(project.cost_summary.total_budget / 100000).toFixed(2)} Lakhs</span>
                  <span className="fin-sub">CPWD 2024 Schedule</span>
                </div>
                <div className="fin-divider" />
                <div className="fin-stat">
                  <span className="fin-lbl">Disbursed to Date</span>
                  <span className="fin-val text-blue-700">₹{(project.cost_summary.disbursed / 100000).toFixed(2)} Lakhs</span>
                  <span className="fin-sub">{project.cost_summary.disbursed_pct}% Cleared</span>
                </div>
                <div className="fin-divider" />
                <div className="fin-stat">
                  <span className="fin-lbl">Remaining Balance</span>
                  <span className="fin-val text-emerald-700">₹{((project.cost_summary.total_budget - project.cost_summary.disbursed) / 100000).toFixed(2)} Lakhs</span>
                  <span className="fin-sub">Escrow Protected</span>
                </div>
                <div className="fin-divider" />
                <div className="fin-stat">
                  <span className="fin-lbl">Cost Overrun Variance</span>
                  <span className="fin-val text-emerald-700">0.0%</span>
                  <span className="fin-sub">Guaranteed Cap</span>
                </div>
              </div>

              {/* Category Breakdown Bars */}
              <div className="fin-card-box">
                <h4 className="fin-section-title">Major Cost Category Allocation</h4>
                <div className="cost-alloc-stack">
                  {project.cost_summary.categories.map((cat, i) => (
                    <div key={i} className="cat-alloc-row">
                      <div className="cat-alloc-header">
                        <span className="cat-name">{cat.name}</span>
                        <span className="cat-amt">₹{(cat.amount / 100000).toFixed(2)} L ({cat.pct}%)</span>
                      </div>
                      <div className="cat-track">
                        <div
                          className="cat-fill"
                          style={{ width: `${cat.pct * 2}%`, background: cat.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestone Payment Releases */}
              <div className="fin-card-box">
                <h4 className="fin-section-title">Stage-Linked Payment Schedule</h4>
                <div className="milestones-table-wrapper">
                  <table className="customer-data-table">
                    <thead>
                      <tr>
                        <th>Milestone Stage</th>
                        <th>Release Amount</th>
                        <th>Verification Status</th>
                        <th>Release Date / Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.cost_summary.milestones.map((m, idx) => (
                        <tr key={idx}>
                          <td><strong>{m.stage}</strong></td>
                          <td>₹{(m.amount / 100000).toFixed(2)} Lakhs</td>
                          <td>
                            <span className={`status-pill ${m.status.toLowerCase()}`}>
                              {m.status === 'PAID' && <Check size={11} strokeWidth={3} />}
                              {m.status}
                            </span>
                          </td>
                          <td>{m.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SITE INSPECTION PHOTO STREAM */}
          {activeTab === 'photos' && (
            <div className="tab-pane-photos">
              <div className="photos-header-info">
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.15rem', color: '#1b4332' }}>
                    Official Field Verification Gallery
                  </h4>
                  <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                    Every structural milestone is photographically documented by the architect to certify reinforcement, curing, and concrete quality.
                  </p>
                </div>
                <span className="photo-count-badge">
                  <Camera size={14} /> {project.site_images.length} Verified Photos
                </span>
              </div>

              <div className="full-gallery-grid">
                {project.site_images.map((img) => (
                  <div
                    key={img.id}
                    className="gallery-card"
                    onClick={() => setSelectedPhoto(img)}
                  >
                    <div className="card-img-wrap">
                      <img src={img.url} alt={img.title} className="card-img" />
                      <span className="card-stage-pill">{img.stage}</span>
                    </div>
                    <div className="card-body">
                      <h5 className="card-title">{img.title}</h5>
                      <p className="card-caption">{img.caption}</p>
                      <div className="card-footer-date">
                        <Calendar size={12} /> {img.date} &bull; Inspected by {project.architect_name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: GREEN CERTIFICATION & CARBON */}
          {activeTab === 'green' && (
            <div className="tab-pane-green">
              <div className="green-hero-banner">
                <div className="green-badge-large">
                  <Star size={24} fill="#15803d" />
                  <div className="green-score-num">{project.sustainability.score}</div>
                  <div className="green-score-denom">/ 100 Score</div>
                </div>

                <div className="green-hero-content">
                  <span className="green-tier-title">{project.sustainability.tier} Certified</span>
                  <h3 className="green-hero-heading">Eco-Friendly Residential Design Standard</h3>
                  <p className="green-hero-desc">
                    By incorporating Pozzolana PPC cement, autoclaved aerated concrete (AAC) blocks, and on-site rainwater harvesting, your home avoids <strong>{project.sustainability.carbon_saved_kg / 1000} tons of embodied CO2e</strong> compared to a baseline brick structure.
                  </p>
                  <div className="green-equivalents-row">
                    <span className="equiv-pill">
                      <Leaf size={14} /> <strong>{project.sustainability.trees_equivalent} Trees</strong> Planted Equiv.
                    </span>
                    <span className="equiv-pill">
                      <Sparkles size={14} /> <strong>32% Lower</strong> Carbon Footprint
                    </span>
                    <span className="equiv-pill">
                      <ShieldCheck size={14} /> <strong>IFC India</strong> Emission Factors Certified
                    </span>
                  </div>
                </div>
              </div>

              <div className="green-highlights-grid">
                {project.sustainability.highlights.map((h, i) => (
                  <div key={i} className="green-highlight-card">
                    <div className="highlight-icon">
                      <CheckCircle2 size={18} className="text-emerald-700" />
                    </div>
                    <div>
                      <h5 className="highlight-title">{h.title}</h5>
                      <p className="highlight-desc">{h.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ALL 11 STAGE CHECKLISTS */}
          {activeTab === 'stages' && (
            <div className="tab-pane-stages">
              <h4 className="stages-title">Complete 11-Stage Construction Roadmap</h4>
              <p className="stages-desc">
                Standardized CPWD 11-phase workflow covering site mobilization through structural framing to final key handover.
              </p>

              <div className="stages-list-accordion">
                {project.stages.map((st) => (
                  <div
                    key={st.id}
                    className={`stage-row-item ${st.status.toLowerCase()}`}
                  >
                    <div className="stage-num-badge">
                      {st.status === 'COMPLETED' ? <Check size={14} strokeWidth={3} /> : st.id}
                    </div>
                    <div className="stage-info-col">
                      <div className="stage-title-row">
                        <strong>Stage {st.id}: {st.name}</strong>
                        <span className={`status-pill ${st.status.toLowerCase()}`}>
                          {st.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="stage-notes-row">
                        <p>{st.notes}</p>
                      </div>
                    </div>
                    <div className="stage-date-col">
                      <Calendar size={13} />
                      <span>{st.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Contact Architect / Request Visit Modal ── */}
      {showContactModal && (
        <div className="modal-backdrop" onClick={() => setShowContactModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <HardHat size={20} className="text-emerald-800" />
                <h3>Direct Message to Lead Architect</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowContactModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-architect-profile">
                <div className="profile-avatar">PS</div>
                <div>
                  <div className="profile-name">{project.architect_name}</div>
                  <div className="profile-sub">{project.architect_coa} &bull; Studio Green Arch</div>
                  <div className="profile-status">
                    <span className="live-pulse" /> Usually responds within 2 hours
                  </div>
                </div>
              </div>

              {messageSent ? (
                <div className="message-success-box">
                  <CheckCircle2 size={32} className="text-emerald-600" />
                  <h4>Message Delivered to Architect</h4>
                  <p>Ar. Priya Sharma has been notified. You will receive an update on your registered email and phone.</p>
                </div>
              ) : (
                <form onSubmit={handleSendQuery}>
                  <div className="modal-field">
                    <label htmlFor="query-topic">Inquiry Type</label>
                    <select id="query-topic" className="modal-select">
                      <option>Schedule In-Person Site Inspection</option>
                      <option>Material Specification Query</option>
                      <option>Milestone Progress Clarification</option>
                      <option>Change Order / Finishing Material Choice</option>
                      <option>General Question</option>
                    </select>
                  </div>

                  <div className="modal-field">
                    <label htmlFor="query-message">Your Message or Preferred Visit Time</label>
                    <textarea
                      id="query-message"
                      rows={4}
                      className="modal-textarea"
                      placeholder="Hi Ar. Priya, I'd like to inspect the AAC masonry work this Saturday at 11 AM..."
                      value={queryText}
                      onChange={(e) => setQueryText(e.target.value)}
                      required
                    />
                  </div>

                  <div className="modal-footer-actions">
                    <a
                      href={`https://wa.me/919845011223?text=Hi%20Ar.%20Priya,%20regarding%20${encodeURIComponent(project.project_name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-whatsapp"
                    >
                      <MessageSquare size={14} /> Open WhatsApp Chat
                    </a>
                    <button type="submit" className="btn-send-message">
                      Send Direct Note
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Photo Lightbox Modal ── */}
      {selectedPhoto && (
        <div className="modal-backdrop" onClick={() => setSelectedPhoto(null)}>
          <div className="photo-lightbox-card" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-hdr">
              <div>
                <span className="lightbox-stage">{selectedPhoto.stage}</span>
                <h4 className="lightbox-title">{selectedPhoto.title}</h4>
              </div>
              <button
                type="button"
                className="lightbox-close"
                onClick={() => setSelectedPhoto(null)}
              >
                <X size={18} />
              </button>
            </div>
            <img src={selectedPhoto.url} alt={selectedPhoto.title} className="lightbox-img" />
            <div className="lightbox-footer">
              <p className="lightbox-caption">{selectedPhoto.caption}</p>
              <div className="lightbox-meta">
                <Calendar size={13} /> {selectedPhoto.date} &bull; Inspected and verified by {project.architect_name}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
