// src/atlas/world/protocol/toDroneState.ts
import type { DroneState } from "../types";
import type { RehearsalTelemetryMessage } from "./rehearsal-types";

export function toDroneState(
  msg: RehearsalTelemetryMessage,
  previous: DroneState
): DroneState {
  return {
    ...previous,
    pose: {
      x: msg.payload.pose.x,
      y: msg.payload.pose.y,
      z: msg.payload.pose.z,
      qx: msg.payload.pose.qx,
      qy: msg.payload.pose.qy,
      qz: msg.payload.pose.qz,
      qw: msg.payload.pose.qw,
    },
    vel: {
      vx: msg.payload.vel?.vx ?? previous.vel.vx,
      vy: msg.payload.vel?.vy ?? previous.vel.vy,
      vz: msg.payload.vel?.vz ?? previous.vel.vz,
      wx: msg.payload.vel?.wx ?? previous.vel.wx,
      wy: msg.payload.vel?.wy ?? previous.vel.wy,
      wz: msg.payload.vel?.wz ?? previous.vel.wz,
    },
    battery: msg.payload.battery ?? previous.battery,
    t: msg.ts,
  };
}
