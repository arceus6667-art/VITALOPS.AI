import React, { useRef } from 'react';
import { Settings2, Activity, Users } from 'lucide-react';
import { useVenue } from '../context/VenueContext';
import gsap from 'gsap';

export default function SimulationControls({ simState, setSimState }) {
  const containerRef = useRef(null);
  const { t } = useVenue();

  const handleInflowChange = (e) => {
    setSimState(prev => ({ ...prev, inflow: parseInt(e.target.value) }));
  };

  const handleEmergencyChange = (e) => {
    setSimState(prev => ({ ...prev, emergency: parseInt(e.target.value) }));
  };

  return (
    <div ref={containerRef} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: 'var(--radius-sm)',
          background: 'var(--accent-primary-light)', display: 'grid', placeItems: 'center'
        }}>
          <Settings2 size={15} color="var(--accent-primary)" />
        </div>
        <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 600 }}>{t('sim.title')}</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Patient Inflow Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
              <Users size={13}/> {t('sim.patient_inflow')}
            </span>
            <span style={{ 
              fontSize: '0.82rem', 
              fontWeight: 700, 
              color: simState.inflow > 70 ? 'var(--accent-yellow)' : 'var(--text-main)',
              background: simState.inflow > 70 ? 'var(--accent-yellow-light)' : 'var(--bg-surface)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)'
            }}>
              {simState.inflow}%
            </span>
          </div>
          <input
            type="range" 
            min="0" max="100" 
            value={simState.inflow}
            onChange={handleInflowChange}
            style={{ width: '100%' }}
          />
        </div>

        {/* Emergency Trauma Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
              <Activity size={13}/> {t('sim.emergency')}
            </span>
            <span style={{ 
              fontSize: '0.82rem', 
              fontWeight: 700, 
              color: simState.emergency > 70 ? 'var(--accent-alert)' : 'var(--text-main)',
              background: simState.emergency > 70 ? 'var(--accent-alert-light)' : 'var(--bg-surface)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)'
            }}>
              {simState.emergency}%
            </span>
          </div>
          <input 
            type="range" 
            min="0" max="100" 
            value={simState.emergency}
            onChange={handleEmergencyChange}
            style={{ width: '100%' }}
          />
        </div>
      </div>
      
      <div style={{ 
        marginTop: '1.5rem', 
        padding: '0.85rem 1rem', 
        background: 'var(--bg-surface)', 
        borderRadius: 'var(--radius-sm)', 
        border: '1px solid var(--border-glass)' 
      }}>
        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {t('sim.description')}
        </p>
      </div>
    </div>
  );
}
