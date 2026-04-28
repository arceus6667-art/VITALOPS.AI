import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import FloorMesh from './FloorMesh';
import { useVenue } from '../../context/VenueContext';
import { FLOOR_DATA } from '../../data/floorData';
import * as THREE from 'three';

// Blueprint grid
function BlueprintGrid() {
  return (
    <group position={[0, -2.05, 0]}>
      <gridHelper args={[60, 60, '#0a3a5f', '#071a2f']} />
      <gridHelper args={[60, 12, '#00b8d4', '#072030']} />
    </group>
  );
}

// Red pulsing incident marker positioned over an affected zone
function IncidentMarker({ position }) {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime();
      meshRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.15);
      meshRef.current.material.opacity = 0.6 + Math.sin(t * 3) * 0.3;
    }
  });
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.35, 12, 12]} />
      <meshStandardMaterial
        color="#ef4444"
        emissive="#ef4444"
        emissiveIntensity={2}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

// Camera that follows floor selection
function SmartCamera() {
  const { selectedFloor, viewMode } = useVenue();
  const controlsRef = useRef();
  const { camera } = useThree();

  useFrame(() => {
    if (!controlsRef.current) return;

    let targetPos, lookAt;

    if (selectedFloor !== null) {
      const yBase = viewMode === 'exploded' ? selectedFloor * 6 : selectedFloor * 4;
      targetPos = new THREE.Vector3(15, yBase + 10, 15);
      lookAt = new THREE.Vector3(0, yBase, 0);
    } else {
      targetPos = new THREE.Vector3(18, 16, 18);
      lookAt = new THREE.Vector3(0, 6, 0);
    }

    camera.position.lerp(targetPos, 0.03);
    controlsRef.current.target.lerp(lookAt, 0.03);
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      minDistance={5}
      maxDistance={50}
      maxPolarAngle={Math.PI / 2.1}
    />
  );
}

// Zone name → approximate world position for incident markers
const ZONE_POSITIONS = {
  'Lobby & Reception': [0, 0, 0],
  'Ballroom': [-3, 4, -2],
  'Conference Wing': [2, 4, 2],
  'Guest Rooms': [0, 8, 0],
  'Pool & Recreation': [0, 12, 0],
};

export default function HospitalScene() {
  const { visibleFloors, activeIncidents } = useVenue();

  // Collect unique zones with active incidents
  const incidentZones = useMemo(() => {
    const zones = new Set(activeIncidents.map(i => i.zone));
    return Array.from(zones)
      .filter(z => ZONE_POSITIONS[z])
      .map(z => ({ zone: z, pos: ZONE_POSITIONS[z] }));
  }, [activeIncidents]);

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      background: '#050810'
    }}>
      <Canvas
        camera={{ position: [18, 16, 18], fov: 45, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        style={{ width: '100%', height: '100%' }}
        onCreated={({ gl }) => {
          gl.setClearColor('#050810');
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
        <directionalLight position={[-8, 15, -8]} intensity={0.6} />
        <pointLight position={[-10, 10, -10]} color="#00f3ff" intensity={1.5} distance={50} />
        <pointLight position={[10, 8, -5]} color="#a855f7" intensity={0.8} distance={40} />
        <pointLight position={[0, 20, 0]} color="#ffffff" intensity={0.8} distance={60} />

        <Suspense fallback={null}>
          {/* Venue floors */}
          <group position={[0, -2, 0]}>
            {FLOOR_DATA.map(floor =>
              visibleFloors.has(floor.level) && (
                <FloorMesh key={floor.level} floor={floor} />
              )
            )}
          </group>

          {/* Incident overlays — pulsing red spheres */}
          {incidentZones.map(({ zone, pos }) => (
            <IncidentMarker
              key={zone}
              position={[pos[0], pos[1] + 1.5, pos[2]]}
            />
          ))}

          {/* Grid */}
          <BlueprintGrid />

          {/* Camera */}
          <SmartCamera />
        </Suspense>
      </Canvas>
    </div>
  );
}
