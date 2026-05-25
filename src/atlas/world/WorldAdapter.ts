// src/atlas/world/WorldAdapter.ts
// The single seam between Polygon agents / R3F scene and the underlying world.
// Live vs rehearsal is a swap of THIS object, nothing else.

import type { Action, DroneState, Envelope, WorldMode } from './types';

export interface SensorReading {
  rgb?: ImageBitmap;
  depth?: Float32Array;
  pose: DroneState['pose'];
}

export interface WorldAdapter {
  readonly mode: WorldMode;
  getState(): DroneState;
  applyAction(a: Action): void;
  readSensors(): SensorReading;
  tick(dt: number): void;
  onEnvelope(cb: (e: Envelope) => void): () => void;
  dispose?(): void;
}
