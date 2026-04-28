// ═══════════════════════════════════════════════════
// VitalOps AI — Live Incident Panel
// Real-time incident feed from VenueContext with
// resolve + dispatch actions.
// ═══════════════════════════════════════════════════

import React, { useEffect, useRef, useState } from 'react';
import { Radio, Shield, ChevronDown, ChevronUp, CheckCircle2, UserPlus, Clock } from 'lucide-react';
import { useVenue } from '../context/VenueContext';
import gsap from 'gsap';

function timeAgo(date) {
  if (!date) return 'Just now';
  let d;
  if (typeof date.toDate === 'function') {
    d = date.toDate();
  } else {
    d = new Date(date);
  }
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMs / 3600000);
  if (diffHr < 24) return `${diffHr}h ago`;
  return d.toLocaleDateString();
}

function SeverityBadge({ severity }) {
  const map = {
    critical: { color: 'var(--accent-alert)', bg: 'var(--accent-alert-light)' },
    high: { color: 'var(--accent-alert)', bg: 'var(--accent-alert-light)' },
    medium: { color: 'var(--accent-yellow)', bg: 'var(--accent-yellow-light)' },
    low: { color: 'var(--accent-green)', bg: 'var(--accent-green-light)' },
  };
  const s = map[severity] || map.medium;
  return (
    <span style={{
      fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
      color: s.color, background: s.bg, padding: '2px 7px', borderRadius: 'var(--radius-full)',
    }}>
      {severity}
    </span>
  );
}

export default function LiveIncidentPanel() {
  const containerRef = useRef(null);
  const { activeIncidents, allStaff, resolveIncident, dispatchStaff, t } = useVenue();
  const [expandedId, setExpandedId] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);
  const [dispatchOpen, setDispatchOpen] = useState(null);
  const [dispatchingId, setDispatchingId] = useState(null);

  const availableStaff = allStaff.filter(s => s.status === 'Available');

  useEffect(() => {
    if (containerRef.current) {
      const rows = containerRef.current.querySelectorAll('.incident-row');
      if (rows.length > 0) {
        gsap.fromTo(rows,
          { x: -15, opacity: 0 },
          { x: 0, opacity: 1, stagger: 0.06, duration: 0.35, ease: 'power2.out' }
        );
      }
    }
  }, [activeIncidents]);

  const handleResolve = async (id) => {
    setResolvingId(id);
    await resolveIncident(id);
    setResolvingId(null);
    setExpandedId(null);
  };

  const handleDispatch = async (incidentId, staffId) => {
    setDispatchingId(staffId);
    await dispatchStaff(incidentId, staffId);
    setDispatchingId(null);
    setDispatchOpen(null);
  };

  const TYPE_EMOJI = { fire: '🔥', medical: '🏥', security: '🚨', flood: '💧', other: '⚠️' };

  return (
    <div ref={containerRef} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: 'var(--radius-sm)',
          background: 'var(--accent-primary-light)', display: 'grid', placeItems: 'center'
        }}>
          <Radio size={15} color="var(--accent-primary)" />
        </div>
        <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 600 }}>Live Incidents</h3>
        {activeIncidents.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto' }}>
            <div className="live-dot" style={{ width: '6px', height: '6px' }}></div>
            <span style={{
              fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-alert)',
              background: 'var(--accent-alert-light)', padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
            }}>
              {activeIncidents.length}
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto', paddingRight: '0.25rem' }}>
        {activeIncidents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: 'var(--radius-lg)',
              background: 'var(--accent-green-light)', display: 'grid', placeItems: 'center',
            }}>
              <Shield size={22} color="var(--accent-green)" />
            </div>
            <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600, color: 'var(--accent-green)' }}>All Clear</p>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>No Active Incidents</p>
          </div>
        ) : (
          activeIncidents.map((incident) => {
            const isExpanded = expandedId === incident.id;
            const isResolving = resolvingId === incident.id;
            const isDispatchOpen = dispatchOpen === incident.id;

            return (
              <div key={incident.id} className="incident-row" style={{
                background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-glass)', overflow: 'hidden',
                transition: 'border-color 0.2s ease',
              }}>
                <div
                  onClick={() => setExpandedId(isExpanded ? null : incident.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.65rem',
                    padding: '0.75rem 1rem', cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '1.1rem' }}>{TYPE_EMOJI[incident.type] || '⚠️'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {incident.zone || 'Unknown Zone'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                      <Clock size={10} color="var(--text-muted)" />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{timeAgo(incident.createdAt)}</span>
                    </div>
                  </div>
                  <SeverityBadge severity={incident.severity} />
                  {isExpanded ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
                </div>

                {isExpanded && (
                  <div style={{ padding: '0 1rem 0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {incident.description && (
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {incident.description}
                      </p>
                    )}

                    {incident.geminiClassification?.response && (
                      <div style={{ padding: '0.5rem 0.75rem', background: 'var(--accent-primary-light)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-primary)' }}>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                          AI: {incident.geminiClassification.response}
                        </p>
                      </div>
                    )}

                    {incident.assignedStaff && incident.assignedStaff.length > 0 && (
                      <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Staff assigned: {incident.assignedStaff.length}
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <button
                        onClick={() => handleResolve(incident.id)}
                        disabled={isResolving}
                        style={{
                          flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem', fontWeight: 600,
                          color: 'var(--accent-green)', border: '1px solid var(--accent-green)',
                          background: isResolving ? 'var(--accent-green-light)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                          cursor: isResolving ? 'wait' : 'pointer', transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => { if (!isResolving) e.currentTarget.style.background = 'var(--accent-green-light)'; }}
                        onMouseLeave={e => { if (!isResolving) e.currentTarget.style.background = 'transparent'; }}
                      >
                        {isResolving ? (
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid var(--accent-green)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                        ) : (
                          <CheckCircle2 size={12} />
                        )}
                        {isResolving ? 'Resolving...' : 'Resolve'}
                      </button>

                      <div style={{ flex: 1, position: 'relative' }}>
                        <button
                          onClick={() => setDispatchOpen(isDispatchOpen ? null : incident.id)}
                          style={{
                            width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem', fontWeight: 600,
                            color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)',
                            background: 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                            cursor: 'pointer', transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-primary-light)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <UserPlus size={12} /> Dispatch
                        </button>

                        {isDispatchOpen && (
                          <div style={{
                            position: 'absolute', bottom: '110%', left: 0, right: 0,
                            background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)',
                            borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
                            maxHeight: '150px', overflowY: 'auto', zIndex: 10,
                          }}>
                            {availableStaff.length === 0 ? (
                              <p style={{ padding: '0.75rem', margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>No staff available</p>
                            ) : (
                              availableStaff.map(staff => (
                                <button
                                  key={staff.id}
                                  onClick={() => handleDispatch(incident.id, staff.id)}
                                  disabled={dispatchingId === staff.id}
                                  style={{
                                    width: '100%', padding: '0.55rem 0.75rem', textAlign: 'left',
                                    fontSize: '0.78rem', color: 'var(--text-main)',
                                    borderBottom: '1px solid var(--border-glass)',
                                    transition: 'background 0.15s ease', cursor: 'pointer',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                  <span style={{ fontWeight: 500 }}>{staff.name}</span>
                                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{staff.staffRole}</span>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
