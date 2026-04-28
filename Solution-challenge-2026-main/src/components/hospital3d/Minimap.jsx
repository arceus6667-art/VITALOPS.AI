import React, { useMemo } from 'react';
import { useVenue } from '../../context/VenueContext';
import { FLOOR_DATA } from '../../data/floorData';
import { Navigation } from 'lucide-react';

const panelStyle = {
  background: 'rgba(5, 8, 16, 0.88)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(0, 243, 255, 0.12)',
  borderRadius: '12px',
};

export default function Minimap() {
  const { selectedFloor, selectedRoom, setSelectedRoom } = useVenue();

  // If no floor is focused, default to Ground Floor for minimap
  const currentFloorLevel = selectedFloor !== null ? selectedFloor : 0;
  const floorData = useMemo(() => FLOOR_DATA.find(f => f.level === currentFloorLevel), [currentFloorLevel]);

  if (!floorData) return null;

  // Normalize room coordinates to fit in the minimap square (0-100 range)
  // Our model space is roughly -12.5 to 12.5 (width 25) and -10 to 10 (depth 20)
  const mapRooms = useMemo(() => {
    return floorData.rooms.map(room => {
      const x = ((room.pos[0] + 12.5) / 25) * 100;
      const z = ((room.pos[2] + 10) / 20) * 100;
      const w = (room.size[0] / 25) * 100;
      const h = (room.size[2] / 20) * 100;
      
      return { ...room, x, z, w, h };
    });
  }, [floorData]);

  return (
    <div 
      style={{ 
        ...panelStyle,
        position: 'absolute', 
        bottom: '2rem', 
        left: '2rem', 
        width: '200px', 
        height: '200px', 
        zIndex: 10,
        padding: '0.5rem',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
        <Navigation size={11} color="#2dd4bf" />
        <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Minimap • {floorData.shortName}
        </span>
      </div>

      <div style={{ flex: 1, position: 'relative', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', border: '1px solid rgba(0,243,255,0.08)' }}>
        {mapRooms.map(room => (
          <div 
            key={room.id}
            onClick={() => setSelectedRoom(room.id)}
            style={{ 
              position: 'absolute',
              left: `${room.x - room.w/2}%`,
              top: `${room.z - room.h/2}%`,
              width: `${room.w}%`,
              height: `${room.h}%`,
              background: selectedRoom === room.id ? '#2dd4bf' : room.color,
              opacity: selectedRoom === room.id ? 0.9 : 0.45,
              border: `1px solid ${selectedRoom === room.id ? '#fff' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '1px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title={room.name}
          />
        ))}
        {/* Camera indicator */}
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
           <div style={{ width: '4px', height: '4px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 10px #fff' }} />
        </div>
      </div>
    </div>
  );
}
