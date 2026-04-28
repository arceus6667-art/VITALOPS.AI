import React, { useMemo } from 'react';
import { useVenue } from '../../context/VenueContext';
import { X, Users, Activity, Package, ShieldCheck, AlertTriangle, Bed } from 'lucide-react';
import { FLOOR_DATA } from '../../data/floorData';

const panelStyle = {
  background: 'rgba(5, 8, 16, 0.88)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(0, 243, 255, 0.12)',
  borderRadius: '12px',
};

export default function RoomDetailPanel() {
  const { selectedRoom, setSelectedRoom, getRoomStats, t } = useVenue();

  const roomData = useMemo(() => {
    if (!selectedRoom) return null;
    for (const floor of FLOOR_DATA) {
      const room = floor.rooms.find(r => r.id === selectedRoom);
      if (room) return { ...room, floorName: floor.name };
    }
    return null;
  }, [selectedRoom]);

  const stats = useMemo(() => {
    return selectedRoom ? getRoomStats(selectedRoom) : null;
  }, [selectedRoom, getRoomStats]);

  if (!roomData || !stats) return null;

  const isCritical = stats.status === 'critical';

  return (
    <div 
      style={{ 
        ...panelStyle,
        position: 'absolute', 
        top: '2rem', 
        right: '2rem', 
        width: '310px', 
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 12rem)',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{ 
        padding: '1.25rem', 
        borderBottom: '1px solid rgba(255,255,255,0.06)', 
        background: isCritical ? 'rgba(255, 51, 102, 0.08)' : 'rgba(0, 243, 255, 0.04)', 
        position: 'relative',
        borderRadius: '12px 12px 0 0'
      }}>
        <button 
          onClick={() => setSelectedRoom(null)}
          style={{ position: 'absolute', top: '1rem', right: '1rem', color: '#94a3b8', cursor: 'pointer' }}
        >
          <X size={18} />
        </button>
        
        <p style={{ margin: 0, fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
          {roomData.floorName} • {roomData.department}
        </p>
        <h2 style={{ margin: '0.25rem 0 0 0', fontSize: '1.15rem', color: isCritical ? '#ff3366' : '#e2e8f0', fontWeight: 700 }}>
          {roomData.name}
        </h2>
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{t('ui.status')}</span>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '0.4rem', 
            color: isCritical ? '#ff3366' : '#00ff66', fontWeight: 700,
            background: isCritical ? 'rgba(255,51,102,0.1)' : 'rgba(0,255,102,0.08)',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontSize: '0.78rem'
          }}>
            {isCritical ? <AlertTriangle size={13} /> : <ShieldCheck size={13} />}
            {stats.status.toUpperCase()}
          </div>
        </div>

        {/* Patient Count */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Users size={13} /> {t('ui.patient_count')}
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0' }}>{stats.patientCount} / {stats.capacity}</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
            <div 
              style={{ 
                width: `${(stats.patientCount / stats.capacity) * 100}%`, 
                height: '100%', 
                background: isCritical ? '#ff3366' : '#2dd4bf',
                boxShadow: isCritical ? '0 0 10px rgba(255,51,102,0.4)' : '0 0 10px rgba(45,212,191,0.3)',
                borderRadius: '3px',
                transition: 'width 0.5s ease'
              }} 
            />
          </div>
        </div>

        {/* Bed Info (if available) */}
        {roomData.beds && (
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.75rem', background: 'rgba(45,212,191,0.05)',
            borderRadius: '8px', border: '1px solid rgba(45,212,191,0.08)'
          }}>
            <Bed size={16} color="#2dd4bf" />
            <div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>Total Beds</p>
              <p style={{ margin: 0, fontSize: '1.15rem', color: '#2dd4bf', fontWeight: 700 }}>{roomData.beds}</p>
            </div>
          </div>
        )}

        {/* Equipment Status */}
        <div>
          <h4 style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
            <Activity size={13} /> {t('ui.equipment')}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {stats.equipment.map((item, idx) => (
              <div key={idx} style={{ 
                padding: '0.55rem 0.75rem', 
                background: 'rgba(255,255,255,0.03)', 
                borderRadius: '6px', fontSize: '0.78rem', 
                display: 'flex', justifyContent: 'space-between', 
                border: '1px solid rgba(255,255,255,0.04)',
                color: '#c1c8da'
              }}>
                <span>{item.name}</span>
                <span style={{ 
                  color: item.status === 'Functional' ? '#00ff66' : '#ff3366',
                  fontWeight: 600, fontSize: '0.72rem'
                }}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stock / Logistics (Conditional) */}
        {(roomData.category === 'utility' || roomData.id.includes('PHARMACY')) && (
          <div>
            <h4 style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
              <Package size={13} /> Stock Integrity
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.8rem', color: stats.stockLevel < 50 ? '#f59e0b' : '#00ff66', fontWeight: 700 }}>
                {stats.stockLevel}%
              </h2>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Essential supplies tracked via real-time IOT sensors.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
        <button style={{ 
          width: '100%', padding: '0.6rem', 
          border: '1px solid rgba(45,212,191,0.3)', borderRadius: '8px', 
          color: '#2dd4bf', fontSize: '0.82rem', fontWeight: 600, 
          cursor: 'pointer', background: 'rgba(45,212,191,0.05)',
          transition: 'all 0.15s ease'
        }}>
          View Full Sector Logs
        </button>
      </div>
    </div>
  );
}
