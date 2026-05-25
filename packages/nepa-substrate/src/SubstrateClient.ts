// SubstrateClient: JS adapter for Python substrate
import type {
  SubstrateConfig,
  SubstrateStatus,
  LayerDescriptor,
  LayerConfig,
  ReflexSignal,
  ReflexOutcome,
  CouplingEvent,
  AdaptationTrace,
  Envelope,
  AuditEvent,
} from "./types/substrate.types";

export class SubstrateClient {
  private connected = false;
  constructor(private config: SubstrateConfig) {}

  async connect(): Promise<void> {
    // Optionally: handshake with backend
    this.connected = true;
  }
  async disconnect(): Promise<void> {
    this.connected = false;
  }
  async status(): Promise<SubstrateStatus> {
    // Optionally: fetch from backend
    return { status: this.connected ? "connected" : "disconnected" };
  }

  // Fetch all envelopes from backend REST API
  async getEnvelopes(): Promise<Envelope[]> {
    const resp = await fetch('/api/substrate/envelopes');
    if (!resp.ok) throw new Error('Failed to fetch envelopes');
    return await resp.json();
  }

  // Fetch all audit events from backend REST API
  async getAuditEvents(): Promise<AuditEvent[]> {
    const resp = await fetch('/api/substrate/audit-events');
    if (!resp.ok) throw new Error('Failed to fetch audit events');
    return await resp.json();
  }

  // Fetch a trace by ID from backend REST API
  async getTrace(traceId: string): Promise<AdaptationTrace> {
    const resp = await fetch(`/api/substrate/traces/${encodeURIComponent(traceId)}`);
    if (!resp.ok) throw new Error('Failed to fetch trace');
    return await resp.json();
  }

  // Stubs for other substrate methods
  async getLayerManager(): Promise<{ admitted_count: number; list: LayerDescriptor[] }> {
    return { admitted_count: 0, list: [] };
  }
  async getPlasticityController(): Promise<{ last_step_delta: number }> {
    return { last_step_delta: 0 };
  }
  async getReflex(): Promise<{ latency_buffer: number }> {
    return { latency_buffer: 0 };
  }
  async getCouplingLog(): Promise<CouplingEvent[]> {
    return [];
  }
  async exportWeights(path: string): Promise<void> {
    // Call Python substrate
  }
  async importWeights(path: string): Promise<void> {
    // Call Python substrate
  }
}
