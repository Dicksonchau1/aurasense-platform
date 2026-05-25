'use client';

import React from 'react';
import { Box } from '@react-three/drei';

interface DroneEntityProps {
  position: { x: number; y: number; z: number };
  heading?: number;
}

export const DroneEntity: React.FC<DroneEntityProps> = ({ position, heading = 0 }) => {
  return (
    <group position={[position.x, position.y, position.z]} rotation={[0, heading, 0]}>
      <Box args={[0.3, 0.08, 0.3]}>
        <meshStandardMaterial color="#3b82f6" />
      </Box>
      <mesh position={[0, 0.05, 0.18]}>
        <coneGeometry args={[0.04, 0.12, 8]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
    </group>
  );
};

export default DroneEntity;
