import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const WARD_DATA = [
  { id: 'F1-Triage', floor: 1, name: 'Triage F1', pos: [-1.5, 0.5, 0], scale: [2, 1, 3] },
  { id: 'F1-ER', floor: 1, name: 'Emergency F1', pos: [1.5, 0.5, 0], scale: [2, 1, 3] },
  { id: 'F2-ICU', floor: 2, name: 'ICU F2', pos: [-1.5, 1.6, 0], scale: [2, 1, 3] },
  { id: 'F2-Gen', floor: 2, name: 'Gen Ward F2', pos: [1.5, 1.6, 0], scale: [2, 1, 3] },
  { id: 'F3-Surg', floor: 3, name: 'Surgery F3', pos: [0, 2.7, 0], scale: [5, 1, 3] },
];

function WardBox({ data, simState, activeWard, setActiveWard }) {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);
  const isSelected = activeWard === data.id;

  // Real-time capacity algorithm directly tied to Simulation Panel!
  const capacity = useMemo(() => {
    let base = 50;
    if (data.name.includes('Triage') || data.name.includes('Emergency')) base += (simState.emergency * 0.5);
    if (data.name.includes('ICU') || data.name.includes('Surgery')) base += (simState.inflow * 0.3) + (simState.emergency * 0.4);
    if (data.name.includes('Gen')) base += (simState.inflow * 0.6);
    return Math.min(100, Math.floor(base + (Math.random() * 5)));
  }, [simState.inflow, simState.emergency, data.name]);

  // Determine material color thresholds
  let color = new THREE.Color("#00f3ff"); // Default neon blue (Safe)
  let emissive = new THREE.Color("#002233");
  let intensity = 0.5;

  if (capacity > 90) {
    color = new THREE.Color("#ff3366"); // Critical
    emissive = new THREE.Color("#ff0033");
    intensity = 1.2;
  } else if (capacity > 75) {
    color = new THREE.Color("#f59e0b"); // Warning
    emissive = new THREE.Color("#aa5500");
    intensity = 0.8;
  } else {
    color = new THREE.Color("#00ff66"); // Good
    emissive = new THREE.Color("#004411");
    intensity = 0.4;
  }

  // Pulsing animation for critical severity
  useFrame((state) => {
    if (meshRef.current) {
      if (capacity > 90) {
        const pulse = 1.2 + Math.sin(state.clock.elapsedTime * 4) * 0.5;
        meshRef.current.material.emissiveIntensity = pulse;
      } else {
        meshRef.current.material.emissiveIntensity = hovered ? intensity + 0.3 : intensity;
      }
      
      // Scale slightly if selected
      const targetScale = isSelected ? 1.05 : 1.0;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group position={data.pos} onClick={(e) => { e.stopPropagation(); setActiveWard(isSelected ? null : data.id); }} onPointerOver={(e) => { e.stopPropagation(); setHover(true); }} onPointerOut={() => setHover(false)}>
      <mesh ref={meshRef}>
        <boxGeometry args={data.scale} />
        <meshStandardMaterial 
          color={color} 
          emissive={emissive} 
          emissiveIntensity={intensity} 
          transparent={true} 
          opacity={hovered ? 0.9 : 0.6}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Floating UI HUD when selected */}
      {isSelected && (
        <Html position={[0, data.scale[1]/2 + 0.5, 0]} center zIndexRange={[100, 0]}>
          <div style={{ background: 'rgba(10, 14, 23, 0.9)', padding: '1rem', borderRadius: '12px', border: `1px solid ${capacity > 90 ? '#ff3366' : '#00f3ff'}`, display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '200px', backdropFilter: 'blur(10px)', color: '#fff', pointerEvents: 'none', boxShadow: `0 0 20px ${capacity > 90 ? '#ff336644' : '#00f3ff44'}`, transform: 'translateY(-10px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.25rem' }}>
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{data.name}</span>
              <span style={{ color: capacity > 90 ? '#ff3366' : '#00f3ff' }}>{capacity}% LOAD</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Beds Available: {Math.max(0, 100 - capacity)} <br/>
              Status: {capacity > 90 ? 'CRITICAL' : capacity > 75 ? 'WARNING' : 'NORMAL'}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function HospitalStructure({ simState }) {
  const [activeWard, setActiveWard] = useState(null);

  return (
    <group position={[0, -1, 0]}>
      {/* Base Grid */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#0a0e17" metalness={0.8} roughness={0.2} />
      </mesh>
      <gridHelper args={[10, 10, '#00f3ff', '#00f3ff44']} position={[0, 0, 0]} />

      {/* Wards */}
      {WARD_DATA.map(ward => (
        <WardBox key={ward.id} data={ward} simState={simState} activeWard={activeWard} setActiveWard={setActiveWard} />
      ))}
    </group>
  );
}

// Cinematic Camera Controller
function CameraRig() {
  useFrame((state) => {
    // Gentle floating camera effect
    const time = state.clock.getElapsedTime();
    state.camera.position.y = 5 + Math.sin(time * 0.5) * 0.2;
    state.camera.lookAt(0, 1, 0);
  });
  return null;
}

export default function Hospital3D({ simState }) {
  return (
    <div className="glass-panel" style={{ flex: 1, position: 'relative', overflow: 'hidden', padding: 0 }}>
      {/* UI Overlay */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.25rem' }}>Live Facility Map</h3>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Interactive WebGL 3D Visualization</p>
      </div>

      <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 10, display: 'flex', gap: '1rem', background: 'rgba(0,0,0,0.5)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: '10px', height: '10px', background: '#00ff66', borderRadius: '50%' }}></div> <span style={{ fontSize: '0.7rem' }}>Normal</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: '10px', height: '10px', background: '#f59e0b', borderRadius: '50%' }}></div> <span style={{ fontSize: '0.7rem' }}>Busy</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: '10px', height: '10px', background: '#ff3366', borderRadius: '50%' }}></div> <span style={{ fontSize: '0.7rem' }}>Critical</span></div>
      </div>

      {/* R3F Canvas */}
      <Canvas shadows camera={{ position: [8, 5, 8], fov: 45 }}>
        <color attach="background" args={['#05080f']} />
        
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-10, 5, -10]} intensity={0.5} color="#00f3ff" />
        
        <HospitalStructure simState={simState} />
        
        <OrbitControls 
          enablePan={false} 
          minDistance={5} 
          maxDistance={15} 
          maxPolarAngle={Math.PI / 2.1} 
        />
        <ContactShadows position={[0, -0.9, 0]} opacity={0.4} scale={15} blur={2} />
      </Canvas>
    </div>
  );
}
