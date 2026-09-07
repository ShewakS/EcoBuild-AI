import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '1rem',
        color: '#1b4332'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #d8f3dc',
          borderTopColor: '#2d6a4f',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ fontWeight: 600, letterSpacing: '0.03em' }}>Verifying EcoBuild AI Session...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect user to their own portal if they attempt unauthorized cross-role access
    if (role === 'SUPER_ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (role === 'CUSTOMER') {
      return <Navigate to="/customer/dashboard" replace />;
    }
    return <Navigate to="/projects" replace />;
  }

  return children;
}
