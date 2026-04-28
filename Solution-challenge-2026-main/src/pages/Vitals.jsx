// ═══════════════════════════════════════════════════
// VitalOps AI — Zone Status (replaces Vitals content)
// Filename kept as Vitals.jsx to preserve lazy import.
// Shows venue zone health with live incident/staff data.
// ═══════════════════════════════════════════════════

import React, { useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { MapPin, AlertTriangle, Users, Shield, Activity } from 'lucide-react';
import { useVenue } from '../context/VenueContext';

const ZONES = [
  { name: 'Lobby & Reception', icon: '🏨', floor: 1 },
  { name: 'Ballroom', icon: '🎪', floor: 2 },
  { name: 'Conference Wing', icon: '📋', floor: 2 },
  { name: 'Guest Rooms', icon: '🛏️', floor: 3 },
  { name: 'Pool & Recreation', icon: '🏊', floor: 4 },
];

export default function Vitals() {
  const containerRef = useRef(null);
  const { activeIncidents, allStaff, t } = useVenue();

  useEffect(() => {
    gsap.fromTo('.vitals-node',
      { opacity: 0, scale: 0.9, y: 20 },
      { opacity: 1, scale: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out' }
    );
  }, []);

  const zoneData = useMemo(() => {
    return ZONES.map(zone => {
      const incidents = activeIncidents.filter(i => i.zone === zone.name);
      const staff = allStaff.filter(s => s.currentZone === zone.name);
      const hasCritical = incidents.some(i => i.severity === 'critical' || i.severity === 'high');
      const hasActive = incidents.length > 0;

      let status = 'Clear';
      let statusColor = 'var(--accent-green)';
      let statusBg = 'var(--accent-green-light)';
      if (hasCritical) {
        status = 'Critical';
        statusColor = 'var(--accent-alert)';
        statusBg = 'var(--accent-alert-light)';
      } else if (hasActive) {
        status = 'Alert';
        statusColor = 'var(--accent-yellow)';
        statusBg = 'var(--accent-yellow-light)';
      }

      return { ...zone, incidents: incidents.length, staff: staff.length, status, statusColor, statusBg };
    });
  }, [activeIncidents, allStaff]);

  const totalIncidents = activeIncidents.length;
  const totalStaffDeployed = allStaff.filter(s => s.status === 'Deployed').length;

  return (
    <div ref={containerRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Zone Status
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0.2rem 0 0 0' }}>Live venue zone health monitoring</p>
        </div>
        <div className="status-badge status-badge--active" style={{ gap: '0.5rem' }}>
          <div className="live-dot" style={{ width: '6px', height: '6px' }}></div>
          REAL-TIME MONITORING ACTIVE
        </div>
      </div>

      {/* Zone Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {zoneData.map((zone, i) => (
          <div key={i} className="vitals-node glass-panel hover-glow" style={{
            padding: '1.75rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            {/* Zone header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{zone.icon}</span>
                <div>
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>{zone.name}</p>
                  <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Floor {zone.floor}</p>
                </div>
              </div>
              <span style={{
                fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                color: zone.statusColor, background: zone.statusBg,
                padding: '3px 10px', borderRadius: 'var(--radius-full)',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: zone.statusColor }}></div>
                {zone.status}
              </span>
            </div>

            {/* Metrics */}
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                  <AlertTriangle size={12} color={zone.incidents > 0 ? 'var(--accent-alert)' : 'var(--text-muted)'} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>Incidents</span>
                </div>
                <p style={{
                  margin: 0, fontSize: '1.5rem', fontWeight: 700, lineHeight: 1,
                  color: zone.incidents > 0 ? 'var(--accent-alert)' : 'var(--text-main)',
                }}>
                  {zone.incidents}
                </p>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                  <Users size={12} color="var(--accent-primary)" />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>Staff</span>
                </div>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, lineHeight: 1, color: 'var(--text-main)' }}>
                  {zone.staff}
                </p>
              </div>
            </div>

            {/* Status bar */}
            <div style={{ width: '100%', height: '4px', background: 'var(--bg-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                width: zone.status === 'Critical' ? '100%' : zone.status === 'Alert' ? '60%' : '20%',
                height: '100%',
                background: zone.statusColor,
                borderRadius: '2px',
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Command Overview Panel */}
      <div className="glass-panel" style={{ flex: 1, padding: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: '220px', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{
            width: '56px', height: '56px',
            borderRadius: 'var(--radius-lg)',
            background: totalIncidents === 0 ? 'var(--accent-green-light)' : 'var(--accent-alert-light)',
            display: 'grid', placeItems: 'center',
            margin: '0 auto 1.25rem auto'
          }}>
            <Shield size={24} color={totalIncidents === 0 ? 'var(--accent-green)' : 'var(--accent-alert)'} className="animate-breathing" />
          </div>
          <h3 style={{ color: 'var(--text-main)', margin: '0 0 0.5rem 0', fontSize: '1.15rem', fontWeight: 600 }}>
            {totalIncidents === 0 ? 'All Zones Secure' : `${totalIncidents} Active Incident${totalIncidents !== 1 ? 's' : ''}`}
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: 0, lineHeight: 1.6, fontSize: '0.9rem' }}>
            {totalIncidents === 0
              ? 'All venue zones are operating normally. Real-time monitoring is active across all 5 zones.'
              : `${totalStaffDeployed} staff deployed across affected zones. Gemini AI is continuously analyzing threat levels.`
            }
          </p>
        </div>
        {/* Scanline Effect */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--accent-primary), transparent)',
          opacity: 0.4,
          zIndex: 1,
          animation: 'scan 4s linear infinite'
        }}></div>
      </div>

      <style>{`
        @keyframes scan {
          from { top: 0; }
          to { top: 100%; }
        }
      `}</style>
    </div>
  );
}
