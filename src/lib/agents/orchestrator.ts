// AgentOrchestrator — thin client.
// If NEPA_WS_URL is provided, intents are streamed to Python NEPA over WebSocket.
// Otherwise an in-process stub plans/executes locally so the UI is never blocked.

import type {
  Agent,
  AgentSnapshot,
  Intent,
  NepaMessage,
  OrchestratorEvent,
  OrchestratorListener,
  OrchestratorTelemetry,
  Plan,
  Trace,
} from "./types";
import type { Tick } from "@/lib/world/types";

export interface OrchestratorOptions {
  nepaWsUrl?: string;
  reconnectMs?: number;
  onEvent?: OrchestratorListener;
}

export class AgentOrchestrator {
  private agents = new Map<string, Agent>();
  private intents = new Map<string, Intent>();
  private plans = new Map<string, Plan>();
  private traces: Trace[] = [];
  private listeners = new Set<OrchestratorListener>();
  private ws: WebSocket | null = null;
  private wsUrl?: string;
  private reconnectMs: number;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;
  private currentTick = 0;
  private telem: OrchestratorTelemetry = {
    agentsRegistered: 0,
    intentsInFlight: 0,
    intentsCompleted: 0,
    intentsFailed: 0,
    lastTraceTick: 0,
  };

  constructor(opts: OrchestratorOptions = {}) {
    this.wsUrl = opts.nepaWsUrl;
    this.reconnectMs = opts.reconnectMs ?? 2000;
    if (opts.onEvent) this.listeners.add(opts.onEvent);
    if (typeof window !== "undefined" && this.wsUrl) this.connect();
  }

  on(fn: OrchestratorListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(e: OrchestratorEvent): void {
    for (const fn of this.listeners) {
      try {
        fn(e);
      } catch {
        // listener errors must not kill the loop
      }
    }
  }

  registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
    this.telem.agentsRegistered = this.agents.size;
    this.emit({ kind: "agent.registered", payload: agent, tick: this.currentTick });
  }

  unregisterAgent(id: string): void {
    this.agents.delete(id);
    this.telem.agentsRegistered = this.agents.size;
  }

  listAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  snapshot(): AgentSnapshot[] {
    return this.listAgents().map((a) => ({
      agent: a,
      currentIntent: this.findIntentForAgent(a.id) ?? null,
      currentPlan: this.findPlanForAgent(a.id) ?? null,
    }));
  }

  private findIntentForAgent(agentId: string): Intent | undefined {
    for (const i of this.intents.values()) if (i.agentId === agentId) return i;
    return undefined;
  }

  private findPlanForAgent(agentId: string): Plan | undefined {
    for (const p of this.plans.values()) if (p.agentId === agentId) return p;
    return undefined;
  }

  issueIntent(intent: Intent): void {
    this.intents.set(intent.id, intent);
    this.telem.intentsInFlight = this.intents.size;
    this.emit({ kind: "intent.issued", payload: intent, tick: this.currentTick });
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "intent", data: intent }));
    } else {
      const plan: Plan = {
        intentId: intent.id,
        agentId: intent.agentId,
        steps: [
          {
            capabilityId: intent.kind,
            args: intent.payload,
            expectedDurationTicks: 30,
          },
        ],
        estimatedCost: 1,
        createdTick: this.currentTick,
      };
      this.plans.set(intent.id, plan);
      this.emit({ kind: "intent.planned", payload: plan, tick: this.currentTick });
    }
  }

  completeIntent(intentId: string, reward = 1): void {
    const intent = this.intents.get(intentId);
    const plan = this.plans.get(intentId);
    if (!intent || !plan) return;
    const trace: Trace = {
      intentId,
      agentId: intent.agentId,
      capabilityId: plan.steps[0]?.capabilityId ?? "unknown",
      preSpikeTick: intent.issuedTick,
      postSpikeTick: this.currentTick,
      reward,
    };
    this.traces.push(trace);
    if (this.traces.length > 2000) this.traces.splice(0, this.traces.length - 2000);
    this.telem.lastTraceTick = this.currentTick;
    this.telem.intentsCompleted += 1;
    this.intents.delete(intentId);
    this.plans.delete(intentId);
    this.telem.intentsInFlight = this.intents.size;
    this.emit({ kind: "intent.completed", payload: intent, tick: this.currentTick });
    this.emit({ kind: "trace.emitted", payload: trace, tick: this.currentTick });
  }

  failIntent(intentId: string, reason: string): void {
    const intent = this.intents.get(intentId);
    if (!intent) return;
    this.telem.intentsFailed += 1;
    this.intents.delete(intentId);
    this.plans.delete(intentId);
    this.telem.intentsInFlight = this.intents.size;
    this.emit({
      kind: "intent.failed",
      payload: { intent, reason },
      tick: this.currentTick,
    });
  }

  tick(t: Tick): void {
    this.currentTick = t.n;
    this.emit({ kind: "tick", payload: t.n, tick: t.n });
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      for (const intent of Array.from(this.intents.values())) {
        const plan = this.plans.get(intent.id);
        if (!plan) continue;
        const dur = plan.steps.reduce((s, x) => s + x.expectedDurationTicks, 0);
        if (this.currentTick - intent.issuedTick >= dur) {
          this.completeIntent(intent.id, 1);
        }
      }
    }
  }

  telemetry(): OrchestratorTelemetry {
    return { ...this.telem };
  }

  recentTraces(n = 50): Trace[] {
    return this.traces.slice(-n);
  }

  private connect(): void {
    if (!this.wsUrl || this.destroyed) return;
    try {
      this.ws = new WebSocket(this.wsUrl);
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.ws.onopen = () => {
      this.ws?.send(
        JSON.stringify({ type: "hello", data: { agents: this.listAgents() } }),
      );
    };
    this.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data) as NepaMessage;
        this.handleNepa(msg);
      } catch {
        // ignore malformed frames
      }
    };
    this.ws.onclose = () => {
      this.ws = null;
      this.scheduleReconnect();
    };
    this.ws.onerror = () => {
      try {
        this.ws?.close();
      } catch {
        // noop
      }
    };
  }

  private scheduleReconnect(): void {
    if (this.destroyed) return;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => this.connect(), this.reconnectMs);
  }

  private handleNepa(msg: NepaMessage): void {
    switch (msg.type) {
      case "plan": {
        const plan = msg.data as Plan;
        this.plans.set(plan.intentId, plan);
        this.emit({ kind: "intent.planned", payload: plan, tick: this.currentTick });
        break;
      }
      case "trace": {
        const trace = msg.data as Trace;
        this.traces.push(trace);
        if (this.traces.length > 2000) {
          this.traces.splice(0, this.traces.length - 2000);
        }
        this.telem.lastTraceTick = this.currentTick;
        this.emit({ kind: "trace.emitted", payload: trace, tick: this.currentTick });
        break;
      }
      case "telemetry": {
        const t = msg.data as Partial<OrchestratorTelemetry>;
        this.telem = { ...this.telem, ...t };
        break;
      }
      case "ack":
      case "error":
      default:
        break;
    }
  }

  destroy(): void {
    this.destroyed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // noop
      }
      this.ws = null;
    }
    this.listeners.clear();
  }
}