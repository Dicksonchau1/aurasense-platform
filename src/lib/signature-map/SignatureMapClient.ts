// src/lib/signature-map/SignatureMapClient.ts
// Read/write client for the civilisation-scale 3D spatial signature index
// Architectural Lock #4 (2026-05-22)

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { SignatureEntry, SpatialQueryParams, ContributionProvenance } from './types';

// H3 helpers — install: pnpm add h3-js
// Using dynamic require so Next.js edge runtime doesn't choke on the wasm
let h3: typeof import('h3-js');
async function getH3() {
  if (!h3) h3 = await import('h3-js');
  return h3;
}

export class SignatureMapClient {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Query spatial neighbourhood for matching signatures.
   * Returns entries sorted by observation_count DESC.
   */
  async queryNeighbourhood(params: SpatialQueryParams): Promise<SignatureEntry[]> {
    const { latLngToCell, gridDisk } = await getH3();
    const cell = latLngToCell(params.lat, params.lon, 9);
    const ring = gridDisk(cell, params.k_ring ?? 1);

    const { data, error } = await this.supabase
      .from('signature_map')
      .select('*')
      .in('h3_cell', ring)
      .eq('structural_class', params.structural_class)
      .eq('regime_hash', params.regime_hash)
      .order('observation_count', { ascending: false });

    if (error) throw new Error(`SignatureMapClient.queryNeighbourhood: ${error.message}`);
    return (data ?? []) as SignatureEntry[];
  }

  /**
   * Write a batch of normalised SignatureEntry contributions.
   * Requires service-role key.
   */
  async contribute(entries: Omit<SignatureEntry, 'id' | 'created_at' | 'updated_at'>[]): Promise<void> {
    if (entries.length === 0) return;

    // Flatten JSONB fields for Supabase insert
    const rows = entries.map((e) => ({
      h3_cell: e.geometric_anchor.h3_cell,
      altitude_band: e.geometric_anchor.altitude_band,
      lat: e.geometric_anchor.lat,
      lon: e.geometric_anchor.lon,
      alt_m: e.geometric_anchor.alt_m,
      object_id: e.structural_anchor.object_id,
      structural_class: e.structural_anchor.structural_class,
      node_id: e.structural_anchor.node_id ?? null,
      object_metadata: e.structural_anchor.object_metadata ?? {},
      regime_hash: e.regime_anchor.regime_hash,
      regime_anchor: e.regime_anchor,
      signature_type: e.signature_payload.signature_type,
      signature_payload: e.signature_payload,
      deployment_id: e.contribution_provenance.deployment_id,
      run_id: e.contribution_provenance.run_id,
      frame_id: e.contribution_provenance.frame_id,
      audit_hash: e.contribution_provenance.audit_hash,
      chain_hash: e.contribution_provenance.chain_hash,
      contributed_at: e.contribution_provenance.contributed_at,
    }));

    const { error } = await this.supabase.from('signature_map').insert(rows);
    if (error) throw new Error(`SignatureMapClient.contribute: ${error.message}`);
  }
}
