import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Cpu,
  Leaf,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Scale,
  Award
} from 'lucide-react';
import './AboutUs.css';

export default function AboutUs() {
  return (
    <div className="about-page">
      {/* ── Hero Section ── */}
      <section className="about-hero relative py-20 sm:py-28 overflow-hidden text-white" style={{ background: 'var(--global-gradient-hero)' }}>
        <div className="blueprint-grid absolute inset-0 pointer-events-none opacity-20" />
        <div className="section-container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20 mb-6">
            <Building2 size={15} />
            <span>Built for Indian Engineering Standards</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Bridging Architectural Vision with <span className="text-[#90B5F0]">AI Precision</span> &amp; <span className="text-[#5AB281]">Decarbonization</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mt-6 leading-relaxed">
            EcoBuild AI is India’s specialized platform for construction cost prediction, embodied carbon auditing, CPWD material waste control, and 11-stage project transparency.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link to="/get-started" className="btn-primary" style={{ background: 'var(--blueprint)', borderColor: 'var(--blueprint)' }}>
              View Access Plans <ArrowRight size={15} />
            </Link>
            <Link to="/contact" className="btn-secondary" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}>
              Contact Engineering Team
            </Link>
          </div>
        </div>
      </section>

      {/* ── Executive Summary Grid ── */}
      <section className="py-16 bg-white border-y border-[#E7E9EC]">
        <div className="section-container">
          <div className="text-center mb-12">
            <span className="section-label">Core Mission</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#16213E]">
              Why We Built EcoBuild AI
            </h2>
            <p className="text-sm text-[#6B7898] max-w-xl mx-auto mt-2">
              Addressing the three critical challenges of modern Indian construction: cost overruns, hidden carbon emissions, and job-site material waste.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-6 flex flex-col items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#EEF3FB] text-[#2B5CB0] flex items-center justify-center">
                <Cpu size={22} />
              </div>
              <h3 className="text-lg font-bold text-[#16213E]">95%+ Estimation Accuracy</h3>
              <p className="text-xs text-[#6B7898] leading-relaxed">
                Traditional estimation relies on static rule-of-thumb tables. Our XGBoost supervised ML model computes material quantities and cost breakdowns instantly using localized project parameters.
              </p>
            </div>

            <div className="card p-6 flex flex-col items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#EBF5EF] text-[#3E8E5E] flex items-center justify-center">
                <Leaf size={22} />
              </div>
              <h3 className="text-lg font-bold text-[#16213E]">Embodied Carbon Auditing</h3>
              <p className="text-xs text-[#6B7898] leading-relaxed">
                Calculates total lifecycle emissions ($tCO_2e$) and carbon intensity ($kg CO_2e / sqft$) based on authentic IFC Indian emission factors to qualify projects for green certifications.
              </p>
            </div>

            <div className="card p-6 flex flex-col items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#FAF0EB] text-[#C4622D] flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-lg font-bold text-[#16213E]">11-Stage Site Visibility</h3>
              <p className="text-xs text-[#6B7898] leading-relaxed">
                Connects Architects and Homeowners through a structured 11-stage progress tracker, complete with milestone status indicators and site inspection photo uploads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Indian Standards & Regulatory Compliance Grid ── */}
      <section className="py-16 bg-[#FAFBFC]">
        <div className="section-container">
          <div className="text-center mb-12">
            <span className="section-label">Regulatory Benchmarks</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#16213E]">
              Grounding AI in Authentic Standards
            </h2>
            <p className="text-sm text-[#6B7898] max-w-xl mx-auto mt-2">
              Unlike generic overseas tools, EcoBuild AI is calibrated strictly to Indian public works and environmental frameworks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-5 border-l-4 border-l-[#2B5CB0]">
              <div className="flex items-center gap-2 mb-2">
                <Scale size={18} className="text-[#2B5CB0]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#2B5CB0]">CPWD 2022 Data Book</span>
              </div>
              <h4 className="text-sm font-bold text-[#16213E]">Schedule of Rates</h4>
              <p className="text-xs text-[#6B7898] mt-2 leading-relaxed">
                Standard labor ratios, cement-to-aggregate consumption constants, and itemized material rates.
              </p>
            </div>

            <div className="card p-5 border-l-4 border-l-[#3E8E5E]">
              <div className="flex items-center gap-2 mb-2">
                <Leaf size={18} className="text-[#3E8E5E]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#3E8E5E]">IFC Indian Datasets</span>
              </div>
              <h4 className="text-sm font-bold text-[#16213E]">Embodied Emission Factors</h4>
              <p className="text-xs text-[#6B7898] mt-2 leading-relaxed">
                Global Warming Potential (GWP) factors for Indian OPC/PPC cement, TMT steel rebars, AAC blocks, and aggregates.
              </p>
            </div>

            <div className="card p-5 border-l-4 border-l-[#C4622D]">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={18} className="text-[#C4622D]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#C4622D]">BMTPC Benchmarks</span>
              </div>
              <h4 className="text-sm font-bold text-[#16213E]">C&amp;D Waste Standards</h4>
              <p className="text-xs text-[#6B7898] mt-2 leading-relaxed">
                Acceptable wastage thresholds (3–8%) for masonry, concrete, reinforcement steel, and mortar lines.
              </p>
            </div>

            <div className="card p-5 border-l-4 border-l-[#16213E]">
              <div className="flex items-center gap-2 mb-2">
                <Award size={18} className="text-[#16213E]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#16213E]">NICMAR Framework</span>
              </div>
              <h4 className="text-sm font-bold text-[#16213E]">Safe Material Reuse</h4>
              <p className="text-xs text-[#6B7898] mt-2 leading-relaxed">
                Structural &amp; non-structural reuse guidelines for excavated topsoil, crushed concrete aggregate, and brick bats.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── User Role Workflows ── */}
      <section className="py-16 bg-white border-t border-[#E7E9EC]">
        <div className="section-container">
          <div className="text-center mb-12">
            <span className="section-label">Platform Experience</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#16213E]">
              Role-Tailored Workspaces
            </h2>
            <p className="text-sm text-[#6B7898] max-w-xl mx-auto mt-2">
              Specific, clean interfaces designed for each stakeholder in the construction lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-6 bg-[#FAFBFC]">
              <span className="badge badge-blueprint mb-4">Architect &amp; Engineer</span>
              <h3 className="text-base font-bold text-[#16213E] mb-2">Architect Workspace</h3>
              <ul className="space-y-2 text-xs text-[#6B7898] mt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-[#2B5CB0] mt-0.5 flex-shrink-0" />
                  Multi-step cost &amp; material quantity estimation form
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-[#2B5CB0] mt-0.5 flex-shrink-0" />
                  Eco-friendly material substitution recommendation engine
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-[#2B5CB0] mt-0.5 flex-shrink-0" />
                  One-click WeasyPrint PDF report generation
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-[#2B5CB0] mt-0.5 flex-shrink-0" />
                  Customer project assignment &amp; 11-stage progress management
                </li>
              </ul>
            </div>

            <div className="card p-6 bg-[#FAFBFC]">
              <span className="badge badge-alert mb-4">Platform Administrator</span>
              <h3 className="text-base font-bold text-[#16213E] mb-2">Super Admin Console</h3>
              <ul className="space-y-2 text-xs text-[#6B7898] mt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-[#C4622D] mt-0.5 flex-shrink-0" />
                  Architect account provisioning with secure temp password creation
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-[#C4622D] mt-0.5 flex-shrink-0" />
                  Subscription plan limits management (Basic, Pro, Enterprise)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-[#C4622D] mt-0.5 flex-shrink-0" />
                  System-wide prediction logs &amp; usage monitoring
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-[#C4622D] mt-0.5 flex-shrink-0" />
                  Account status management (Active, Suspended, Inactive)
                </li>
              </ul>
            </div>

            <div className="card p-6 bg-[#FAFBFC]">
              <span className="badge badge-eco mb-4">Homeowner &amp; Client</span>
              <h3 className="text-base font-bold text-[#16213E] mb-2">Customer Client Portal</h3>
              <ul className="space-y-2 text-xs text-[#6B7898] mt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-[#3E8E5E] mt-0.5 flex-shrink-0" />
                  Read-only view of project cost breakdowns &amp; materials
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-[#3E8E5E] mt-0.5 flex-shrink-0" />
                  Real-time 11-stage construction progress tracker
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-[#3E8E5E] mt-0.5 flex-shrink-0" />
                  Inspection gallery with uploaded site photos
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-[#3E8E5E] mt-0.5 flex-shrink-0" />
                  Sustainability score ring and green feature highlights
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Call to Action ── */}
      <section className="py-16 bg-[#16213E] text-white">
        <div className="section-container text-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Ready to Transform Your Architectural Workflow?
          </h2>
          <p className="text-sm text-[#A1ABCA] max-w-xl mx-auto mt-3">
            Get started with EcoBuild AI today. Experience automated estimations, instant carbon auditing, and effortless customer reporting.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link to="/contact" className="btn-primary" style={{ background: '#2B5CB0' }}>
              Request Access <ArrowRight size={15} />
            </Link>
            <Link to="/login" className="btn-secondary" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}>
              Sign In to Platform
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
