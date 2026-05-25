"use client";
import React, { useEffect, useRef, useState } from 'react';
import { DroneInspectionScene } from '../../components/rehearse/drone/DroneInspectionScene';
import { generateOrbitTelemetry } from '../../lib/rehearse/drone/fixture-telemetry';

const defaultContext = {
  structure_type: 'bridge',
  structure_id: 'bridge-001',
  geo: { lat: 37.7749, lon: -122.4194, alt_m: 10, radius_m: 20 },
  conditions: { wind_speed_ms: 2, wind_dir_deg: 90, payload_kg: 1 },
};

export default function DroneRehearsePage() {
  const [sessionId, setSessionId] = useState('');
  const [runId, setRunId] = useState('');
  const [tick, setTick] = useState(0);
  const [telemetry, setTelemetry] = useState(generateOrbitTelemetry(0, 10, 5));
  const [started, setStarted] = useState(false);

  // Start session on mount
  useEffect(() => {
    const sid = `sess-${Date.now()}`;
    setSessionId(sid);
    setRunId(`run-${Date.now()}`);
    fetch('/api/rehearse/drone-session', {
      method: 'POST',
      body: JSON.stringify({
        action: 'start',
        session_id: sid,
        drone_context: defaultContext,
      }),
      headers: { 'Content-Type': 'application/json' },
    }).then(() => setStarted(true));
    return () => {
      // End session on unmount
      fetch('/api/rehearse/drone-session', {
        method: 'POST',
        body: JSON.stringify({
          action: 'end',
          session_id: sid,
          drone_context: defaultContext,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
    };
  }, []);

  // Telemetry tick every 2s
  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => {
      setTick(t => t + 1);
      const telem = generateOrbitTelemetry(tick, 10, 5);
      setTelemetry(telem);
      fetch('/api/rehearse/drone-session', {
        method: 'POST',
        body: JSON.stringify({
          action: 'tick',
          session_id: sessionId,
          drone_context: defaultContext,
          telemetry: telem,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [started, sessionId, tick]);

  return (
    <div>
      <h1>Drone Inspection Rehearse Demo</h1>
      <div>Session: {sessionId}</div>
      <div>Run: {runId}</div>
      {/* TODO: HUD for prior/contribution counts, NarrationToast */}
      <div style={{ width: '100vw', height: '60vh' }}>
        <DroneInspectionScene
          structure_type={defaultContext.structure_type}
          structure_dimensions={{ w: 3, h: 2, d: 1 }}
          drone_position={telemetry.position}
          drone_orientation={telemetry.orientation}
          flight_path={defaultContext.flight_path}
        />
      </div>
    </div>
  );
}
