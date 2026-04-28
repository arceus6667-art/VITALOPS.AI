import React, { lazy, Suspense, useState, useEffect, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import { VenueProvider } from './context/VenueContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Preloader from './components/preloader/Preloader';

// Lazy load all non-primary pages
const HospitalView = lazy(() => import('./pages/HospitalView'));
const Vitals = lazy(() => import('./pages/Vitals'));
const Patients = lazy(() => import('./pages/Patients'));
const AlertsPage = lazy(() => import('./pages/AlertsPage'));
const StocksLogistics = lazy(() => import('./pages/StocksLogistics'));
const TrendAnalysis = lazy(() => import('./pages/TrendAnalysis'));
const Settings = lazy(() => import('./pages/Settings'));
const GuestSOS = lazy(() => import('./pages/GuestSOS'));

// Route-level loading fallback
function PageLoader() {
  return (
    <div style={{ flex: 1, display: 'grid', placeItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px', height: '40px',
          borderRadius: '50%',
          border: '3px solid var(--bg-subtle)',
          borderTopColor: 'var(--accent-primary)',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 1rem auto'
        }}></div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>Loading Module...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

// ─────────────────────────────────
// App wrapper with preloader logic
// ─────────────────────────────────
function AppContent() {
  const { user, role } = useContext(AuthContext);
  const [showPreloader, setShowPreloader] = useState(true);
  const [preloaderDone, setPreloaderDone] = useState(false);

  // Only show preloader on first visit (not logged in)
  useEffect(() => {
    if (user) {
      setShowPreloader(false);
      setPreloaderDone(true);
    }
    const shown = sessionStorage.getItem('vitalops_preloader_shown');
    if (shown) {
      setShowPreloader(false);
      setPreloaderDone(true);
    }
  }, [user]);

  const handlePreloaderComplete = () => {
    setShowPreloader(false);
    setPreloaderDone(true);
    sessionStorage.setItem('vitalops_preloader_shown', 'true');
  };

  return (
    <>
      {/* Cinematic Preloader */}
      {showPreloader && !user && (
        <Preloader onComplete={handlePreloaderComplete} />
      )}

      {/* Main App */}
      {(preloaderDone || user) && (
        <Routes>
          {/* Unprotected Auth Gateway */}
          <Route path="/login" element={<Login />} />

          {/* Guest SOS — auth required, no layout, no staff nav */}
          <Route
            path="/sos"
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <GuestSOS />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Protected Staff Routes under shared Layout */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />

            {/* Venue 3D map — /venue */}
            <Route path="venue" element={<Suspense fallback={<PageLoader />}><HospitalView /></Suspense>} />

            {/* Zone Status — /zones (Vitals.jsx, rebranded) */}
            <Route path="zones" element={<Suspense fallback={<PageLoader />}><Vitals /></Suspense>} />

            {/* Response Team — /staff (Patients.jsx, rebranded) */}
            <Route path="staff" element={<Suspense fallback={<PageLoader />}><Patients /></Suspense>} />

            {/* Incident Feed */}
            <Route path="alerts" element={<Suspense fallback={<PageLoader />}><AlertsPage /></Suspense>} />

            {/* Emergency Supplies */}
            <Route path="stocks" element={<Suspense fallback={<PageLoader />}><StocksLogistics /></Suspense>} />

            {/* Trend Analysis */}
            <Route path="trends" element={<Suspense fallback={<PageLoader />}><TrendAnalysis /></Suspense>} />

            {/* Settings */}
            <Route path="settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />

            {/* Legacy redirects for old hospital paths */}
            <Route path="hospital" element={<Navigate to="/venue" replace />} />
            <Route path="vitals" element={<Navigate to="/zones" replace />} />
            <Route path="patients" element={<Navigate to="/staff" replace />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <VenueProvider>
          <AppContent />
        </VenueProvider>
      </AlertProvider>
    </AuthProvider>
  );
}

export default App;
