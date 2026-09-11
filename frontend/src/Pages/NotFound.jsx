import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';

export default function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const handleBack = () => {
    if (!isAuthenticated) {
      navigate('/', { replace: true });
      return;
    }
    switch (role) {
      case 'SUPER_ADMIN': navigate('/admin/dashboard', { replace: true }); break;
      case 'CUSTOMER':    navigate('/customer/dashboard', { replace: true }); break;
      default:            navigate('/projects', { replace: true }); break;
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      style={{ background: 'var(--paper)' }}
    >
      {/* Blueprint grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(var(--concrete) 1px, transparent 1px), linear-gradient(90deg, var(--concrete) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.4,
        }}
        aria-hidden="true"
      />

      <div
        className="relative z-10 text-center"
        style={{ padding: '3rem 2rem', maxWidth: 480 }}
      >
        {/* Drawing-style 404 */}
        <svg
          width="200"
          height="80"
          viewBox="0 0 200 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto mb-8"
          aria-hidden="true"
        >
          {/* 4 */}
          <line x1="16" y1="16" x2="16" y2="48" stroke="var(--concrete)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="16" y1="40" x2="34" y2="40" stroke="var(--concrete)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="32" y1="16" x2="32" y2="64" stroke="var(--concrete)" strokeWidth="2.5" strokeLinecap="round" />
          {/* 0 */}
          <rect x="54" y="16" width="30" height="48" rx="2"
            stroke="var(--blueprint)" strokeWidth="2.5" fill="none" />
          {/* 4 */}
          <line x1="104" y1="16" x2="104" y2="48" stroke="var(--concrete)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="104" y1="40" x2="122" y2="40" stroke="var(--concrete)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="120" y1="16" x2="120" y2="64" stroke="var(--concrete)" strokeWidth="2.5" strokeLinecap="round" />
          {/* Dimension arrows */}
          <line x1="148" y1="40" x2="190" y2="40" stroke="var(--eco)" strokeWidth="1" strokeDasharray="3 3" />
          <polyline points="152,36 148,40 152,44" stroke="var(--eco)" strokeWidth="1" fill="none" />
          <polyline points="186,36 190,40 186,44" stroke="var(--eco)" strokeWidth="1" fill="none" />
          <text x="169" y="36" fontSize="7" fill="var(--eco)" fontFamily="IBM Plex Mono" textAnchor="middle">404</text>
        </svg>

        <h1
          className="text-2xl font-semibold mb-3"
          style={{ color: 'var(--ink)', fontFamily: 'var(--font-sans)' }}
        >
          This page does not exist.
        </h1>
        <p
          className="text-sm mb-8"
          style={{ color: 'var(--ink-muted)', lineHeight: 1.6 }}
        >
          The URL you requested was not found on this server.
          Check the address, or navigate back to where you came from.
        </p>

        <button
          onClick={handleBack}
          className="btn-primary"
          id="not-found-back-btn"
        >
          <ArrowLeft size={15} />
          {isAuthenticated ? 'Back to Dashboard' : 'Back to Home'}
        </button>

        {/* Blueprint annotation */}
        <p
          className="mt-8 text-xs"
          style={{ color: 'var(--concrete)', fontFamily: 'var(--font-mono)' }}
        >
          EcoBuild AI — HTTP 404 Not Found
        </p>
      </div>
    </div>
  );
}
