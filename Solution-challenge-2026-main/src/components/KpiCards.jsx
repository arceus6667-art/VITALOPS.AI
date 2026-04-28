// ═══════════════════════════════════════════════════
// VitalOps AI — KPI Cards (Crisis Metrics)
// Reads from VenueContext instead of simState.
// Metrics: Active Incidents, Staff Deployed, Zones Clear, Avg Response Time
// ═══════════════════════════════════════════════════

import React, { useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { AlertTriangle, Users, MapPin, Clock } from 'lucide-react';
import { useVenue } from '../context/VenueContext';

export default function KpiCards() {
  const containerRef = useRef(null);
  const { activeIncidents, allStaff, t } = useVenue();

  const val1Ref = useRef(null);
  const val2Ref = useRef(null);
  const val3Ref = useRef(null);
  const val4Ref = useRef(null);

  useEffect(() => {
    gsap.fromTo(containerRef.current.children,
      { y: 30, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.2)' }
    );
  }, []);

  const metrics = useMemo(() => {
    const incidentCount = activeIncidents.length;
    const deployedCount = allStaff.filter(s => s.status === 'Deployed').length;
    const totalStaff = allStaff.length;

    const zones = ['Lobby & Reception', 'Ballroom', 'Conference Wing', 'Guest Rooms', 'Pool & Recreation'];
    const clearCount = zones.filter(zone => !activeIncidents.some(i => i.zone === zone)).length;

    let avgResponse = '—';
    const resolvedIncidents = activeIncidents.filter(i => i.resolvedAt);
    if (resolvedIncidents.length > 0) {
      let totalMinutes = 0;
      let validCount = 0;
      resolvedIncidents.forEach(i => {
        if (i.createdAt && i.resolvedAt) {
          const start = i.createdAt.toDate ? i.createdAt.toDate() : new Date(i.createdAt);
          const end = i.resolvedAt.toDate ? i.resolvedAt.toDate() : new Date(i.resolvedAt);
          totalMinutes += (end - start) / 60000;
          validCount++;
        }
      });
      if (validCount > 0) {
        avgResponse = Math.round(totalMinutes / validCount) + 'm';
      }
    }

    return {
      incidents: incidentCount,
      deployed: `${deployedCount}/${totalStaff}`,
      zonesClear: `${clearCount}/5`,
      avgResponse,
      incidentColor: incidentCount === 0 ? 'var(--accent-green)' : 'var(--accent-alert)',
      incidentBg: incidentCount === 0 ? 'var(--accent-green-light)' : 'var(--accent-alert-light)',
    };
  }, [activeIncidents, allStaff]);

  useEffect(() => {
    if (val1Ref.current) val1Ref.current.innerText = metrics.incidents;
    if (val2Ref.current) val2Ref.current.innerText = metrics.deployed;
    if (val3Ref.current) val3Ref.current.innerText = metrics.zonesClear;
    if (val4Ref.current) val4Ref.current.innerText = metrics.avgResponse;
  }, [metrics]);

  const cards = [
    {
      title: 'Active Incidents',
      icon: AlertTriangle,
      color: metrics.incidentColor,
      bgColor: metrics.incidentBg,
      ref: val1Ref,
      value: metrics.incidents,
      suffix: '',
    },
    {
      title: 'Staff Deployed',
      icon: Users,
      color: 'var(--accent-primary)',
      bgColor: 'var(--accent-primary-light)',
      ref: val2Ref,
      value: metrics.deployed,
      suffix: '',
    },
    {
      title: 'Zones Clear',
      icon: MapPin,
      color: 'var(--accent-green)',
      bgColor: 'var(--accent-green-light)',
      ref: val3Ref,
      value: metrics.zonesClear,
      suffix: '',
    },
    {
      title: 'Avg Response',
      icon: Clock,
      color: 'var(--accent-yellow)',
      bgColor: 'var(--accent-yellow-light)',
      ref: val4Ref,
      value: metrics.avgResponse,
      suffix: '',
    },
  ];

  return (
    <div ref={containerRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="glass-panel hover-glow"
          style={{
            padding: '1.5rem 1.75rem',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500, margin: 0 }}>{card.title}</p>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: card.bgColor,
              display: 'grid',
              placeItems: 'center',
            }}>
              <card.icon size={18} color={card.color} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
            <h2
              ref={card.ref}
              style={{
                fontSize: '2.5rem',
                margin: 0,
                fontWeight: 700,
                color: 'var(--text-main)',
                letterSpacing: '-0.03em',
                lineHeight: 1
              }}
            >
              {card.value}
            </h2>
            {card.suffix && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '0.25rem' }}>{card.suffix}</span>
            )}
          </div>
          <div style={{
            width: '40px',
            height: '3px',
            borderRadius: '2px',
            background: card.color,
            opacity: 0.5
          }} />
        </div>
      ))}
    </div>
  );
}
