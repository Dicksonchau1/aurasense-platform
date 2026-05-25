import type { WorldAdapter } from "../WorldAdapter";
import type { Action, DroneState, Envelope } from "../types";
import { parseRehearsalMessage } from "../protocol/parseRehearsalMessage";
import { toDroneState } from "../protocol/toDroneState";
import { WORLD_MODEL_CONFIG } from "../config";
import { recordEnvelope } from "../envelope/recordEnvelope";
import { enforceSafetyGate } from "../session/safetyGate";

type RehearsalSocketAdapterOptions = {
  siteId: string;
  sessionId: string;
  wsUrl?: string;
};

const DEFAULT_STATE: DroneState = {
  pose: { x: 0, y: 2.5, z: 6, qx: 0, qy: 0, qz: 0, qw: 1 },
  vel: { vx: 0, vy: 0, vz: 0, wx: 0, wy: 0, wz: 0 },
  battery: 1,
  t: 0,
};

export class RehearsalSocketAdapter implements WorldAdapter {
  public readonly mode = "rehearsal" as const;

  private state: DroneState = DEFAULT_STATE;
  private envelopes = new Set<(e: Envelope) => void>();
  private socket: WebSocket | null = null;
  private wsUrl: string;
  private options: RehearsalSocketAdapterOptions;
  private connected = false;
  private lastMessageAt: number | null = null;

  constructor(options: RehearsalSocketAdapterOptions) {
    this.options = options;
    this.wsUrl = options.wsUrl ?? WORLD_MODEL_CONFIG.transport.rehearsalWs;
    this.connect();
  }

  getState(): DroneState {
    return this.state;
  }

  applyAction(action: Action): void {
    enforceSafetyGate({
      adapterMode: this.mode,
      action,
      target: "rehearsal-socket",
      allowLivePublish: false,
    });

    const now = performance.now() / 1000;
    const envelope: Envelope = {
      t0: now,
      t1: now + 0.05,
      keyframeRef: `rehearsal-socket:${this.options.sessionId}:${now.toFixed(3)}`,
      delta: new TextEncoder().encode(JSON.stringify(action)).buffer,
      scope: "rehearsal",
      provenance: {
        siteId: this.options.siteId,
        sessionId: this.options.sessionId,
        agent: "polygon",
      },
    };

    if (this.socket && this.connected) {
      this.socket.send(
        JSON.stringify({
          topic: "rehearse/action",
          sessionId: this.options.sessionId,
          payload: action,
        })
      );
    }

    this.emitEnvelope(envelope);
    void recordEnvelope(envelope);
  }

  readSensors() {
    return {
      pose: this.state.pose,
      rgb: undefined,
      depth: undefined,
    };
  }

  tick(dt: number): void {
    this.state = {
      ...this.state,
      t: this.state.t + dt,
    };
  }

  onEnvelope(cb: (e: Envelope) => void): () => void {
    this.envelopes.add(cb);
    return () => this.envelopes.delete(cb);
  }

  dispose() {
    this.socket?.close();
    this.socket = null;
  }

  isConnected() {
    return this.connected;
  }

  getLastMessageAt() {
    return this.lastMessageAt;
  }

  private connect() {
    if (typeof window === "undefined") return;

    try {
      this.socket = new WebSocket(this.wsUrl);

      this.socket.onopen = () => {
        this.connected = true;
        this.socket?.send(
          JSON.stringify({
            topic: "rehearse/subscribe",
            sessionId: this.options.sessionId,
            siteId: this.options.siteId,
          })
        );
      };

      this.socket.onmessage = (event) => {
        const msg = parseRehearsalMessage(event.data);
        this.lastMessageAt = Date.now();

        if (!msg) return;

        switch (msg.kind) {
          case "telemetry":
            this.state = toDroneState(msg, this.state);
            break;
          case "heartbeat":
            // Optionally handle heartbeat
            break;
          case "ack":
            // Optionally handle ack
            break;
          case "error":
            console.warn("Rehearsal socket error:", msg.error);
            break;
        }
      };

      this.socket.onclose = () => {
        this.connected = false;
      };

      this.socket.onerror = () => {
        this.connected = false;
      };
    } catch {
      this.connected = false;
    }
  }

  private emitEnvelope(envelope: Envelope) {
    for (const cb of this.envelopes) cb(envelope);
  }
}
