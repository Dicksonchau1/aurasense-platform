# DESIGN.md §16-B — Polygon-Engine Orchestrator: 3D-Scene Substrate-Driven Agentic Flow

> Status: LOCKED (2026-05-22, Architectural Lock #4)

## 16-B.1 What the Orchestrator Is

The polygon-engine orchestrator is the **substrate-bound agentic flow** whose canvas is the 3D polygonal scene of the operational context. It is not a UI controller. It is not a learning agent. It is the **translation layer** between substrate inference and rehearse-environment state.

**Responsibility split (non-negotiable):**
- **Substrate**: does all learning. Adjusts weights. Accrets signatures. Emits actions.
- **Orchestrator**: applies actions. Updates scene state. Writes audit log. Contributes to signature_map. **Never adjusts weights directly.**

## 16-B.2 Class Contract

```typescript
// src/lib/orchestrator/PolygonEngineOrchestrator.ts

import { SubstrateClient } from '@/lib/substrate/SubstrateClient';
import { SignatureMapClient } from '@/lib/signature-map/SignatureMapClient';
import { SceneController } from '@/lib/scene/SceneController';
import { AuditChainWriter } from '@/lib/audit/AuditChainWriter';
import { FrameNormaliser } from '@/lib/orchestrator/FrameNormaliser';
import type { SubstrateAction, SessionContext, CapturedFrame } from '@/lib/types';

export class PolygonEngineOrchestrator {
  private substrate: SubstrateClient;
  private sigMap: SignatureMapClient;
  private scene: SceneController;
  private audit: AuditChainWriter;
  private normaliser: FrameNormaliser;
  private capturedFrames: CapturedFrame[] = [];
  private sessionCtx: SessionContext | null = null;

  constructor(deps: {
    substrate: SubstrateClient;
    sigMap: SignatureMapClient;
    scene: SceneController;
    audit: AuditChainWriter;
    normaliser: FrameNormaliser;
  }) {
    this.substrate = deps.substrate;
    this.sigMap = deps.sigMap;
    this.scene = deps.scene;
    this.audit = deps.audit;
    this.normaliser = deps.normaliser;
  }

  /** (a) On rehearse session start */
  async startSession(ctx: SessionContext): Promise<void> {
    this.sessionCtx = ctx;
    this.capturedFrames = [];

    // Query signature_map for spatial-neighbourhood priors
    const priors = await this.sigMap.queryNeighbourhood({
      lat: ctx.lat, lon: ctx.lon, alt_m: ctx.alt_m,
      structural_class: ctx.structural_class,
      regime_hash: ctx.regime_hash,
    });

    // Initialise substrate weights from civilisation-accumulated priors
    await this.substrate.initialisePriors(priors);

    // Render the 3D scene with loaded signatures as anchored entities
    for (const prior of priors) {
      this.scene.upsertEntity({
        entity_id: `prior:${prior.id}`,
        type: 'signature_prior',
        anchor: prior.geometric_anchor,
        payload: prior.signature_payload,
        color: 0x4488ff,
        opacity: 0.4,
      });
    }
  }

  /** (b) During rehearse session — called each telemetry tick */
  async tick(envelope: ShapeOfChangeEnvelope): Promise<void> {
    const actions = await this.substrate.submitEnvelope(envelope);
    for (const action of actions) {
      await this.dispatchAction(action);
    }
  }

  /** (c) Checkpoint or end-of-session */
  async checkpoint(): Promise<void> {
    if (!this.sessionCtx) return;
    const contributions = await this.normaliser.normalise(
      this.capturedFrames,
      this.sessionCtx,
    );
    await this.sigMap.contribute(contributions);
    this.capturedFrames = []; // clear after checkpoint
  }

  async endSession(): Promise<void> {
    await this.checkpoint();
    this.sessionCtx = null;
  }

  /** Action vocabulary dispatch */
  private async dispatchAction(action: SubstrateAction): Promise<void> {
    const [family, subtype] = action.type.split(':');
    switch (family) {
      case 'correct':
        // correct:wind_model | correct:engine_model | correct:gps_bias | correct:control_authority | ...
        this.scene.applyModelCorrection(subtype, action.payload);
        break;
      case 'project':
        // project:trajectory | project:wind_cell | project:crack_path | project:glare_cone
        this.scene.upsertEntity({
          entity_id: `projection:${action.payload.run_id}:${action.payload.tick}:${subtype}`,
          type: `projection_${subtype}`,
          ...action.payload,
        });
        break;
      case 'frame':
        if (subtype === 'captured') {
          // Write frame to audit log with full geometric + structural anchors
          const frame = await this.audit.writeFrame(action.payload, this.sessionCtx!);
          this.capturedFrames.push(frame);
        }
        break;
      case 'flag':
        // flag:anomaly | flag:residual_divergence | flag:low_confidence
        this.scene.upsertEntity({
          entity_id: `flag:${action.payload.flag_id}`,
          type: 'warning_marker',
          color: 0xff4400,
          label: action.payload.narration,
          position: action.payload.scene_position,
        });
        this.scene.emitToast(action.payload.narration, 'warning');
        break;
      default:
        console.warn('[orchestrator] unknown action family:', action.type);
    }
  }
}
```

## 16-B.3 Action Vocabulary — Full Dispatch Table

| Action | Family | Subtype | Orchestrator Response |
|---|---|---|---|
| `correct:wind_model` | correct | wind_model | Update wind field parameters in 3D scene |
| `correct:engine_model` | correct | engine_model | Update drone engine time-constant in physics model |
| `correct:gps_bias` | correct | gps_bias | Shift GPS-derived position entity |
| `correct:control_authority` | correct | control_authority | Update control surface authority coefficients |
| `correct:structural_mode` | correct | structural_mode | Update structural vibration mode coefficients |
| `project:trajectory` | project | trajectory | Render projected flight path as `<Line>` in scene |
| `project:wind_cell` | project | wind_cell | Render wind-cell arrow entity at H3 location |
| `project:crack_path` | project | crack_path | Render crack propagation trace on structure mesh |
| `project:glare_cone` | project | glare_cone | Render glare cone from window position |
| `frame:captured` | frame | captured | Write to audit chain + push to capturedFrames[] |
| `flag:anomaly` | flag | anomaly | Red warning entity + narration toast |

## 16-B.4 SceneMessage Wire Protocol

The orchestrator communicates with the 3D renderer (React-Three-Fiber in browser, or Foxglove for desktop) via WebSocket with structured `SceneMessage` payloads:

```typescript
export interface SceneMessage {
  type: 'upsert_entity' | 'remove_entity' | 'apply_correction' | 'emit_toast';
  entity_id: string;      // Idempotent — upserting same ID replaces previous
  payload: Record<string, unknown>;
  timestamp_ms: number;
}
```

All entity upserts are **idempotent by `entity_id`** — the renderer holds a map keyed by entity_id and replaces on collision. This ensures that a projected trajectory updated every tick does not accumulate duplicate curve objects in the scene.

## 16-B.5 Cross-Agent Shared Substrate

The orchestrator does not own its substrate — it binds to the **shared singleton substrate** used by every agent in ATLAS (rehearse-interview, HRI, drone-inspection). Same `run_id`. Same plasticity loop. This means:

- Signatures learned during a drone-inspection rehearse inform the HRI substrate's spatial priors if they share a spatial neighbourhood
- The civilisation map accumulates across all three rehearse domains
- The meta-loop in Axiom #3 is not per-domain — it is civilisation-wide
