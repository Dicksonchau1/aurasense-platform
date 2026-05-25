'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import type { SceneEvent } from '@/src/lib/rehearse/types';
import WindCellEntity from './WindCellEntity';
import AnomalyMarker from './AnomalyMarker';
import NarrationToast from './NarrationToast';

interface EntityMap {
  [entity_id: string]: SceneEvent;
}

function useSceneEvents(sessionId: string) {
  const [entities, setEntities] = useState<EntityMap>({});
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    const ws = new WebSocket(`/api/rehearse/scene-ws?session_id=${sessionId}`);
    wsRef.current = ws;
    ws.onmessage = (event) => {
      const sceneEvent: SceneEvent = JSON.parse(event.data);
      setEntities((prev) => {
        const next = { ...prev };
        if (sceneEvent.type === 'entity_add' || sceneEvent.type === 'entity_update') {
          next[sceneEvent.entity_id] = sceneEvent;
        } else if (sceneEvent.type === 'entity_remove') {
          delete next[sceneEvent.entity_id];
        }
        // Toasts handled elsewhere
        return next;
      });
    };
    ws.onclose = () => {
      wsRef.current = null;
    };
    return () => {
      ws.close();
    };
  }, [sessionId]);

  return entities;
}


function EntityRenderer({ event }: { event: SceneEvent }) {
  switch (event.entity_type) {
    case 'wind_cell':
      return <WindCellEntity event={event} />;
    case 'anomaly_marker':
      return <AnomalyMarker event={event} />;
    case 'projection_tube':
      return (
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 2, 16]} />
          <meshStandardMaterial color="blue" />
        </mesh>
      );
    case 'drone_entity':
      return (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.2, 0.1, 0.3]} />
          <meshStandardMaterial color="gray" />
        </mesh>
      );
    case 'correction_overlay':
      return (
        <Html>
          <div style={{ color: 'orange', fontWeight: 'bold' }}>Correction</div>
        </Html>
      );
    case 'prior_signature':
      return (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="green" />
        </mesh>
      );
    case 'captured_frame_marker':
      return (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="yellow" />
        </mesh>
      );
    default:
      return null;
  }
}

export default function RehearseSce3D({ sessionId }: { sessionId: string }) {
  const entities = useSceneEvents(sessionId);
  const [toasts, setToasts] = useState<SceneEvent[]>([]);

  // Listen for toast events
  useEffect(() => {
    const ws = new WebSocket(`/api/rehearse/scene-ws?session_id=${sessionId}`);
    ws.onmessage = (event) => {
      const sceneEvent: SceneEvent = JSON.parse(event.data);
      if (sceneEvent.type === 'toast') {
        setToasts((prev) => [...prev, sceneEvent]);
      }
    };
    return () => ws.close();
  }, [sessionId]);

  return (
    <>
      <Canvas camera={{ position: [0, 2, 5], fov: 60 }} style={{ width: '100%', height: '400px' }}>
        <ambientLight intensity={0.5} />
        <OrbitControls />
        {Object.values(entities).map((event) => (
          <EntityRenderer key={event.entity_id} event={event} />
        ))}
      </Canvas>
      {toasts.map((event) => (
        <NarrationToast key={event.entity_id + event.ts} event={event} />
      ))}
    </>
  );
}
