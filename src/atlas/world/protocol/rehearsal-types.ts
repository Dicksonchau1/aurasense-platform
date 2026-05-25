// src/atlas/world/protocol/rehearsal-types.ts

export type RehearsalTelemetryMessage = {
  kind: "telemetry";
  topic: "rehearse/telemetry";
  ts: number;
  payload: {
    pose: {
      x: number;
      y: number;
      z: number;
      qx: number;
      qy: number;
      qz: number;
      qw: number;
    };
    vel?: {
      vx: number;
      vy: number;
      vz: number;
      wx: number;
      wy: number;
      wz: number;
    };
    battery?: number;
  };
};

export type RehearsalHeartbeatMessage = {
  kind: "heartbeat";
  topic: "rehearse/heartbeat";
  ts: number;
};

export type RehearsalAckMessage = {
  kind: "ack";
  topic: "rehearse/ack";
  ts: number;
  payload: {
    actionId?: string;
    accepted: boolean;
  };
};

export type RehearsalErrorMessage = {
  kind: "error";
  topic: "rehearse/error";
  ts: number;
  error: string;
};

export type RehearsalMessage =
  | RehearsalTelemetryMessage
  | RehearsalHeartbeatMessage
  | RehearsalAckMessage
  | RehearsalErrorMessage;
