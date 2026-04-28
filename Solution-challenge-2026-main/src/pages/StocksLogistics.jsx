// ═══════════════════════════════════════════════════
// VitalOps AI — Emergency Supplies (replaces StocksLogistics)
// Live data from VenueContext inventory with local fallback.
// Request Restock writes to Firestore.
// ═══════════════════════════════════════════════════

import React, { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import { Search, Package, AlertTriangle, CheckCircle2, ArrowUpRight, MapPin } from 'lucide-react';
import { useVenue } from '../context/VenueContext';
import { useAuth } from '../context/AuthContext';
import { addDoc, collection } from 'firebase/firestore';
import { db, serverTimestamp } from '../services/firebase';

const FALLBACK_INVENTORY = [
  { id: 'I1', name: 'First Aid Kits', current: 24, minimum: 10, unit: 'kits', status: 'optimal', location: 'Security Office' },
  { id: 'I2', name: 'Fire Extinguishers', current: 8, minimum: 15, unit: 'units', status: 'critical', location: 'All Floors' },
  { id: 'I3', name: 'AED Defibrillators', current: 5, minimum: 5, unit: 'units', status: 'optimal', location: 'Lobby, Pool, Gym' },
  { id: 'I4', name: 'Emergency Radios', current: 12, minimum: 20, unit: 'devices', status: 'warning', location: 'Staff Office' },
  { id: 'I5', name: 'Evacuation Chairs', current: 3, minimum: 6, unit: 'chairs', status: 'critical', location: 'Stairwells' },
  { id: 'I6', name: 'Backup Power Units', current: 2, minimum: 2, unit: 'units', status: 'optimal', location: 'Server Room' },
  { id: 'I7', name: 'Emergency Blankets', current: 150, minimum: 50, unit: 'units', status: 'optimal', location: 'Storage' },
  { id: 'I8', name: 'Oxygen Masks', current: 9, minimum: 15, unit: 'masks', status: 'warning', location: 'Medical Station' },
];

const STATUS_MAP = {
  optimal: { color: 'var(--accent-green)', bg: 'var(--accent-green-light)', label: 'Optimal' },
  warning: { color: 'var(--accent-yellow)', bg: 'var(--accent-yellow-light)', label: 'Warning' },
  critical: { color: 'var(--accent-alert)', bg: 'var(--accent-alert-light)', label: 'Critical' },
};

export default function StocksLogistics() {
  const containerRef = useRef(null);
  const { inventory: firestoreInventory, t } = useVenue();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState(null);
  const [requesting, setRequesting] = useState(null);
  const toastRef = useRef(null);

  const inventory = firestoreInventory.length > 0 ? firestoreInventory : FALLBACK_INVENTORY;

  useEffect(() => {
    gsap.fromTo('.stock-card',
      { opacity: 0, scale: 0.95, y: 15 },
      { opacity: 1, scale: 1, y: 0, stagger: 0.06, duration: 0.5, ease: 'power2.out' }
    );
  }, [statusFilter, search]);

  // Toast animation
  useEffect(() => {
    if (toast && toastRef.current) {
      gsap.fromTo(toastRef.current,
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
      const timer = setTimeout(() => {
        gsap.to(toastRef.current, {
          x: 100, opacity: 0, duration: 0.3,
          onComplete: () => setToast(null),
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const filtered = useMemo(() => {
    let list = [...inventory];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i => i.name.toLowerCase().includes(q) || (i.location || '').toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') {
      list = list.filter(i => i.status === statusFilter);
    }
    return list;
  }, [inventory, search, statusFilter]);

  const counts = {
    all: inventory.length,
    optimal: inventory.filter(i => i.status === 'optimal').length,
    warning: inventory.filter(i => i.status === 'warning').length,
    critical: inventory.filter(i => i.status === 'critical').length,
  };

  const handleRestock = async (item) => {
    setRequesting(item.id);
    try {
      await addDoc(collection(db, 'restock_requests'), {
        itemId: item.id,
        itemName: item.name,
        requestedBy: user?.uid || 'unknown',
        createdAt: serverTimestamp(),
        status: 'pending',
      });
      setToast(`Restock requested for ${item.name}`);
    } catch (e) {
      console.warn('[Stocks] Restock request failed:', e.message);
      setToast(`Request failed — please try again`);
    }
    setRequesting(null);
  };

  const filters = ['all', 'optimal', 'warning', 'critical'];

  return (
    <div ref={containerRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
      {/* Toast */}
      {toast && (
        <div ref={toastRef} style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 999,
          padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)',
          background: 'var(--accent-green-light)', border: '1px solid var(--accent-green)',
          color: 'var(--accent-green)', fontSize: '0.85rem', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <CheckCircle2 size={15} /> {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700 }}>{t('stocks.title')}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0.2rem 0 0 0' }}>{t('stocks.subtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search supplies..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.2rem',
                background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-full)', color: 'var(--text-main)',
                fontSize: '0.82rem', outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', background: 'var(--bg-surface)', borderRadius: 'var(--radius-full)', padding: '3px', border: '1px solid var(--border-glass)' }}>
            {filters.map(f => (
              <button key={f} onClick={() => setStatusFilter(f)} style={{
                padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem', fontWeight: 600,
                background: statusFilter === f ? 'var(--bg-secondary)' : 'transparent',
                color: statusFilter === f ? 'var(--accent-primary)' : 'var(--text-muted)',
                boxShadow: statusFilter === f ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease',
              }}>
                {f === 'all' ? `All (${counts.all})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${counts[f]})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {filtered.map(item => {
          const s = STATUS_MAP[item.status] || STATUS_MAP.optimal;
          const pct = Math.min(100, Math.round((item.current / Math.max(item.minimum, 1)) * 100));
          const isRequesting = requesting === item.id;

          return (
            <div key={item.id} className="stock-card glass-panel hover-glow" style={{
              padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                    background: s.bg, display: 'grid', placeItems: 'center',
                  }}>
                    <Package size={17} color={s.color} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)' }}>{item.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
                      <MapPin size={10} color="var(--text-muted)" />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.location}</span>
                    </div>
                  </div>
                </div>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                  color: s.color, background: s.bg, padding: '2px 8px',
                  borderRadius: 'var(--radius-full)', letterSpacing: '0.04em',
                }}>
                  {s.label}
                </span>
              </div>

              {/* Stock level */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {item.current} / {item.minimum} {item.unit}
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: s.color }}>{pct}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(pct, 100)}%`, height: '100%',
                    background: s.color, borderRadius: '3px',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>

              {/* Restock button for critical/warning */}
              {(item.status === 'critical' || item.status === 'warning') && (
                <button
                  onClick={() => handleRestock(item)}
                  disabled={isRequesting}
                  style={{
                    width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem', fontWeight: 600,
                    color: item.status === 'critical' ? 'var(--accent-alert)' : 'var(--accent-yellow)',
                    border: `1px solid ${item.status === 'critical' ? 'var(--accent-alert)' : 'var(--accent-yellow)'}`,
                    background: 'transparent', cursor: isRequesting ? 'wait' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = item.status === 'critical' ? 'var(--accent-alert-light)' : 'var(--accent-yellow-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <ArrowUpRight size={13} />
                  {isRequesting ? 'Requesting...' : 'Request Restock'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Package size={36} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
          <p style={{ fontSize: '0.92rem' }}>No supplies match your search</p>
        </div>
      )}
    </div>
  );
}
