'use client';

import React from 'react';
import { Sphere, Line } from '@react-three/drei';
import type { SceneEvent } from '@/src/lib/rehearse/types';

interface WindCellEntityProps {
  event: SceneEvent;
}

export default function WindCellEntity({ event }: WindCellEntityProps) {
  const { payload } = event;
  // Extract position, direction, and intensity if available
  const position = payload.position || { x: 0, y: 0, z: 0 };
  const direction = payload.direction || null;
  const intensity = typeof payload.intensity === 'number' ? payload.intensity : 0.5;
  // Color map: blue (low) to red (high)
  const color = intensity > 0.7 ? 'red' : intensity > 0.4 ? 'orange' : 'blue';
  return (
    <group position={[position.x, position.y, position.z]}>
      <Sphere args={[0.15, 16, 16]}>
        <meshStandardMaterial color={color} transparent opacity={0.5} wireframe={!!payload.wireframe} />
      </Sphere>
      {direction && (
        <Line
          points={[[0, 0, 0], [direction.x * 0.5, direction.y * 0.5, direction.z * 0.5]]}
          color={color}
          lineWidth={2}
        />
      )}
    </group>
  );
}
