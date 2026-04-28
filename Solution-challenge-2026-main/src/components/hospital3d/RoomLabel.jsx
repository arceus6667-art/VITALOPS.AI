import React, { useMemo } from 'react';
import * as THREE from 'three';

// Simple billboarded sprite label (no external font loading)
export default function RoomLabel({ room }) {
  const labelPos = [
    room.pos[0],
    room.pos[1] + room.size[1] / 2 + 0.6,
    room.pos[2]
  ];

  // Create a canvas texture for the label
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(room.name, canvas.width / 2, canvas.height / 2);
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [room.name]);

  return (
    <sprite position={labelPos} scale={[2, 0.5, 1]}>
      <spriteMaterial 
        map={texture} 
        transparent={true} 
        opacity={0.7}
        depthTest={false}
      />
    </sprite>
  );
}
