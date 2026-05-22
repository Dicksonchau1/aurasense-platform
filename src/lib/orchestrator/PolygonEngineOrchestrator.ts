// src/lib/orchestrator/PolygonEngineOrchestrator.ts
// Substrate-bound agentic flow — canvas is the 3D polygonal scene
// Architectural Lock #4 (2026-05-22)

import type { SignatureMapClient } from '@/lib/signature-map/SignatureMapClient';
import type { SignatureEntry } from '@/lib/signature-map/types';

// ---------- Minimal local type definitions (full types live in src/lib/types.ts) ----------

export interface ShapeOfChangeEnvelope {
  run_id: string;
  tick: number;
  observed: Record<string, number>;
  predicted: Record<string, number>;
  delta: Record<string, number>;
  timestamp_ms: number;
}

export interface SubstrateAction {
  type: string; // 'correct:wind_model' | 'project:trajectory' | 'frame:captured' | 'flag:anomaly' | ...
  payload: Record<string, unknown>;
}

export interface SessionContext {
  run_id: string;
  deployment_id: string;
  lat: number;
  lon: number;
  alt_m: number;
  structural_class: string;
  regime_hash: string;
  regime_anchor: Record<string, unknown>;
}

export interface CapturedFrame {
  frame_id: string;
  run_id: string;
  tick: number;
  content: Record<string, unknown>;
  geometric_anchor: Record<string, unknown>;
  structural_anchor: Record<string, unknown>;
  audit_hash: string;
  chain_hash: string;
  captured_at: string;
}

export interface SceneEntity {
  entity_id: string;
  type: string;
  [key: string]: unknown;
}

export interface SceneMessage {
  type: 'upsert_entity' | 'remove_entity' | 'apply_correction' | 'emit_toast';
  entity_id: string;
  payload: Record<string, unknown>;
  timestamp_ms: number;
}

// ---------- Dependency interfaces (implemented separately) ----------

export interface ISubstrateClient {
  initialisePriors(priors: SignatureEntry[]): Promise<void>;
  submitEnvelope(envelope: ShapeOfChangeEnvelope): Promise<SubstrateAction[]>;
}

export interface ISceneController {
  upsertEntity(entity: SceneEntity): void;
  removeEntity(entity_id: string): void;
  applyModelCorrection(model: string, params: Record<string, unknown>): void;
  emitToast(message: string, level: 'info' | 'warning' | 'error'): void;
  sendMessage(msg: SceneMessage): void;
}

export interface IAuditChainWriter {
  writeFrame(
    payload: Record<string, unknown>,
    ctx: SessionContext
  ): Promise<CapturedFrame>;
}

export interface IFrameNormaliser {
  normalise(
    frames: CapturedFrame[],
    ctx: SessionContext
  ): Promise<Omit<SignatureEntry, 'id' | 'created_at' | 'updated_at'>[]>;
}

// ---------- Orchestrator ----------

export class PolygonEngineOrchestrator {
  private substrate: ISubstrateClient;
  private sigMap: SignatureMapClient;
  private scene: ISceneController;
  private audit: IAuditChainWriter;
  private normaliser: IFrameNormaliser;
  private capturedFrames: CapturedFrame[] = [];
  private sessionCtx: SessionContext | null = null;

  constructor(deps: {
    substrate: ISubstrateClient;
    sigMap: SignatureMapClient;
    scene: ISceneController;
    audit: IAuditChainWriter;
    normaliser: IFrameNormaliser;
  }) {
    this.substrate = deps.substrate;
    this.sigMap = deps.sigMap;
    this.scene = deps.scene;
    this.audit = deps.audit;
    this.normaliser = deps.normaliser;
  }

  // ─── (a) Session Start ──────────────────────────────────────────────────────

  async startSession(ctx: SessionContext): Promise<void> {
    this.sessionCtx = ctx;
    this.capturedFrames = [];

    const priors = await this.sigMap.queryNeighbourhood({
      lat: ctx.lat,
      lon: ctx.lon,
      alt_m: ctx.alt_m,
      structural_class: ctx.structural_class,
      regime_hash: ctx.regime_hash,
    });

    await this.substrate.initialisePriors(priors);

    // Render priors as anchored scene entities
    for (const prior of priors) {
      this.scene.upsertEntity({
        entity_id: `prior:${prior.id}`,
        type: 'signature_prior',
        position: [
          prior.geometric_anchor.lon,
          prior.geometric_anchor.alt_m,
          prior.geometric_anchor.lat,
        ],
        signature_type: prior.signature_payload.signature_type,
        confidence: prior.signature_payload.confidence,
        color: 0x4488ff,
        opacity: 0.35,
      });
    }

    console.log(
      `[orchestrator] session ${ctx.run_id} started — ${priors.length} priors loaded from signature_map`
    );
  }

  // ─── (b) Per-Tick ────────────────────────────────────────────────────────────

  async tick(envelope: ShapeOfChangeEnvelope): Promise<void> {
    if (!this.sessionCtx) throw new Error('[orchestrator] tick called before startSession');
    const actions = await this.substrate.submitEnvelope(envelope);
    for (const action of actions) {
      await this.dispatchAction(action, envelope.tick);
    }
  }

  // ─── (c) Checkpoint / End ────────────────────────────────────────────────────

  async checkpoint(): Promise<void> {
    if (!this.sessionCtx || this.capturedFrames.length === 0) return;
    const contributions = await this.normaliser.normalise(this.capturedFrames, this.sessionCtx);
    await this.sigMap.contribute(contributions);
    console.log(
      `[orchestrator] checkpoint — ${contributions.length} signatures contributed to signature_map`
    );
    this.capturedFrames = [];
  }

  async endSession(): Promise<void> {
    await this.checkpoint();
    this.sessionCtx = null;
    console.log('[orchestrator] session ended');
  }

  // ─── Action Dispatch ─────────────────────────────────────────────────────────

  private async dispatchAction(action: SubstrateAction, tick: number): Promise<void> {
    const colonIdx = action.type.indexOf(':');
    const family = colonIdx >= 0 ? action.type.slice(0, colonIdx) : action.type;
    const subtype = colonIdx >= 0 ? action.type.slice(colonIdx + 1) : '';

    switch (family) {
      case 'correct':
        this.scene.applyModelCorrection(subtype, action.payload as Record<string, unknown>);
        this.scene.sendMessage({
          type: 'apply_correction',
          entity_id: `correction:${subtype}:${tick}`,
          payload: { model: subtype, ...action.payload },
          timestamp_ms: Date.now(),
        });
        break;

      case 'project':
        this.scene.upsertEntity({
          entity_id: `projection:${this.sessionCtx?.run_id}:${tick}:${subtype}`,
          type: `projection_${subtype}`,
          ttl_ticks: 30,
          ...(action.payload as Record<string, unknown>),
        });
        this.scene.sendMessage({
          type: 'upsert_entity',
          entity_id: `projection:${this.sessionCtx?.run_id}:${tick}:${subtype}`,
          payload: { type: `projection_${subtype}`, ...(action.payload as Record<string, unknown>) },
          timestamp_ms: Date.now(),
        });
        break;

      case 'frame':
        if (subtype === 'captured') {
          const frame = await this.audit.writeFrame(
            action.payload as Record<string, unknown>,
            this.sessionCtx!
          );
          this.capturedFrames.push(frame);
        }
        break;

      case 'flag':
        this.scene.upsertEntity({
          entity_id: `flag:${(action.payload as Record<string, unknown>).flag_id}`,
          type: 'warning_marker',
          color: 0xff4400,
          label: (action.payload as Record<string, unknown>).narration,
          position: (action.payload as Record<string, unknown>).scene_position,
        });
        this.scene.emitToast(
          String((action.payload as Record<string, unknown>).narration),
          'warning'
        );
        break;

      default:
        console.warn('[orchestrator] unknown action family:', action.type);
    }
  }
}
