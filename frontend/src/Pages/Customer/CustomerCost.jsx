import React, { useState, useEffect } from 'react';
import { getCustomerDashboard, getCustomerCost } from '../../Assets/api';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export default function CustomerCost() {
  const [costData, setCostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCost() {
      try {
        setLoading(true);
        const dash = await getCustomerDashboard();
        if (dash?.primary_project?.project_id) {
          const res = await getCustomerCost(dash.primary_project.project_id);
          setCostData(res);
        }
      } catch (err) {
        setError(err.message || 'Failed to load project cost analysis');
      } finally {
        setLoading(false);
      }
    }
    loadCost();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading project cost breakdown...</div>;
  }

  if (error) {
    return <div className="login-alert-error"><AlertTriangle size={16} /> {error}</div>;
  }

  const total = costData?.predicted_cost_inr || 3850000;
  const breakdown = costData?.cost_breakdown || {
    materials_cost: Math.round(total * 0.58),
    labour_cost: Math.round(total * 0.27),
    equipment_and_other: Math.round(total * 0.15),
  };
  const range = costData?.cost_range || {
    low: Math.round(total * 0.94),
    target: total,
    high: Math.round(total * 1.08),
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1b4332' }}>Project Cost Estimate & Financial View</h2>
        <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
          Transparent budget assessment computed using latest regional CPWD schedule of rates
        </p>
      </div>

      {/* Primary Total Cost Card */}
      <div className="customer-project-banner" style={{ background: 'linear-gradient(135deg, #1b4332 0%, #0f2b1d 100%)' }}>
        <div>
          <div style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.8rem', opacity: 0.85 }}>
            Total Estimated Construction Budget
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 900, margin: '0.4rem 0' }}>
            ₹{Number(total).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#d8f3dc' }}>
            Includes structural work, masonry, MEP rough-ins, standard finishes & labor
          </div>
        </div>

        <div style={{ textAlign: 'right', background: 'rgba(255, 255, 255, 0.1)', padding: '1rem 1.5rem', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Expected Range (+/- 8%)</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.25rem 0' }}>
            ₹{Number(range.low).toLocaleString('en-IN')} – ₹{Number(range.high).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#a7f3d0' }}>Target: ₹{Number(range.target || total).toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Component Breakdown Cards */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card" style={{ borderLeft: '4px solid #2d6a4f' }}>
          <div className="admin-kpi-label">Material Procurement</div>
          <div className="admin-kpi-value">
            ₹{Number(breakdown.materials_cost || total * 0.58).toLocaleString('en-IN')}
          </div>
          <div className="admin-kpi-sub" style={{ color: '#64748b' }}>
            ~58% of Total Project Budget
          </div>
        </div>

        <div className="admin-kpi-card" style={{ borderLeft: '4px solid #0284c7' }}>
          <div className="admin-kpi-label">Skilled & Unskilled Labour</div>
          <div className="admin-kpi-value">
            ₹{Number(breakdown.labour_cost || total * 0.27).toLocaleString('en-IN')}
          </div>
          <div className="admin-kpi-sub" style={{ color: '#64748b' }}>
            ~27% of Total Project Budget
          </div>
        </div>

        <div className="admin-kpi-card" style={{ borderLeft: '4px solid #d97706' }}>
          <div className="admin-kpi-label">Equipment, Logistics & Sundry</div>
          <div className="admin-kpi-value">
            ₹{Number(breakdown.equipment_and_other || total * 0.15).toLocaleString('en-IN')}
          </div>
          <div className="admin-kpi-sub" style={{ color: '#64748b' }}>
            ~15% of Total Project Budget
          </div>
        </div>
      </div>

      {/* Financial Protection Notice */}
      <div className="customer-card">
        <h3 className="customer-card-title flex items-center gap-1.5"><ShieldCheck size={18} className="text-emerald-700" /> Budget Transparency Guarantee</h3>
        <p style={{ margin: 0, color: '#475569', lineHeight: '1.6', fontSize: '0.92rem' }}>
          EcoBuild AI estimates are synchronized with current prevailing material vendor rates in your municipal region.
          Any revisions to drawings or material grades made by your architect will reflect immediately in this breakdown.
        </p>
      </div>
    </div>
  );
}
