// src/atlas/world/types.ts
// Core type contracts for the ATLAS world model runtime.
// These are the ONLY types Polygon agents and the R3F scene should depend on.

export type Pose = {
  x: number; y: number; z: number;
  qx: number; qy: number; qz: number; qw: number;
};

export type Velocity = {
  vx: number; vy: number; vz: number;
  wx: number; wy: number; wz: number;
};

export type DroneState = {
  pose: Pose;
  vel: Velocity;
  battery: number;
  t: number;
};

export type Action = {
  thrust: [number, number, number, number];
  gimbal?: [number, number];
};

export type EnvelopeScope = 'live' | 'rehearsal';

export type Envelope = {
  t0: number;
  t1: number;
  keyframeRef: string;
  delta: ArrayBuffer;
  scope: EnvelopeScope;
  provenance: { siteId: string; sessionId: string; agent?: string };
};

export type SceneNode = {
  id: string;
  kind: 'asset' | 'drone' | 'sensor' | 'zone' | 'evidence';
  name?: string;
  parentId?: string;
  transform: Pose;
  meta?: Record<string, unknown>;
};

export type WorldMode = EnvelopeScope;
