'use client';

import React from 'react';
import { Box, Cylinder } from '@react-three/drei';

interface DroneStructureMeshProps {
  structure_type: 'bridge' | 'wind_turbine' | 'building_facade' | 'pipeline';
  dimensions?: { w: number; h: number; d: number };
  gltf_url?: string;
}

export const DroneStructureMesh: React.FC<DroneStructureMeshProps> = ({ structure_type, dimensions, gltf_url }) => {
  // Placeholder: use Box or Cylinder based on structure_type
  if (gltf_url) {
    // TODO: Load GLTF with useGLTF
    return <primitive object={null} />;
  }
  if (structure_type === 'wind_turbine' || structure_type === 'pipeline') {
    return (
      <group>
        <Cylinder args={[dimensions?.w || 1, dimensions?.w || 1, dimensions?.h || 5, 32]}>
          <meshStandardMaterial attach="material" color="lightblue" />
        </Cylinder>
        {/* Label */}
        <mesh position={[0, (dimensions?.h || 5) / 2 + 0.5, 0]}>
          <boxGeometry args={[2, 0.5, 0.5]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      </group>
    );
  }
  // Default: box
  return (
    <group>
      <Box args={[dimensions?.w || 3, dimensions?.h || 2, dimensions?.d || 1]}>
        <meshStandardMaterial attach="material" color="lightgreen" />
      </Box>
      {/* Label */}
      <mesh position={[0, (dimensions?.h || 2) / 2 + 0.5, 0]}>
        <boxGeometry args={[2, 0.5, 0.5]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </group>
  );
};
