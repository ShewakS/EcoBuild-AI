import React, { useState, useEffect } from 'react';
import { getCustomerDashboard, getCustomerMaterials } from '../../Assets/api';
import { AlertTriangle, Boxes, Leaf } from 'lucide-react';

export default function CustomerMaterials() {
  const [materials, setMaterials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const dash = await getCustomerDashboard();
        if (dash?.primary_project?.project_id) {
          const res = await getCustomerMaterials(dash.primary_project.project_id);
          setMaterials(res.materials || {});
        }
      } catch (err) {
        setError(err.message || 'Failed to load material requirements');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading project materials...</div>;
  }

  if (error) {
    return <div className="login-alert-error"><AlertTriangle size={16} /> {error}</div>;
  }

  const items = materials && Object.keys(materials).length > 0 ? Object.entries(materials) : [];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1b4332' }}>Material Quantity Specifications</h2>
        <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
          Exact material quantities estimated by your architect based on your architectural drawings
        </p>
      </div>

      <div className="customer-card">
        <h3 className="customer-card-title flex items-center gap-1.5"><Boxes size={18} className="text-emerald-800" /> Structural & Masonry Material Estimates</h3>
        
        {items.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
            Material calculation is currently in progress by your architect.
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Material Name</th>
                  <th>Estimated Quantity</th>
                  <th>Standard Unit</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {items.map(([mat, qty]) => {
                  let unit = 'Units';
                  let category = 'Structural';
                  const lower = mat.toLowerCase();
                  if (lower.includes('cement')) { unit = 'Bags (50 kg)'; category = 'Binding Agent'; }
                  else if (lower.includes('steel') || lower.includes('rebar')) { unit = 'Tonnes / kg'; category = 'Reinforcement'; }
                  else if (lower.includes('brick') || lower.includes('block')) { unit = 'Pieces / Blocks'; category = 'Masonry'; }
                  else if (lower.includes('sand')) { unit = 'Cubic Feet (cu.ft)'; category = 'Fine Aggregate'; }
                  else if (lower.includes('aggregate')) { unit = 'Cubic Feet (cu.ft)'; category = 'Coarse Aggregate'; }
                  else if (lower.includes('paint')) { unit = 'Litres'; category = 'Finishes'; }
                  else if (lower.includes('tile')) { unit = 'Square Feet'; category = 'Flooring'; }

                  const displayQty = typeof qty === 'number' ? qty.toLocaleString('en-IN') : qty;

                  return (
                    <tr key={mat}>
                      <td>
                        <strong>{mat.replace(/_/g, ' ').toUpperCase()}</strong>
                      </td>
                      <td>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1b4332' }}>
                          {displayQty}
                        </span>
                      </td>
                      <td>{unit}</td>
                      <td>
                        <span style={{ background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                          {category}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="customer-card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#166534', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Leaf size={16} /> Sustainable Material Assurance
        </h4>
        <p style={{ margin: 0, fontSize: '0.88rem', color: '#166534', lineHeight: '1.5' }}>
          All quantities listed above are continuously optimized by EcoBuild AI algorithms to eliminate construction site over-ordering and adhere to Indian Green Building Council (IGBC) low-carbon guidelines.
        </p>
      </div>
    </div>
  );
}
