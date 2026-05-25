'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, CatmullRomLine } from '@react-three/drei';
import { DroneStructureMesh } from './DroneStructureMesh';
import { DroneEntity } from './DroneEntity';

interface DroneInspectionSceneProps {
  structure_type: 'bridge' | 'wind_turbine' | 'building_facade' | 'pipeline';
  structure_dimensions?: { w: number; h: number; d: number };
  drone_position: { x: number; y: number; z: number };
  drone_orientation?: { x: number; y: number; z: number };
  wind?: { speed: number; dir: number };
  flight_path?: Array<{ x: number; y: number; z: number }>;
  projection_tubes?: Array<any>;
  anomaly_markers?: Array<any>;
}

export const DroneInspectionScene: React.FC<DroneInspectionSceneProps> = ({
  structure_type,
  structure_dimensions,
  drone_position,
  drone_orientation,
  wind,
  flight_path,
  projection_tubes,
  anomaly_markers,
}) => {
  const cameraRef = useRef<any>(null);
  // New state for corrections and toasts
  const [corrections, setCorrections] = useState<Record<string, Record<string, unknown>>>({});
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; level: 'info' | 'warn' | 'error'; expires_at: number }>>([]);

  useEffect(() => {
    // Position camera to face structure from above/outside
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 10, 10);
      cameraRef.current.lookAt(0, 0, 0);
    }
  }, []);

  useEffect(() => {
    // WebSocket connection for orchestrator events
    const ws = new window.WebSocket(`ws://${window.location.hostname}:3001/rehearse/drone`);
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case 'apply_correction': {
            const payload = msg.payload as { model: string } & Record<string, unknown>;
            setCorrections((prev) => ({
              ...prev,
              [payload.model]: payload,
            }));
            break;
          }
          case 'emit_toast': {
            const payload = msg.payload as { message: string; level: 'info' | 'warn' | 'error' };
            const id = msg.entity_id;
            setToasts((prev) => [
              ...prev,
              { id, message: payload.message, level: payload.level, expires_at: Date.now() + 4000 },
            ]);
            // Auto-dismiss after 4s
            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 4000);
            break;
          }
          // Optionally handle upsert_entity, remove_entity, etc.
        }
      } catch {}
    };
    return () => ws.close();
  }, []);

  return (
    <>
      {/* HUD: active corrections (top-left) */}
      <div style={{
        position: 'absolute', top: 12, left: 12, padding: '8px 12px',
        background: 'rgba(0,0,0,0.6)', color: '#0f0', fontFamily: 'monospace',
        fontSize: 12, borderRadius: 4, maxWidth: 320, pointerEvents: 'none',
      }}>
        <div style={{ opacity: 0.7, marginBottom: 4 }}>active corrections</div>
        {Object.keys(corrections).length === 0 && <div style={{ opacity: 0.5 }}>â€” none â€”</div>}
        {Object.entries(corrections).map(([model, params]) => (
          <div key={model}>
            <strong>{model}</strong>: {JSON.stringify(params)}
          </div>
        ))}
      </div>

      {/* Toasts (top-right) */}
      <div style={{
        position: 'absolute', top: 12, right: 12, display: 'flex',
        flexDirection: 'column', gap: 6, pointerEvents: 'none',
      }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            padding: '8px 12px',
            background: t.level === 'error' ? 'rgba(180,30,30,0.9)'
                      : t.level === 'warn'  ? 'rgba(200,140,20,0.9)'
                      : 'rgba(40,80,160,0.9)',
            color: 'white', fontFamily: 'monospace', fontSize: 12,
            borderRadius: 4, maxWidth: 360,
          }}>
            {t.message}
          </div>
        ))}
      </div>

      <Canvas camera={{ position: [0, 10, 10], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} />
        <DroneStructureMesh structure_type={structure_type} dimensions={structure_dimensions} />
        {flight_path && flight_path.length > 1 && (
          <CatmullRomLine points={flight_path.map(p => [p.x, p.y, p.z])} color="blue" />
        )}
        <DroneEntity position={drone_position} orientation={drone_orientation} />
        {/* TODO: Render wind cells, projection tubes, anomaly markers */}
        <OrbitControls />
      </Canvas>
    </>
  );
};
