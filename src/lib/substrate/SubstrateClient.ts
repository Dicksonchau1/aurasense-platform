// src/lib/substrate/SubstrateClient.ts
// PR D-1: HTTP adapter to the shared NEPA runtime substrate.
// Architectural Lock #4 (2026-05-22) — Step 1 of post-merge implementation wave.

import type { SignatureEntry } from '@/lib/signature-map/types';
import type {
  ShapeOfChangeEnvelope,
  SubstrateAction,
} from '@/lib/orchestrator/PolygonEngineOrchestrator';

export interface SubstrateRunInfo {
  run_id: string;
}

export class SubstrateClient {
  constructor(
    private readonly baseUrl: string = process.env.NEPA_SUBSTRATE_BASE_URL ??
      'http://127.0.0.1:8080'
  ) {}

  async initialisePriors(priors: SignatureEntry[]): Promise<void> {
    const res = await fetch(`${this.baseUrl}/substrate/priors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priors }),
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `SubstrateClient.initialisePriors failed: ${res.status} ${text}`
      );
    }
  }

  async submitEnvelope(
    envelope: ShapeOfChangeEnvelope
  ): Promise<SubstrateAction[]> {
    const res = await fetch(`${this.baseUrl}/substrate/envelope`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(envelope),
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `SubstrateClient.submitEnvelope failed: ${res.status} ${text}`
      );
    }

    const data = (await res.json()) as { actions?: SubstrateAction[] };
    return data.actions ?? [];
  }

  async getRunId(): Promise<string> {
    const res = await fetch(`${this.baseUrl}/substrate/run_id`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `SubstrateClient.getRunId failed: ${res.status} ${text}`
      );
    }

    const data = (await res.json()) as SubstrateRunInfo;
    if (!data.run_id) {
      throw new Error('SubstrateClient.getRunId failed: missing run_id');
    }
    return data.run_id;
  }
}
