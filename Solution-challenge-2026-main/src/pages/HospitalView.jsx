import React, { useState, useEffect } from 'react';
import HospitalScene from '../components/hospital3d/HospitalScene';
import FloorControls from '../components/hospital3d/FloorControls';
import RoomDetailPanel from '../components/hospital3d/RoomDetailPanel';
import Minimap from '../components/hospital3d/Minimap';
import { useVenue } from '../context/VenueContext';
import { Clock, Wifi, Cpu } from 'lucide-react';

export default function HospitalView() {
  const { t } = useVenue();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ 
      flex: 1, display: 'flex', flexDirection: 'column', 
      height: '100%', minHeight: 0, overflow: 'hidden', gap: '0'
    }}>
      {/* 3D Container — fixed height ensures Canvas renders */}
      <div style={{ 
        position: 'relative', 
        height: 'calc(100vh - 120px)',
        minHeight: '500px',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border-glass)',
        background: '#050810'
      }}>
        <HospitalScene />
        
        {/* Title Overlay */}
        <div style={{ 
          position: 'absolute', top: '1.25rem', left: '50%', 
          transform: 'translateX(-50%)', zIndex: 10, textAlign: 'center', pointerEvents: 'none'
        }}>
          <h1 style={{ 
            fontSize: '1.1rem', margin: 0, 
            textShadow: '0 0 20px rgba(0, 243, 255, 0.5)',
            color: '#2dd4bf', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700
          }}>
            {t('h3d.title')}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.7rem', margin: '0.2rem 0 0 0', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            {t('h3d.subtitle')}
          </p>
        </div>
        
        <FloorControls />
        <RoomDetailPanel />
        <Minimap />

        {/* Legend */}
        <div style={{
          position: 'absolute', bottom: '1rem', right: '1rem', zIndex: 10,
          display: 'flex', gap: '1rem',
          background: 'rgba(5, 8, 16, 0.8)', padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0, 243, 255, 0.12)',
          backdropFilter: 'blur(8px)'
        }}>
          {[
            { color: '#00ff66', key: 'h3d.legend_normal' },
            { color: '#f59e0b', key: 'h3d.legend_warning' },
            { color: '#ff3366', key: 'h3d.legend_critical' },
            { color: '#a855f7', key: 'h3d.legend_specialized' },
            { color: '#00f3ff', key: 'h3d.legend_admin' },
          ].map(item => (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <div style={{ width: '8px', height: '8px', background: item.color, borderRadius: '50%', boxShadow: `0 0 6px ${item.color}40` }}></div>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{t(item.key)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Ticker */}
      <div className="glass-panel" style={{ 
        height: '40px', flexShrink: 0, display: 'flex', alignItems: 'center', 
        padding: '0 1.5rem', fontSize: '0.75rem', gap: '2rem',
        borderRadius: '0 0 var(--radius-md) var(--radius-md)', marginTop: '-1px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Wifi size={12} color="var(--accent-green)" />
          <span style={{ color: 'var(--text-muted)' }}>{t('h3d.latency')}: <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>12ms</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu size={12} color="var(--accent-primary)" />
          <span style={{ color: 'var(--text-muted)' }}>{t('h3d.active_nodes')}: <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>142</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="live-dot" style={{ width: '5px', height: '5px' }} />
          <span style={{ color: 'var(--text-muted)' }}>{t('h3d.floors_sectors')}</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <Clock size={12} />
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{currentTime.toLocaleTimeString()} • {t('h3d.webgl_active')}</span>
        </div>
      </div>
    </div>
  );
}
