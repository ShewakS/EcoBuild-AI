import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

/**
 * Wraps public-only pages (login, register).
 * If already authenticated, redirects to the user's role dashboard.
 */
export default function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#0b0f1a'
      }}>
        <div style={{
          width: 40, height: 40, border: '3px solid rgba(46,178,90,0.3)',
          borderTopColor: '#2eb85a', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (isAuthenticated) {
    if (role === 'SUPER_ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'CUSTOMER') return <Navigate to="/customer/dashboard" replace />;
    return <Navigate to="/projects" replace />;
  }

  return children;
}
