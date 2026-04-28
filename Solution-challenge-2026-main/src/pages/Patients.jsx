// ═══════════════════════════════════════════════════
// VitalOps AI — Response Team (replaces Patients content)
// Filename kept as Patients.jsx for lazy import compat.
// Staff directory from VenueContext with deploy action.
// ═══════════════════════════════════════════════════

import React, { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import { Search, Users, ChevronLeft, ChevronRight, Shield, MapPin, ChevronDown } from 'lucide-react';
import { useVenue } from '../context/VenueContext';

const STATUS_COLORS = {
  Available: { color: 'var(--accent-green)', bg: 'var(--accent-green-light)' },
  Deployed: { color: 'var(--accent-yellow)', bg: 'var(--accent-yellow-light)' },
  'Off-duty': { color: 'var(--text-muted)', bg: 'var(--bg-subtle)' },
};

const ROLE_COLORS = {
  Security: 'var(--accent-alert)',
  Medical: 'var(--accent-blue)',
  Maintenance: 'var(--accent-yellow)',
  Manager: 'var(--accent-purple)',
};

const PER_PAGE = 12;

export default function Patients() {
  const containerRef = useRef(null);
  const { allStaff, activeIncidents, dispatchStaff, t } = useVenue();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [deployOpen, setDeployOpen] = useState(null);
  const [deploying, setDeploying] = useState(null);

  useEffect(() => {
    gsap.fromTo('.staff-card',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.05, duration: 0.5, ease: 'power2.out' }
    );
  }, [page, statusFilter, search]);

  const filtered = useMemo(() => {
    let list = [...allStaff];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.currentZone || '').toLowerCase().includes(q) ||
        (s.staffRole || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      list = list.filter(s => s.status === statusFilter);
    }
    return list;
  }, [allStaff, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const activeCount = allStaff.filter(s => s.status !== 'Off-duty').length;
  const filters = ['all', 'Available', 'Deployed', 'Off-duty'];

  const handleDeploy = async (staffId, incidentId) => {
    setDeploying(staffId);
    await dispatchStaff(incidentId, staffId);
    setDeploying(null);
    setDeployOpen(null);
  };

  return (
    <div ref={containerRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700 }}>Response Team</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0.2rem 0 0 0' }}>
            {activeCount} personnel active
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search name, zone, role..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{
                width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.2rem',
                background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-full)', color: 'var(--text-main)',
                fontSize: '0.82rem', outline: 'none',
              }}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', background: 'var(--bg-surface)', borderRadius: 'var(--radius-full)', padding: '3px', border: '1px solid var(--border-glass)' }}>
            {filters.map(f => (
              <button
                key={f}
                onClick={() => { setStatusFilter(f); setPage(1); }}
                style={{
                  padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem', fontWeight: 600,
                  background: statusFilter === f ? 'var(--bg-secondary)' : 'transparent',
                  color: statusFilter === f ? 'var(--accent-primary)' : 'var(--text-muted)',
                  boxShadow: statusFilter === f ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      {paginated.length === 0 ? (
        <div className="glass-panel" style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '3rem' }}>
          <div style={{ textAlign: 'center' }}>
            <Users size={40} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.4 }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>No staff members found</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {paginated.map(staff => {
            const sc = STATUS_COLORS[staff.status] || STATUS_COLORS['Off-duty'];
            const rc = ROLE_COLORS[staff.staffRole] || 'var(--accent-primary)';
            const initial = (staff.name || 'S').charAt(0).toUpperCase();
            const isAvailable = staff.status === 'Available';
            const isDeployOpen = deployOpen === staff.id;
            const isDeploying = deploying === staff.id;

            return (
              <div key={staff.id} className="staff-card glass-panel hover-glow" style={{
                padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem',
              }}>
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    background: `linear-gradient(135deg, ${rc}, ${rc}88)`,
                    display: 'grid', placeItems: 'center', flexShrink: 0,
                  }}>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{initial}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)' }}>{staff.name}</p>
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 600, color: rc,
                      background: `${rc}15`, padding: '1px 7px', borderRadius: 'var(--radius-full)',
                      display: 'inline-block', marginTop: '0.15rem',
                    }}>
                      {staff.staffRole || 'Staff'}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                    color: sc.color, background: sc.bg, padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                  }}>
                    {staff.status}
                  </span>
                </div>

                {/* Zone */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={12} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{staff.currentZone || 'Unassigned'}</span>
                </div>

                {/* Deploy button (only for Available staff with active incidents) */}
                {isAvailable && activeIncidents.length > 0 && (
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setDeployOpen(isDeployOpen ? null : staff.id)}
                      style={{
                        width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)',
                        fontSize: '0.78rem', fontWeight: 600,
                        color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)',
                        background: 'transparent', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-primary-light)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Shield size={13} /> Deploy to Incident <ChevronDown size={11} />
                    </button>
                    {isDeployOpen && (
                      <div style={{
                        position: 'absolute', top: '110%', left: 0, right: 0,
                        background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)',
                        borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
                        maxHeight: '160px', overflowY: 'auto', zIndex: 10,
                      }}>
                        {activeIncidents.map(inc => (
                          <button
                            key={inc.id}
                            onClick={() => handleDeploy(staff.id, inc.id)}
                            disabled={isDeploying}
                            style={{
                              width: '100%', padding: '0.55rem 0.75rem', textAlign: 'left',
                              fontSize: '0.78rem', color: 'var(--text-main)',
                              borderBottom: '1px solid var(--border-glass)',
                              cursor: isDeploying ? 'wait' : 'pointer',
                              transition: 'background 0.15s ease',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            {inc.type ? inc.type.charAt(0).toUpperCase() + inc.type.slice(1) : 'Incident'} — {inc.zone || 'Unknown'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', paddingTop: '0.5rem' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem', border: '1px solid var(--border-glass)',
              color: page === 1 ? 'var(--text-muted)' : 'var(--text-main)',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              transition: 'all 0.15s ease',
            }}
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem', border: '1px solid var(--border-glass)',
              color: page === totalPages ? 'var(--text-muted)' : 'var(--text-main)',
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              transition: 'all 0.15s ease',
            }}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
