import React, { useEffect, useRef } from 'react';
import { AlertTriangle, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { useVenue } from '../context/VenueContext';
import gsap from 'gsap';

export default function Alerts({ alerts = [] }) {
  const containerRef = useRef(null);
  const { t } = useVenue();

  useEffect(() => {
    if (alerts.length > 0 && containerRef.current) {
      gsap.fromTo(containerRef.current.children,
        { x: 30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out', clearProps: 'all' }
      );
    }
  }, [alerts]);

  const getStyleProps = (severity) => {
    switch (severity) {
      case 'critical': 
        return { 
          bg: 'var(--accent-alert-light)', 
          border: 'var(--accent-alert)', 
          color: 'var(--accent-alert)', 
          icon: AlertTriangle,
        };
      case 'medium': 
        return { 
          bg: 'var(--accent-yellow-light)', 
          border: 'var(--accent-yellow)', 
          color: 'var(--accent-yellow)', 
          icon: AlertCircle,
        };
      case 'low': 
      default:
        return { 
          bg: 'var(--accent-primary-light)', 
          border: 'var(--border-glass)', 
          color: 'var(--accent-primary)', 
          icon: Info,
        };
    }
  };

  return (
    <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '0.95rem', color: 'var(--text-main)', margin: 0, fontWeight: 600 }}>{t('alerts.title')}</h3>
        <span style={{ 
          fontSize: '0.72rem', 
          color: 'var(--text-muted)', 
          background: 'var(--bg-surface)', 
          padding: '3px 10px', 
          borderRadius: 'var(--radius-full)',
          fontWeight: 500
        }}>
          {alerts.length} {t('alerts.items')}
        </span>
      </div>

      <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, overflowY: 'auto', paddingRight: '0.25rem' }}>
        {alerts.map((alert) => {
          const props = getStyleProps(alert.severity);
          const isCritical = alert.severity === 'critical';
          return (
            <div 
              key={alert.id} 
              className={isCritical ? 'animate-pulse-critical' : ''}
              style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '0.4rem', 
                padding: '0.85rem 1rem', 
                background: props.bg, 
                borderRadius: 'var(--radius-md)',
                borderLeft: `3px solid ${props.border}`,
                transition: 'transform 0.2s ease, background 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <props.icon size={14} color={props.color} />
                  <span style={{ 
                    fontSize: '0.68rem', 
                    color: props.color, 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.04em' 
                  }}>
                    {alert.severity} • {alert.ward}
                  </span>
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{alert.time}</span>
              </div>
              
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 0.2rem 0', color: 'var(--text-main)' }}>{alert.title}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>{alert.suggestion}</p>
              </div>

              {isCritical && (
                <div style={{ marginTop: '0.3rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.25rem', 
                    fontSize: '0.7rem', fontWeight: 600, color: '#fff', 
                    background: 'var(--accent-alert)', padding: '4px 10px', 
                    borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                    transition: 'opacity 0.15s ease'
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    Deploy SRT <ChevronRight size={11} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {alerts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '0.88rem' }}>No active alerts. System stable.</p>
          </div>
        )}
      </div>
    </div>
  );
}
