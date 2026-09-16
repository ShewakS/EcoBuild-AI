import React, { useState, useEffect } from 'react';
import { getCustomerDashboard } from '../../Assets/api';
import { AlertTriangle, Building2, Ruler, FileText } from 'lucide-react';

export default function CustomerProject() {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProject() {
      try {
        setLoading(true);
        const res = await getCustomerDashboard();
        if (res && res.primary_project) {
          setProject(res.primary_project);
        }
      } catch (err) {
        setError(err.message || 'Failed to load project details');
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading project specifications...</div>;
  }

  if (error || !project) {
    return (
      <div className="login-alert-error">
        <AlertTriangle size={16} /> {error || 'No project details found.'}
      </div>
    );
  }

  const b = project.building_details || {};

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1b4332' }}>Building Specifications & Project Charter</h2>
        <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
          Detailed architectural parameters, spatial measurements, and timeline agreements
        </p>
      </div>

      <div className="customer-card">
        <h3 className="customer-card-title flex items-center gap-1.5"><Building2 size={18} className="text-emerald-800" /> General Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Project Title</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1b4332' }}>{project.project_name}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Project ID</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0369a1' }}><code>{project.project_id}</code></div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Location</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{project.location}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Lead Architect</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{project.architect_name || 'Design Lead'}</div>
          </div>
        </div>
      </div>

      <div className="customer-card">
        <h3 className="customer-card-title flex items-center gap-1.5"><Ruler size={18} className="text-emerald-800" /> Architectural Dimensions & Spatial Specs</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>BUILDING TYPE</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1b4332' }}>{b.building_type || 'Residential Villa'}</div>
          </div>

          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>TOTAL BUILT-UP AREA</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1b4332' }}>
              {b.total_builtup_area_sqft ? `${b.total_builtup_area_sqft} sq ft` : 'Custom'}
            </div>
          </div>

          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>NUMBER OF FLOORS</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1b4332' }}>G + {b.number_of_floors || 1}</div>
          </div>

          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>CONSTRUCTION STATUS</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16a34a' }}>{project.status || 'Active'}</div>
          </div>
        </div>

        {b.room_breakdown && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1b4332', marginBottom: '0.75rem' }}>
              Room Specifications
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {Object.entries(b.room_breakdown).map(([room, count]) => (
                <span key={room} style={{ padding: '4px 12px', background: '#e8f5e9', color: '#1b4332', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
                  {room}: {count}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {project.notes && (
        <div className="customer-card">
          <h3 className="customer-card-title flex items-center gap-1.5"><FileText size={18} className="text-emerald-800" /> Project Notes & Scope</h3>
          <p style={{ margin: 0, color: '#334155', lineHeight: '1.6' }}>{project.notes}</p>
        </div>
      )}
    </div>
  );
}
