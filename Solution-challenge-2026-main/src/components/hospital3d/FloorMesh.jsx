import React from 'react';
import RoomBox from './RoomBox';
import RoomLabel from './RoomLabel';
import { useVenue } from '../../context/VenueContext';

export default function FloorMesh({ floor }) {
  const { viewMode, selectedFloor } = useVenue();

  // Vertical spacing for exploded view
  const verticalOffset = viewMode === 'exploded' ? floor.level * 6 : floor.level * 4;

  return (
    <group position={[0, verticalOffset, 0]}>
      {/* Floor Plate (Blueprint Slab) — more visible */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[25, 20]} />
        <meshStandardMaterial 
          color="#0c1e38" 
          transparent={true} 
          opacity={0.35} 
          side={2}
        />
      </mesh>

      {/* Floor plate outline for better visibility */}
      <mesh position={[0, -0.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[25.2, 20.2]} />
        <meshStandardMaterial 
          color="#00f3ff" 
          transparent={true} 
          opacity={0.06} 
          side={2}
          wireframe={true}
        />
      </mesh>

      {/* Floor level label */}
      {/* Rooms on this floor */}
      {floor.rooms.map(room => (
        <group key={room.id}>
          <RoomBox room={room} floorLevel={floor.level} />
          <RoomLabel room={room} />
        </group>
      ))}
    </group>
  );
}
