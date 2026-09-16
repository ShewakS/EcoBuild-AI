import React, { useState, useEffect } from 'react';
import { getCustomerDashboard, getCustomerImages, BASE_URL } from '../../Assets/api';
import { AlertTriangle, Camera, Calendar } from 'lucide-react';

export default function CustomerPhotos() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImg, setSelectedImg] = useState(null);

  useEffect(() => {
    async function loadPhotos() {
      try {
        setLoading(true);
        const dash = await getCustomerDashboard();
        if (dash?.primary_project?.project_id) {
          const res = await getCustomerImages(dash.primary_project.project_id);
          setImages(res || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load site inspection photos');
      } finally {
        setLoading(false);
      }
    }
    loadPhotos();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading site inspection photos...</div>;
  }

  if (error) {
    return <div className="login-alert-error"><AlertTriangle size={16} /> {error}</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1b4332' }}>Site Inspection & Progress Photos</h2>
        <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
          Official photo documentation uploaded directly by your architect during regular site visits
        </p>
      </div>

      {images.length === 0 ? (
        <div className="customer-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <Camera size={48} className="text-emerald-700" />
          </div>
          <h3 style={{ color: '#1b4332', margin: '0 0 0.5rem 0' }}>No Site Photos Uploaded Yet</h3>
          <p style={{ color: '#64748b', margin: 0 }}>
            Your architect will upload photos as work advances through key structural milestones.
          </p>
        </div>
      ) : (
        <div className="customer-gallery-grid">
          {images.map((img, idx) => {
            const rawUrl = img.image_url || img.url || '';
            const fullUrl = rawUrl.startsWith('http') ? rawUrl : `${BASE_URL}${rawUrl}`;

            return (
              <div
                key={img.image_id || idx}
                className="customer-photo-card"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedImg({ url: fullUrl, ...img })}
              >
                <img
                  src={fullUrl}
                  alt={img.caption || 'Site inspection'}
                  className="customer-photo-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=500&auto=format&fit=crop&q=60';
                  }}
                />
                <div className="customer-photo-info">
                  <div className="customer-photo-stage">
                    {img.stage_name ? img.stage_name : `Stage ${img.stage_id || 'Update'}`}
                  </div>
                  <p className="customer-photo-caption">
                    {img.caption || img.notes || img.remark || 'Site progress documentation'}
                  </p>
                  <div className="customer-photo-date flex items-center gap-1">
                    <Calendar size={12} /> {img.uploaded_at ? new Date(img.uploaded_at).toLocaleDateString() : 'Recent'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox / Modal for Expanded Photo */}
      {selectedImg && (
        <div className="admin-modal-overlay" onClick={() => setSelectedImg(null)}>
          <div
            className="admin-modal"
            style={{ maxWidth: '720px', padding: '1.25rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <strong style={{ color: '#1b4332' }}>
                {selectedImg.stage_name ? selectedImg.stage_name : `Stage ${selectedImg.stage_id || 'Inspection'}`}
              </strong>
              <button className="admin-modal-close" onClick={() => setSelectedImg(null)}>×</button>
            </div>
            <img
              src={selectedImg.url}
              alt="Expanded view"
              style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: '8px', background: '#000' }}
            />
            <p style={{ marginTop: '0.75rem', fontSize: '0.92rem', color: '#334155' }}>
              {selectedImg.caption || selectedImg.notes || selectedImg.remark}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
