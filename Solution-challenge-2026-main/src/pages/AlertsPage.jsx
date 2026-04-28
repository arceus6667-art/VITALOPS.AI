// ═══════════════════════════════════════════════════
// VitalOps AI — Alerts Page (Live Firestore Data)
// Removed MOCK_ALERT_LOG. Real-time from AlertContext.
// Added resolve, dispatch, resolved filter.
// ═══════════════════════════════════════════════════

import React, { useContext, useState, useEffect, useRef } from 'react';
import { AlertTriangle, AlertCircle, Info, Clock, CheckCircle2, UserPlus, ChevronDown } from 'lucide-react';
import { AlertContext } from '../context/AlertContext';
import { useVenue } from '../context/VenueContext';
import gsap from 'gsap';

export default function AlertsPage() {
  const containerRef = useRef(null);
  const { alerts } = useContext(AlertContext);
  const { t, resolveIncident, dispatchStaff, allStaff } = useVenue();
  const [filter, setFilter] = useState('all');
  const [resolvingId, setResolvingId] = useState(null);
  const [dispatchOpen, setDispatchOpen] = useState(null);

  const availableStaff = allStaff.filter(s => s.status === 'Available');

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo('.alert-row',
        { opacity: 0, x: -15 },
        { opacity: 1, x: 0, stagger: 0.04, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [filter, alerts]);

  const filtered = (() => {
    if (filter === 'all') return alerts.filter(a => a.status !== 'resolved');
    if (filter === 'resolved') return alerts.filter(a => a.status === 'resolved');
    if (filter === 'critical') return alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved');
    if (filter === 'medium') return alerts.filter(a => (a.severity === 'medium' || a.severity === 'warning') && a.status !== 'resolved');
    if (filter === 'low') return alerts.filter(a => (a.severity === 'low' || a.severity === 'success') && a.status !== 'resolved');
    return alerts;
  })();

  const getProps = (severity) => {
    switch (severity) {
      case 'critical': return { icon: AlertTriangle, color: 'var(--accent-alert)', bg: 'var(--accent-alert-light)' };
      case 'medium': case 'warning': return { icon: AlertCircle, color: 'var(--accent-yellow)', bg: 'var(--accent-yellow-light)' };
      case 'low': case 'success': return { icon: Info, color: 'var(--accent-green)', bg: 'var(--accent-green-light)' };
      default: return { icon: Info, color: 'var(--accent-primary)', bg: 'var(--accent-primary-light)' };
    }
  };

  const activeAlerts = alerts.filter(a => a.status !== 'resolved');
  const counts = {
    all: activeAlerts.length,
    critical: activeAlerts.filter(a => a.severity === 'critical').length,
    medium: activeAlerts.filter(a => a.severity === 'medium' || a.severity === 'warning').length,
    low: activeAlerts.filter(a => a.severity === 'low' || a.severity === 'success').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
  };

  const handleResolve = async (id) => {
    setResolvingId(id);
    await resolveIncident(id);
    setResolvingId(null);
  };

  const handleDispatch = async (incidentId, staffId) => {
    await dispatchStaff(incidentId, staffId);
    setDispatchOpen(null);
  };

  return (
    <div ref={containerRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700 }}>{t('alerts.page_title')}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0.2rem 0 0 0' }}>{t('alerts.page_subtitle')}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        {[
          { key: 'all', label: 'Active', count: counts.all, color: 'var(--accent-primary)', bg: 'var(--accent-primary-light)' },
          { key: 'critical', label: 'Critical', count: counts.critical, color: 'var(--accent-alert)', bg: 'var(--accent-alert-light)' },
          { key: 'medium', label: 'Medium', count: counts.medium, color: 'var(--accent-yellow)', bg: 'var(--accent-yellow-light)' },
          { key: 'low', label: 'Low', count: counts.low, color: 'var(--accent-green)', bg: 'var(--accent-green-light)' },
          { key: 'resolved', label: 'Resolved', count: counts.resolved, color: 'var(--text-muted)', bg: 'var(--bg-surface)' },
        ].map(card => (
          <button
            key={card.key}
            onClick={() => setFilter(card.key)}
            className="glass-panel"
            style={{
              padding: '1.25rem', textAlign: 'left', cursor: 'pointer',
              border: filter === card.key ? `2px solid ${card.color}` : '1px solid var(--border-glass)',
              transition: 'all 0.2s ease'
            }}
          >
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{card.label}</p>
            <h2 style={{ margin: '0.3rem 0 0 0', fontSize: '1.75rem', fontWeight: 700, color: card.color }}>{card.count}</h2>
          </button>
        ))}
      </div>

      {/* Alert List */}
      <div className="glass-panel" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
            {filter === 'resolved' ? 'Resolved Incidents' : 'Incident Feed'}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{filtered.length} entries</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              No incidents in this category
            </div>
          ) : (
            filtered.map((alert, i) => {
              const props = getProps(alert.severity);
              const isResolved = alert.status === 'resolved';
              const isResolving = resolvingId === alert.id;
              const isDispOpen = dispatchOpen === alert.id;

              return (
                <div
                  key={alert.id + '-' + i}
                  className="alert-row"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '0.85rem 1.5rem',
                    borderBottom: '1px solid var(--border-glass)',
                    transition: 'background 0.15s ease',
                    opacity: isResolved ? 0.6 : 1,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
                    background: props.bg, display: 'grid', placeItems: 'center', flexShrink: 0
                  }}>
                    <props.icon size={15} color={props.color} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <p style={{
                        margin: 0, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)',
                        textDecoration: isResolved ? 'line-through' : 'none',
                      }}>
                        {alert.title}
                      </p>
                      {alert.date === 'Live' && !isResolved && (
                        <span style={{
                          fontSize: '0.62rem', fontWeight: 700, color: 'var(--accent-green)',
                          background: 'var(--accent-green-light)', padding: '1px 6px',
                          borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '0.04em'
                        }}>LIVE</span>
                      )}
                    </div>
                    <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{alert.suggestion}</p>
                    {isResolved && alert.geminiSummary && (
                      <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.75rem', color: 'var(--accent-primary)', fontStyle: 'italic' }}>
                        Summary: {alert.geminiSummary}
                      </p>
                    )}
                  </div>

                  {/* Actions for active alerts */}
                  {!isResolved && (
                    <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                      {/* Resolve */}
                      <button
                        onClick={() => handleResolve(alert.id)}
                        disabled={isResolving}
                        style={{
                          padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-sm)',
                          fontSize: '0.7rem', fontWeight: 600,
                          color: 'var(--accent-green)', border: '1px solid var(--accent-green)',
                          background: 'transparent', cursor: isResolving ? 'wait' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: '0.25rem',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-green-light)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <CheckCircle2 size={11} />
                        {isResolving ? '...' : 'Resolve'}
                      </button>

                      {/* Assign Staff */}
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => setDispatchOpen(isDispOpen ? null : alert.id)}
                          style={{
                            padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-sm)',
                            fontSize: '0.7rem', fontWeight: 600,
                            color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)',
                            background: 'transparent', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.25rem',
                            transition: 'background 0.15s ease',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-primary-light)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <UserPlus size={11} /> Assign <ChevronDown size={10} />
                        </button>
                        {isDispOpen && (
                          <div style={{
                            position: 'absolute', top: '110%', right: 0, width: '180px',
                            background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)',
                            borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
                            maxHeight: '160px', overflowY: 'auto', zIndex: 20,
                          }}>
                            {availableStaff.length === 0 ? (
                              <p style={{ padding: '0.75rem', margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>No available staff</p>
                            ) : (
                              availableStaff.map(s => (
                                <button
                                  key={s.id}
                                  onClick={() => handleDispatch(alert.id, s.id)}
                                  style={{
                                    width: '100%', padding: '0.5rem 0.75rem', textAlign: 'left',
                                    fontSize: '0.78rem', color: 'var(--text-main)',
                                    borderBottom: '1px solid var(--border-glass)',
                                    transition: 'background 0.15s ease', cursor: 'pointer',
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                  {s.name} <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>• {s.staffRole}</span>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Severity + time for all */}
                  <div style={{ textAlign: 'right', flexShrink: 0, minWidth: '70px' }}>
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 600, color: props.color,
                      textTransform: 'uppercase', letterSpacing: '0.04em'
                    }}>{isResolved ? 'resolved' : alert.severity}</span>
                    <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end' }}>
                      <Clock size={10} /> {alert.time}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
