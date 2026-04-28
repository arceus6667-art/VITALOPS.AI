import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function BedTracking() {
  const gridRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(gridRef.current.children,
      { opacity: 0, scale: 0.8, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.02, ease: 'power2.out', delay: 1 }
    );
  }, []);

  // Generate 24 beds with randomized status
  const beds = Array.from({ length: 24 }).map((_, i) => {
    const random = Math.random();
    let status = 'available'; // Default
    if (random > 0.4) status = 'occupied_stable';
    if (random > 0.85) status = 'critical';
    if (random > 0.95) status = 'maintenance';
    return { id: `B-${100 + i}`, status };
  });

  const getStatusProps = (status) => {
    switch(status) {
      case 'occupied_stable': return { bg: 'rgba(0, 243, 255, 0.1)', border: 'var(--accent-blue)', label: 'Stable' };
      case 'critical': return { bg: 'rgba(255, 51, 102, 0.15)', border: 'var(--accent-alert)', label: 'Critical' };
      case 'maintenance': return { bg: 'rgba(245, 158, 11, 0.1)', border: '#f59e0b', label: 'Maint.' };
      default: return { bg: 'rgba(255, 255, 255, 0.02)', border: 'rgba(255, 255, 255, 0.1)', label: 'Avail' };
    }
  };

  return (
    <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', margin: 0 }}>Ward 4 - ICU Bed Tracking</h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)', background: 'rgba(0,255,102,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Live</span>
      </div>

      <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem', flex: 1 }}>
        {beds.map((bed, i) => {
          const props = getStatusProps(bed.status);
          const isCritical = bed.status === 'critical';
          return (
            <div key={i} style={{ 
              background: props.bg, 
              border: `1px solid ${props.border}`, 
              borderRadius: '8px', 
              padding: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, { scale: 1.05, duration: 0.2 });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, { scale: 1, duration: 0.2 });
            }}
            >
              {isCritical && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, boxShadow: 'inset 0 0 15px rgba(255,51,102,0.5)', pointerEvents: 'none' }}>
                  <style>{`
                    @keyframes pulseAlert { 0% { opacity: 0.3; } 50% { opacity: 0.8; } 100% { opacity: 0.3; } }
                  `}</style>
                  <div style={{ width: '100%', height: '100%', animation: 'pulseAlert 1.5s infinite' }}></div>
                </div>
              )}
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', position: 'relative', zIndex: 1 }}>{bed.id}</span>
              <span style={{ fontSize: '0.65rem', color: bed.status === 'available' ? 'var(--text-muted)' : props.border, alignSelf: 'flex-end', position: 'relative', zIndex: 1 }}>
                {props.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  );
}
