'use client';
// src/components/rehearse/DroneInspectionScene.tsx
// React-Three-Fiber 3D rehearse scene for drone-inspection domain
// Architectural Lock #4 (2026-05-22) — PR C headline component

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Html, Environment } from '@react-three/drei';
import * as THREE from 'three';
import type { SceneEntity } from '@/lib/orchestrator/PolygonEngineOrchestrator';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DroneInspectionSceneProps {
  wsUrl?: string; // WebSocket URL for SceneMessage stream
  initialEntities?: SceneEntity[];
}

type EntityMap = Record<string, SceneEntity>;

// ─── Scene Entity Renderers ───────────────────────────────────────────────────

function ProjectedTrajectory({ entity }: { entity: SceneEntity }) {
  const points = (entity.points as [number, number, number][] | undefined) ?? [];
  if (points.length < 2) return null;
  const vectors = points.map(([x, y, z]) => new THREE.Vector3(x, y, z));
  return (
    <Line
      points={vectors}
      color={entity.color as number ?? 0x00ff88}
      lineWidth={2}
      transparent
      opacity={entity.opacity as number ?? 0.85}
    />
  );
}

function WindCellArrow({ entity }: { entity: SceneEntity }) {
  const pos = (entity.position as [number, number, number] | undefined) ?? [0, 0, 0];
  const dir = (entity.direction as [number, number, number] | undefined) ?? [0, 1, 0];
  return (
    <group position={pos}>
      <arrowHelper
        args={[
          new THREE.Vector3(...dir).normalize(),
          new THREE.Vector3(0, 0, 0),
          entity.magnitude as number ?? 1,
          entity.color as number ?? 0x88ccff,
        ]}
      />
    </group>
  );
}

function WarningMarker({ entity }: { entity: SceneEntity }) {
  const pos = (entity.position as [number, number, number] | undefined) ?? [0, 5, 0];
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial color={entity.color as number ?? 0xff4400} emissive={0xff2200} emissiveIntensity={0.5} />
      </mesh>
      <Html center>
        <div style={{
          background: 'rgba(255,68,0,0.85)',
          color: '#fff',
          padding: '4px 8px',
          borderRadius: 4,
          fontSize: 11,
          maxWidth: 180,
          whiteSpace: 'pre-wrap',
        }}>
          {String(entity.label ?? 'Anomaly')}
        </div>
      </Html>
    </group>
  );
}

function SignaturePrior({ entity }: { entity: SceneEntity }) {
  const pos = (entity.position as [number, number, number] | undefined) ?? [0, 0, 0];
  return (
    <group position={pos}>
      <mesh>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial
          color={entity.color as number ?? 0x4488ff}
          transparent
          opacity={entity.opacity as number ?? 0.35}
        />
      </mesh>
    </group>
  );
}

function DroneEntity() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.4, 0.1, 0.4]} />
        <meshStandardMaterial color={0x222222} />
      </mesh>
      {/* Arm stubs */}
      {[[-0.3, 0, -0.3], [0.3, 0, -0.3], [-0.3, 0, 0.3], [0.3, 0, 0.3]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshStandardMaterial color={0x888888} />
        </mesh>
      ))}
    </group>
  );
}

function BridgeStructure() {
  // Simplified suspension bridge truss — Tsing Ma style placeholder
  return (
    <group>
      {/* Deck */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[20, 0.2, 2]} />
        <meshStandardMaterial color={0x888888} />
      </mesh>
      {/* Towers */}
      {[-8, 8].map((x, i) => (
        <mesh key={i} position={[x, 4, 0]}>
          <boxGeometry args={[0.4, 8, 0.4]} />
          <meshStandardMaterial color={0x666666} />
        </mesh>
      ))}
      {/* Cables */}
      {[-8, 8].map((x, i) => (
        <Line
          key={i}
          points={[
            new THREE.Vector3(x, 8, 0),
            new THREE.Vector3(0, 5, 0),
            new THREE.Vector3(-x, 8, 0),
          ]}
          color={0x999999}
          lineWidth={1}
        />
      ))}
    </group>
  );
}

// ─── Entity Router ────────────────────────────────────────────────────────────

function SceneEntityRenderer({ entity }: { entity: SceneEntity }) {
  switch (entity.type) {
    case 'projection_trajectory': return <ProjectedTrajectory entity={entity} />;
    case 'projection_wind_cell': return <WindCellArrow entity={entity} />;
    case 'warning_marker': return <WarningMarker entity={entity} />;
    case 'signature_prior': return <SignaturePrior entity={entity} />;
    default: return null;
  }
}

// ─── Scene State Manager (WebSocket consumer) ─────────────────────────────────

function useSceneEntities(wsUrl?: string, initial?: SceneEntity[]) {
  const [entities, setEntities] = useState<EntityMap>(
    Object.fromEntries((initial ?? []).map((e) => [e.entity_id, e]))
  );

  useEffect(() => {
    if (!wsUrl) return;
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.type === 'upsert_entity') {
          setEntities((prev) => ({
            ...prev,
            [msg.entity_id]: { entity_id: msg.entity_id, ...msg.payload },
          }));
        } else if (msg.type === 'remove_entity') {
          setEntities((prev) => {
            const next = { ...prev };
            delete next[msg.entity_id];
            return next;
          });
        }
      } catch { /* ignore malformed messages */ }
    };
    return () => ws.close();
  }, [wsUrl]);

  return entities;
}

// ─── Main Scene Component ─────────────────────────────────────────────────────

export function DroneInspectionScene({ wsUrl, initialEntities }: DroneInspectionSceneProps) {
  const entities = useSceneEntities(wsUrl, initialEntities);

  return (
    <Canvas
      camera={{ position: [0, 8, 18], fov: 55 }}
      style={{ width: '100%', height: '100%', background: '#0a0a12' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} />
      <Environment preset="city" />

      {/* Static scene geometry */}
      <BridgeStructure />
      <DroneEntity />

      {/* Grid helper for spatial reference */}
      <gridHelper args={[40, 40, '#333344', '#222233']} position={[0, -0.15, 0]} />

      {/* Dynamic substrate-driven entities */}
      {Object.values(entities).map((entity) => (
        <SceneEntityRenderer key={entity.entity_id} entity={entity} />
      ))}

      <OrbitControls makeDefault />
    </Canvas>
  );
}

export default DroneInspectionScene;
