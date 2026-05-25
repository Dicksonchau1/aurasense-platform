// src/lib/scene/SceneController.ts
// Implements ISceneController — owns entity map, broadcasts SceneMessages over WS.
// PR D-3 (2026-05-23) — Step 3 of post-Lock-#4 implementation wave.

import { randomUUID } from 'crypto';
import type { WebSocket } from 'ws';
import type {
  ISceneController,
  SceneEntity,
  SceneMessage,
} from '@/lib/orchestrator/PolygonEngineOrchestrator';

interface TrackedEntity {
  entity: SceneEntity;
  insertion_tick: number;
}

export class SceneController implements ISceneController {
  private entities = new Map<string, TrackedEntity>();
  private clients = new Set<WebSocket>();
  private currentTick = 0;

  setCurrentTick(tick: number): void {
    this.currentTick = tick;
  }

  upsertEntity(entity: SceneEntity): void {
    this.entities.set(entity.entity_id, {
      entity,
      insertion_tick: this.currentTick,
    });
    this.broadcast({
      type: 'upsert_entity',
      entity_id: entity.entity_id,
      payload: entity,
      timestamp_ms: Date.now(),
    });
  }

  removeEntity(entity_id: string): void {
    this.entities.delete(entity_id);
    this.broadcast({
      type: 'remove_entity',
      entity_id,
      timestamp_ms: Date.now(),
    });
  }

  applyModelCorrection(
    model: string,
    params: Record<string, unknown>
  ): void {
    this.broadcast({
      type: 'apply_correction',
      entity_id: `model:${model}`,
      payload: { model, ...params },
      timestamp_ms: Date.now(),
    });
  }

  emitToast(message: string, level: 'info' | 'warn' | 'error'): void {
    this.broadcast({
      type: 'emit_toast',
      entity_id: `toast:${randomUUID()}`,
      payload: { message, level },
      timestamp_ms: Date.now(),
    });
  }

  sendMessage(msg: SceneMessage): void {
    this.broadcast(msg);
  }

  attachClient(ws: WebSocket): void {
    this.clients.add(ws);
    // Replay current entity map to the new client
    for (const { entity } of this.entities.values()) {
      this.sendTo(ws, {
        type: 'upsert_entity',
        entity_id: entity.entity_id,
        payload: entity,
        timestamp_ms: Date.now(),
      });
    }
    ws.on('close', () => this.clients.delete(ws));
  }

  tickGC(currentTick: number): void {
    this.currentTick = currentTick;
    for (const [id, tracked] of this.entities) {
      const ttl = tracked.entity.ttl_ticks;
      if (
        typeof ttl === 'number' &&
        tracked.insertion_tick + ttl < currentTick
      ) {
        this.removeEntity(id);
      }
    }
  }

  snapshot(): SceneEntity[] {
    return Array.from(this.entities.values()).map((t) => t.entity);
  }

  clientCount(): number {
    return this.clients.size;
  }

  private broadcast(msg: SceneMessage): void {
    const payload = JSON.stringify(msg);
    for (const ws of this.clients) {
      if (ws.readyState === 1 /* OPEN */) {
        ws.send(payload);
      }
    }
  }

  private sendTo(ws: WebSocket, msg: SceneMessage): void {
    if (ws.readyState === 1) ws.send(JSON.stringify(msg));
  }
}

// Process-wide singleton (one orchestrator per process per Lock #4)
let _singleton: SceneController | null = null;
export function getSceneController(): SceneController {
  if (!_singleton) _singleton = new SceneController();
  return _singleton;
}
