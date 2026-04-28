import React, { useRef, useEffect } from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useVenue } from '../../context/VenueContext';

export default function CameraController() {
  const { selectedFloor, selectedRoom, viewMode } = useVenue();
  const controlsRef = useRef();
  const { camera } = useThree();

  // Handle camera position based on selection
  useFrame((state) => {
    if (!controlsRef.current) return;

    let targetPos = new THREE.Vector3(15, 12, 15); // Default view pos
    let lookAtPos = new THREE.Vector3(0, 5, 0); // Default look at

    if (selectedFloor !== null) {
      const yBase = viewMode === 'exploded' ? selectedFloor * 6 : selectedFloor * 4;
      targetPos = new THREE.Vector3(12, yBase + 10, 12);
      lookAtPos = new THREE.Vector3(0, yBase + 2, 0);
    }
    
    // Smooth camera transition
    camera.position.lerp(targetPos, 0.05);
    controlsRef.current.target.lerp(lookAtPos, 0.05);
    controlsRef.current.update();
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[15, 12, 15]} fov={45} />
      <OrbitControls 
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        minDistance={5}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2.1}
        makeDefault
      />
    </>
  );
}
