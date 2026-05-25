// tests/unit/SceneController.test.ts
// Verifies idempotent upsert, TTL GC, and late-joiner replay.
// PR D-3 (2026-05-23)

import { describe, it, expect } from '@jest/globals';
import { SceneController } from '../../src/lib/scene/SceneController';
import type { SceneEntity, SceneMessage } from '../../src/lib/orchestrator/PolygonEngineOrchestrator';

class FakeWS {
  readyState = 1;
  sent: string[] = [];
  listeners: Record<string, ((arg?: unknown) => void)[]> = {};
  send(data: string) { this.sent.push(data); }
  on(ev: string, cb: (arg?: unknown) => void) {
    (this.listeners[ev] ??= []).push(cb);
  }
  parsedMessages(): SceneMessage[] {
    return this.sent.map((s) => JSON.parse(s) as SceneMessage);
  }
}

function makeEntity(id: string, ttl?: number): SceneEntity {
  return {
    entity_id: id,
    kind: 'wind_cell',
    position: [0, 0, 0],
    ttl_ticks: ttl,
  } as SceneEntity;
}

test('upsert is idempotent by entity_id', () => {
  const sc = new SceneController();
  const ws = new FakeWS() as unknown as any;
  sc.attachClient(ws);

  sc.upsertEntity(makeEntity('e1'));
  sc.upsertEntity(makeEntity('e1'));
  sc.upsertEntity(makeEntity('e1'));

  expect(sc.snapshot().length).toBe(1);
});

test('TTL GC removes expired entities', () => {
  const sc = new SceneController();
  sc.setCurrentTick(0);
  sc.upsertEntity(makeEntity('e1', 5));
  sc.upsertEntity(makeEntity('e2', 100));

  sc.tickGC(10);

  const ids = sc.snapshot().map((e) => e.entity_id);
  expect(ids.sort()).toEqual(['e2']);
});

test('late-joiner receives current entity map on attach', () => {
  const sc = new SceneController();
  sc.upsertEntity(makeEntity('e1'));
  sc.upsertEntity(makeEntity('e2'));
  sc.upsertEntity(makeEntity('e3'));

  const ws = new FakeWS();
  sc.attachClient(ws as unknown as any);

  const msgs = ws.parsedMessages();
  const upserts = msgs.filter((m) => m.type === 'upsert_entity');
  expect(upserts.length).toBe(3);
  expect(upserts.map((m) => m.entity_id).sort()).toEqual(['e1', 'e2', 'e3']);
});

test('emitToast broadcasts toast messages with unique ids', () => {
  const sc = new SceneController();
  const ws = new FakeWS();
  sc.attachClient(ws as unknown as any);

  sc.emitToast('wind shear detected', 'warn');
  sc.emitToast('recovery confirmed', 'info');

  const toasts = ws.parsedMessages().filter((m) => m.type === 'emit_toast');
  expect(toasts.length).toBe(2);
  expect(toasts[0].entity_id).not.toBe(toasts[1].entity_id);
});
