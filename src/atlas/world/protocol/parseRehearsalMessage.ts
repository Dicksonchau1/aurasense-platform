// src/atlas/world/protocol/parseRehearsalMessage.ts
import type {
  RehearsalMessage,
  RehearsalTelemetryMessage,
  RehearsalHeartbeatMessage,
  RehearsalAckMessage,
  RehearsalErrorMessage,
} from "./rehearsal-types";

function isNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function isTelemetryMessage(v: any): v is RehearsalTelemetryMessage {
  return (
    v?.kind === "telemetry" &&
    v?.topic === "rehearse/telemetry" &&
    isNumber(v?.ts) &&
    isNumber(v?.payload?.pose?.x) &&
    isNumber(v?.payload?.pose?.y) &&
    isNumber(v?.payload?.pose?.z) &&
    isNumber(v?.payload?.pose?.qx) &&
    isNumber(v?.payload?.pose?.qy) &&
    isNumber(v?.payload?.pose?.qz) &&
    isNumber(v?.payload?.pose?.qw)
  );
}

function isHeartbeatMessage(v: any): v is RehearsalHeartbeatMessage {
  return v?.kind === "heartbeat" && v?.topic === "rehearse/heartbeat" && isNumber(v?.ts);
}

function isAckMessage(v: any): v is RehearsalAckMessage {
  return (
    v?.kind === "ack" &&
    v?.topic === "rehearse/ack" &&
    isNumber(v?.ts) &&
    typeof v?.payload?.accepted === "boolean"
  );
}

function isErrorMessage(v: any): v is RehearsalErrorMessage {
  return (
    v?.kind === "error" &&
    v?.topic === "rehearse/error" &&
    isNumber(v?.ts) &&
    typeof v?.error === "string"
  );
}

export function parseRehearsalMessage(raw: string): RehearsalMessage | null {
  try {
    const parsed = JSON.parse(raw);

    if (isTelemetryMessage(parsed)) return parsed;
    if (isHeartbeatMessage(parsed)) return parsed;
    if (isAckMessage(parsed)) return parsed;
    if (isErrorMessage(parsed)) return parsed;

    return null;
  } catch {
    return null;
  }
}
