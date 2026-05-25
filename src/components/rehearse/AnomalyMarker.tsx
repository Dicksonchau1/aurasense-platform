'use client';

import React from 'react';
import { Sphere, Html } from '@react-three/drei';
import type { SceneEvent } from '@/src/lib/rehearse/types';

interface AnomalyMarkerProps {
  event: SceneEvent;
}

export default function AnomalyMarker({ event }: AnomalyMarkerProps) {
  const { payload } = event;
  const position = payload.position || { x: 0, y: 0, z: 0 };
  const message = payload.message || '';
  // Pulsing effect via scale animation (optional, static for now)
  return (
    <group position={[position.x, position.y, position.z]}>
      <Sphere args={[0.12, 16, 16]}>
        <meshStandardMaterial color="red" emissive="red" opacity={0.8} transparent />
      </Sphere>
      {message && (
        <Html distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div style={{ background: 'rgba(255,0,0,0.8)', color: 'white', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>
            {message}
          </div>
        </Html>
      )}
    </group>
  );
}
