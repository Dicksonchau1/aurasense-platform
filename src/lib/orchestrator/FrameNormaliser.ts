// src/lib/orchestrator/FrameNormaliser.ts
// Normalises captured high-modulator frames into signature_map contributions
// Architectural Lock #4 (2026-05-22)

import { createHash } from 'crypto';
import type { CapturedFrame, SessionContext } from './PolygonEngineOrchestrator';
import type { SignatureEntry, GeometricAnchor, StructuralAnchor } from '@/lib/signature-map/types';
import { latLngToAltitudeBand } from '@/lib/signature-map/altitudeBand';

export class FrameNormaliser {
  private chainTip: string;

  constructor(initialChainTip = '0000000000000000000000000000000000000000000000000000000000000000') {
    this.chainTip = initialChainTip;
  }

  async normalise(
    frames: CapturedFrame[],
    ctx: SessionContext
  ): Promise<Omit<SignatureEntry, 'id' | 'created_at' | 'updated_at'>[]> {
    const entries: Omit<SignatureEntry, 'id' | 'created_at' | 'updated_at'>[] = [];

    for (const frame of frames) {
      const auditHash = createHash('sha256')
        .update(JSON.stringify(frame.content))
        .digest('hex');
      const chainHash = createHash('sha256')
        .update(this.chainTip + auditHash)
        .digest('hex');
      this.chainTip = chainHash;

      // Derive geometric anchor from frame
      const geo: GeometricAnchor = {
        h3_cell: (frame.geometric_anchor as Record<string, unknown>).h3_cell as string,
        altitude_band: latLngToAltitudeBand(ctx.alt_m),
        lat: ctx.lat,
        lon: ctx.lon,
        alt_m: ctx.alt_m,
      };

      // Derive structural anchor from frame
      const structural: StructuralAnchor = {
        object_id: (frame.structural_anchor as Record<string, unknown>).object_id as string,
        structural_class: ctx.structural_class,
        node_id: (frame.structural_anchor as Record<string, unknown>).node_id as string | undefined,
      };

      entries.push({
        geometric_anchor: geo,
        structural_anchor: structural,
        regime_anchor: { ...ctx.regime_anchor, regime_hash: ctx.regime_hash },
        signature_payload: {
          signature_type: (frame.content as Record<string, unknown>).signature_type as string ?? 'generic',
          parameters: (frame.content as Record<string, unknown>).parameters as Record<string, number | string> ?? {},
          confidence: (frame.content as Record<string, unknown>).confidence as number ?? 0.5,
          observation_count: 1,
        },
        contribution_provenance: {
          deployment_id: ctx.deployment_id,
          run_id: ctx.run_id,
          frame_id: frame.frame_id,
          audit_hash: auditHash,
          chain_hash: chainHash,
          contributed_at: new Date().toISOString(),
        },
      });
    }

    return entries;
  }
}
