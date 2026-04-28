import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useVenue } from '../../context/VenueContext';

export default function RoomBox({ room, floorLevel }) {
  const meshRef = useRef();
  const edgesRef = useRef();
  const { selectedRoom, setSelectedRoom, setHoveredRoom, liveMode, getRoomStats } = useVenue();
  const [hovered, setHovered] = useState(false);

  const isSelected = selectedRoom === room.id;
  const stats = useMemo(() => getRoomStats(room.id), [room.id, getRoomStats]);
  const baseColor = useMemo(() => new THREE.Color(room.color), [room.color]);
  
  // Pre-compute edge geometry for wireframe outline
  const edgesGeometry = useMemo(() => {
    const box = new THREE.BoxGeometry(...room.size);
    return new THREE.EdgesGeometry(box);
  }, [room.size]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Scale animation
    const targetScale = isSelected ? 1.08 : hovered ? 1.04 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

    // Emissive pulse
    if (stats.status === 'critical') {
      meshRef.current.material.emissiveIntensity = 0.6 + Math.sin(time * 6) * 0.4;
    } else if (liveMode) {
      meshRef.current.material.emissiveIntensity = 0.4 + Math.sin(time * 2 + floorLevel) * 0.15;
    } else {
      meshRef.current.material.emissiveIntensity = hovered ? 0.5 : 0.3;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    setSelectedRoom(isSelected ? null : room.id);
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    setHoveredRoom(room.id);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    setHoveredRoom(null);
    document.body.style.cursor = 'default';
  };

  return (
    <group>
      {/* Main box */}
      <mesh
        ref={meshRef}
        position={room.pos}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={room.size} />
        <meshStandardMaterial
          color={baseColor}
          transparent={true}
          opacity={hovered || isSelected ? 0.85 : 0.65}
          emissive={baseColor}
          emissiveIntensity={0.3}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>

      {/* Wireframe edges via native Three.js (no drei dependency) */}
      <lineSegments ref={edgesRef} position={room.pos} geometry={edgesGeometry}>
        <lineBasicMaterial 
          color={isSelected ? '#ffffff' : room.color} 
          transparent={true}
          opacity={isSelected ? 0.8 : 0.4}
        />
      </lineSegments>
    </group>
  );
}
