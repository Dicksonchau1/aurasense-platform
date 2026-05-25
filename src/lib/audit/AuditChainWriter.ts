// src/lib/audit/AuditChainWriter.ts
// Hash-chained audit log writer — satisfies IAuditChainWriter from PolygonEngineOrchestrator.
// PR D-2 (2026-05-23) — Step 2 of post-Lock-#4 implementation wave.

import { createHash, randomUUID } from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  CapturedFrame,
  SessionContext,
  IAuditChainWriter,
} from '@/lib/orchestrator/PolygonEngineOrchestrator';
import { latLngToAltitudeBand } from '@/lib/signature-map/altitudeBand';

const GENESIS_CHAIN_HASH =
  '0000000000000000000000000000000000000000000000000000000000000000';

function deterministicStringify(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) {
    return '[' + obj.map(deterministicStringify).join(',') + ']';
  }
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  return (
    '{' +
    keys
      .map(
        (k) =>
          JSON.stringify(k) +
          ':' +
          deterministicStringify((obj as Record<string, unknown>)[k])
      )
      .join(',') +
    '}'
  );
}

function sha256Hex(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export class AuditChainWriter implements IAuditChainWriter {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, serviceRoleKey: string) {
    this.supabase = createClient(supabaseUrl, serviceRoleKey);
  }

  async writeFrame(
    payload: Record<string, unknown>,
    ctx: SessionContext
  ): Promise<CapturedFrame> {
    return this.writeFrameWithRetry(payload, ctx, 0);
  }

  private async writeFrameWithRetry(
    payload: Record<string, unknown>,
    ctx: SessionContext,
    retry: number
  ): Promise<CapturedFrame> {
    if (retry > 2) {
      throw new Error('AuditChainWriter.writeFrame: exceeded retry budget');
    }

    // 1. Lookup current chain tip
    const previousChainHash = await this.fetchChainTip(
      ctx.deployment_id,
      ctx.run_id
    );

    // 2. Compute audit hash + chain hash
    const auditHash = sha256Hex(deterministicStringify(payload));
    const chainHash = sha256Hex(previousChainHash + auditHash);

    // 3. Derive anchors
    const h3 = await import('h3-js');
    const h3Cell = h3.latLngToCell(ctx.lat, ctx.lon, 9);
    const geometricAnchor = {
      h3_cell: h3Cell,
      altitude_band: latLngToAltitudeBand(ctx.alt_m),
      lat: ctx.lat,
      lon: ctx.lon,
      alt_m: ctx.alt_m,
    };
    const payloadStructural =
      (payload.structural_anchor as Record<string, unknown> | undefined) ??
      undefined;
    const structuralAnchor = {
      object_id:
        (payloadStructural?.object_id as string | undefined) ??
        ctx.deployment_id,
      structural_class: ctx.structural_class,
      node_id: payloadStructural?.node_id as string | undefined,
      object_metadata:
        (payloadStructural?.object_metadata as Record<string, unknown>) ?? {},
    };

    // 4. Compose row
    const frameId =
      (payload.frame_id as string | undefined) ?? randomUUID();
    const tick = (payload.tick as number | undefined) ?? 0;

    const row = {
      deployment_id: ctx.deployment_id,
      run_id: ctx.run_id,
      frame_id: frameId,
      tick,
      content: payload,
      geometric_anchor: geometricAnchor,
      structural_anchor: structuralAnchor,
      regime_anchor: { ...ctx.regime_anchor, regime_hash: ctx.regime_hash },
      audit_hash: auditHash,
      chain_hash: chainHash,
      previous_chain_hash: previousChainHash,
      captured_at: new Date().toISOString(),
    };

    // 5. Insert with retry on chain race
    const { error } = await this.supabase.from('audit_frames').insert(row);
    if (error) {
      if (
        error.code === '23505' &&
        error.message.includes('audit_frames_run_id_chain_hash_key')
      ) {
        // Chain race: another writer beat us to this tip. Retry with fresh tip.
        return this.writeFrameWithRetry(payload, ctx, retry + 1);
      }
      throw new Error(`AuditChainWriter.writeFrame insert failed: ${error.message}`);
    }

    return {
      frame_id: frameId,
      run_id: ctx.run_id,
      tick,
      content: payload,
      geometric_anchor: geometricAnchor,
      structural_anchor: structuralAnchor,
      audit_hash: auditHash,
      chain_hash: chainHash,
      captured_at: row.captured_at,
    };
  }

  private async fetchChainTip(
    deploymentId: string,
    runId: string
  ): Promise<string> {
    const { data, error } = await this.supabase
      .from('audit_chain_tips')
      .select('tip_chain_hash')
      .eq('deployment_id', deploymentId)
      .eq('run_id', runId)
      .maybeSingle();

    if (error) {
      throw new Error(`AuditChainWriter.fetchChainTip failed: ${error.message}`);
    }
    return (data?.tip_chain_hash as string | undefined) ?? GENESIS_CHAIN_HASH;
  }
}
      } else {
        throw e;
      }
    }
    // 6. Return CapturedFrame
    return {
      ...row,
      captured_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
  }

  private async getChainTip(deployment_id: string, run_id: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('audit_chain_tips')
      .select('chain_hash')
      .eq('deployment_id', deployment_id)
      .eq('run_id', run_id)
      .order('tick', { ascending: false })
      .limit(1);
    if (error || !data || data.length === 0) return null;
    return data[0].chain_hash;
  }
}
