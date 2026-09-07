import React, { useState, useEffect } from 'react';
import { getCustomerDashboard, getCustomerProgress } from '../../Assets/api';

export default function CustomerProgress() {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProgress() {
      try {
        setLoading(true);
        const dash = await getCustomerDashboard();
        if (dash?.primary_project?.project_id) {
          const res = await getCustomerProgress(dash.primary_project.project_id);
          setProgressData(res);
        }
      } catch (err) {
        setError(err.message || 'Failed to load construction stages');
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading construction stages & timeline...</div>;
  }

  if (error) {
    return <div className="login-alert-error"><span>⚠</span> {error}</div>;
  }

  const stages = progressData?.stages || [];
  const updates = progressData?.updates || [];
  const overallPct = progressData?.overall_progress_pct || 0;
  const currentStage = progressData?.current_stage || 'Planning';

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1b4332' }}>Construction Stages & Milestone Progress</h2>
        <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
          Live chronological tracking across all 11 standard structural and finishing stages
        </p>
      </div>

      {/* Progress Header Card */}
      <div className="customer-project-banner">
        <div style={{ flex: 1 }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.8rem', opacity: 0.9 }}>
            Current Construction Milestone
          </div>
          <h2 style={{ margin: '0.4rem 0', fontSize: '1.8rem' }}>{currentStage}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ flex: 1, height: '10px', background: 'rgba(255, 255, 255, 0.25)', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: `${overallPct}%`, height: '100%', background: '#a7f3d0' }} />
            </div>
            <span style={{ fontSize: '1.3rem', fontWeight: 900 }}>{overallPct}% Completed</span>
          </div>
        </div>
      </div>

      {/* 11 Stages Timeline */}
      <div className="customer-card">
        <h3 className="customer-card-title"><span>🏗️</span> 11 Standard Construction Milestones</h3>
        <div className="stage-timeline-list">
          {stages.map((stage) => {
            const isDone = stage.status === 'completed' || stage.progress_percent >= 100;
            const isInProgress = stage.status === 'in_progress' && !isDone;
            const statusClass = isDone ? 'completed' : isInProgress ? 'in_progress' : 'pending';

            return (
              <div key={stage.stage_id} className={`stage-timeline-item ${statusClass}`}>
                <div className="stage-number-icon">
                  {isDone ? '✓' : stage.stage_id}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '1rem', color: '#1b4332' }}>
                      {stage.stage_name}
                    </strong>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      background: isDone ? '#dcfce7' : isInProgress ? '#dbeafe' : '#f1f5f9',
                      color: isDone ? '#166534' : isInProgress ? '#1e40af' : '#64748b'
                    }}>
                      {isDone ? 'Completed' : isInProgress ? `${stage.progress_percent}% In Progress` : 'Upcoming'}
                    </span>
                  </div>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.86rem', color: '#475569' }}>
                    {stage.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inspection Updates Log */}
      {updates.length > 0 && (
        <div className="customer-card">
          <h3 className="customer-card-title"><span>📝</span> Official Site Inspection Logs</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {updates.map((u, i) => (
              <div key={i} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.35rem' }}>
                  <strong>Stage Milestone {u.stage_id}</strong>
                  <span>{u.created_at ? new Date(u.created_at).toLocaleString() : 'Recent'}</span>
                </div>
                <div style={{ fontSize: '0.92rem', color: '#1e293b' }}>
                  {u.notes || u.description || 'Milestone verified on site.'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
