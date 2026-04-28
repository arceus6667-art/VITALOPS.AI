import React from 'react';
import { useVenue } from '../../context/VenueContext';
import { Layers, Activity, RotateCcw, Box, Crosshair } from 'lucide-react';
import { FLOOR_DATA } from '../../data/floorData';

const panelStyle = {
  background: 'rgba(5, 8, 16, 0.88)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(0, 243, 255, 0.12)',
  borderRadius: '12px',
};

export default function FloorControls() {
  const { 
    visibleFloors, 
    toggleFloorVisibility, 
    selectedFloor, 
    focusFloor, 
    viewMode, 
    setViewMode, 
    liveMode, 
    setLiveMode, 
    resetView,
    t
  } = useVenue();

  return (
    <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Floor Controls */}
      <div style={{ ...panelStyle, padding: '1.25rem', width: '230px' }}>
        <h3 style={{ 
          fontSize: '0.78rem', color: '#2dd4bf', marginBottom: '1rem', 
          display: 'flex', alignItems: 'center', gap: '0.5rem', 
          textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 
        }}>
          <Layers size={14} /> {t('ui.floor_controls')}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {FLOOR_DATA.map(floor => {
            const isFocused = selectedFloor === floor.level;
            const isVisible = visibleFloors.has(floor.level);
            return (
              <div key={floor.level} style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.5rem 0.6rem',
                borderRadius: '8px',
                background: isFocused ? 'rgba(45, 212, 191, 0.1)' : 'transparent',
                transition: 'background 0.15s ease'
              }}>
                <button 
                  onClick={() => focusFloor(floor.level)}
                  style={{ 
                    fontSize: '0.82rem', 
                    color: isFocused ? '#2dd4bf' : '#e2e8f0',
                    fontWeight: isFocused ? 700 : 400,
                    flex: 1,
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ 
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: isFocused ? '#2dd4bf' : isVisible ? '#00ff66' : '#475569',
                    boxShadow: isFocused ? '0 0 8px rgba(45, 212, 191, 0.5)' : 'none',
                    transition: 'all 0.2s ease'
                  }} />
                  {t(`floor.${floor.level}`)}
                </button>
                <input 
                  type="checkbox" 
                  checked={isVisible}
                  onChange={() => toggleFloorVisibility(floor.level)}
                  style={{ accentColor: '#2dd4bf', width: '14px', height: '14px', cursor: 'pointer' }}
                />
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <button 
            onClick={() => setViewMode(viewMode === 'exploded' ? 'stacked' : 'exploded')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', 
              fontSize: '0.82rem', cursor: 'pointer', padding: '0.4rem 0.5rem',
              borderRadius: '6px',
              color: viewMode === 'exploded' ? '#2dd4bf' : '#e2e8f0',
              background: viewMode === 'exploded' ? 'rgba(45, 212, 191, 0.08)' : 'transparent',
              transition: 'all 0.15s ease'
            }}
          >
            <Box size={15} /> {t('ui.exploded_view')}
          </button>
          
          <button 
            onClick={() => setLiveMode(!liveMode)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', 
              fontSize: '0.82rem', cursor: 'pointer', padding: '0.4rem 0.5rem',
              borderRadius: '6px',
              color: liveMode ? '#00ff66' : '#e2e8f0',
              background: liveMode ? 'rgba(0, 255, 102, 0.06)' : 'transparent',
              transition: 'all 0.15s ease'
            }}
          >
            <Activity size={15} className={liveMode ? 'animate-breathing' : ''} /> {t('ui.live_mode')}
          </button>

          <button 
            onClick={resetView}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', 
              fontSize: '0.82rem', color: '#94a3b8', cursor: 'pointer',
              padding: '0.4rem 0.5rem', borderRadius: '6px',
              transition: 'color 0.15s ease'
            }}
          >
            <RotateCcw size={15} /> {t('ui.reset_view')}
          </button>
        </div>
      </div>

      {/* Legend Block */}
      <div style={{ ...panelStyle, padding: '0.85rem 1rem', width: '230px' }}>
        <h4 style={{ fontSize: '0.68rem', color: '#94a3b8', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{t('ui.sector_legend')}</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
          {[
            { color: '#ff3366', label: 'Emergency' },
            { color: '#00ff66', label: 'Ward' },
            { color: '#00f3ff', label: 'OPD / Admin' },
            { color: '#f59e0b', label: 'Utility' },
            { color: '#a855f7', label: 'Specialized' },
            { color: '#ec4899', label: 'Maternity' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: '#c1c8da' }}>
              <div style={{ width: '8px', height: '8px', background: item.color, borderRadius: '2px', boxShadow: `0 0 4px ${item.color}40` }}></div>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
