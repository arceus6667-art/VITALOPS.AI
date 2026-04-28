// ═══════════════════════════════════════════════════
// VitalOps AI — Protected Route (Role-based)
// Guests → /sos only. Staff → all routes.
// Shows spinner while auth state is loading.
// ═══════════════════════════════════════════════════

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  // ── Loading state: centered spinner (matches PageLoader pattern) ──
  if (loading) {
    return (
      <div style={{ flex: 1, display: 'grid', placeItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px', height: '40px',
            borderRadius: '50%',
            border: '3px solid var(--bg-subtle)',
            borderTopColor: 'var(--accent-primary)',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem auto'
          }}></div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>Verifying authorization...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ── No user: redirect to login ──
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ── Guest trying to access staff routes: redirect to SOS ──
  if (role === 'guest' && location.pathname !== '/sos') {
    return <Navigate to="/sos" replace />;
  }

  // ── Staff or valid guest route: render children ──
  return children;
}
