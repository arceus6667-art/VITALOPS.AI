// ═══════════════════════════════════════════════════
// VitalOps AI — Dashboard (Staff/Manager Crisis Command)
// Reads from VenueContext. No more simState.
// ═══════════════════════════════════════════════════

import React, { useEffect, useState, lazy, Suspense } from 'react';
import KpiCards from '../components/KpiCards';
import HospitalScene from '../components/hospital3d/HospitalScene';
import LiveIncidentPanel from '../components/LiveIncidentPanel';
import Alerts from '../components/Alerts';
import AiInsights from '../components/AiInsights';
import { useVenue } from '../context/VenueContext';
import { Map, BarChart3, Radio, Clock } from 'lucide-react';

const AnalyticsPanel = lazy(() => import('../components/AnalyticsPanel'));

export default function Dashboard() {
  const { liveMode, setLiveMode, t, activeIncidents } = useVenue();
  const [activeTab, setActiveTab] = useState('live');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const tabs = [
    { key: 'live', labelKey: 'dash.interactive_map', icon: Map },
    { key: 'analytics', labelKey: 'dash.analytics', icon: BarChart3 },
  ];

  const dashboardAlerts = (activeIncidents || []).map(i => ({
    id: i.id,
    title: `${i.type ? i.type.charAt(0).toUpperCase() + i.type.slice(1) : 'Incident'} — ${i.zone || 'Unknown'}`,
    severity: i.severity === 'high' ? 'critical' : (i.severity || 'medium'),
    ward: i.zone || 'Unknown',
    time: i.createdAt ? (() => {
      let d;
      if (typeof i.createdAt.toDate === 'function') {
        d = i.createdAt.toDate();
      } else {
        d = new Date(i.createdAt);
      }
      const diff = Math.floor((new Date() - d) / 60000);
      if (diff < 1) return 'Just now';
      if (diff < 60) return `${diff}m ago`;
      return `${Math.floor(diff / 60)}h ago`;
    })() : 'Just now',
    suggestion: i.geminiClassification?.response || 'Assessing situation...',
  }));

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', margin: 0, fontWeight: 700 }}>{t('dash.title')}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0.2rem 0 0 0' }}>{t('dash.subtitle')}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            <Clock size={14} />
            <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{currentTime.toLocaleTimeString()}</span>
          </div>

          <button
            onClick={() => setLiveMode(!liveMode)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem', fontWeight: 600, border: '1px solid var(--border-glass)',
              color: liveMode ? 'var(--accent-green)' : 'var(--text-muted)',
              background: liveMode ? 'var(--accent-green-light)' : 'transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <Radio size={13} /> {t('dash.live_sim')}
          </button>

          <div style={{ display: 'flex', background: 'var(--bg-surface)', borderRadius: 'var(--radius-full)', padding: '3px', border: '1px solid var(--border-glass)' }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '0.45rem 1.25rem', borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.25s ease',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  background: activeTab === tab.key ? 'var(--bg-secondary)' : 'transparent',
                  color: activeTab === tab.key ? 'var(--accent-primary)' : 'var(--text-muted)',
                  boxShadow: activeTab === tab.key ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <tab.icon size={14} /> {t(tab.labelKey)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <KpiCards />

      {activeTab === 'live' ? (
        <div style={{ display: 'flex', gap: '1.25rem', flex: 1, minHeight: 0 }}>
          <div style={{ flex: 7, display: 'flex', flexDirection: 'column', gap: '1.25rem', minHeight: 0 }}>
            <div style={{
              position: 'relative', height: '500px',
              borderRadius: 'var(--radius-lg)', overflow: 'hidden',
              border: '1px solid var(--border-glass)', background: '#050810'
            }}>
              <HospitalScene />
            </div>
            <div style={{ flexShrink: 0 }}>
              <AiInsights />
            </div>
          </div>
          <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: '280px' }}>
            <LiveIncidentPanel />
            <Alerts alerts={dashboardAlerts} />
          </div>
        </div>
      ) : (
        <Suspense fallback={
          <div style={{ flex: 1, display: 'grid', placeItems: 'center' }}>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>⏳ {t('dash.loading_analytics')}</div>
          </div>
        }>
          <AnalyticsPanel />
        </Suspense>
      )}
    </>
  );
}
