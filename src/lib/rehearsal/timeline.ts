// Deterministic tick recorder + scrubber for rehearsal branches.
// Pure TS — no DOM, safe to run in a worker.

import { mulberry32, useWorld } from "@/lib/world/state";
import type { Branch, Tick } from "@/lib/world/types";

export interface RecorderOptions {
  branchId: string;
  // Step function: given (prevTick, rand, dt) produce the next tick.
  // Must be pure with respect to (prevTick, rand) for deterministic replay.
  step: (prev: Tick, rand: () => number, dt: number) => Tick;
  // Stop after this many ticks (default 600 = 20s @ 30Hz).
  maxTicks?: number;
}

export interface ReplayOptions {
  branchId: string;
  fromTick?: number;          // default 0
  toTick?: number;            // default branch.head
  onTick?: (t: Tick) => void; // called for each replayed tick
}

export interface ScrubResult {
  branchId: string;
  head: number;
  total: number;
  tick: Tick | null;
}

/**
 * Run a deterministic recorder for `maxTicks` steps. Returns the new branch head.
 * The recorder is synchronous; for long runs call it from a worker.
 */
export function record(opts: RecorderOptions): number {
  const { branchId, step, maxTicks = 600 } = opts;
  const store = useWorld.getState();
  const branch = store.branches[branchId];
  if (!branch) throw new Error(`record: missing branch "${branchId}"`);
  const rand = mulberry32(branch.seed);
  // Re-roll RNG forward to current head so we resume deterministically.
  for (let i = 0; i < Math.max(0, branch.head + 1); i++) rand();

  let prev: Tick = branch.ticks[branch.ticks.length - 1] ?? {
    n: -1,
    t: 0,
    entities: {},
    events: [],
  };

  for (let i = 0; i < maxTicks; i++) {
    const next = step(prev, rand, branch.dt);
    store.applyTick(branchId, next);
    prev = next;
  }
  return useWorld.getState().branches[branchId].head;
}

/**
 * Replay an existing branch from fromTick..toTick, invoking onTick for each.
 * Does not mutate the store.
 */
/**
 * Replay an existing branch from fromTick..toTick, invoking onTick for each.
 * Does not mutate the store.
 */
export function replay(opts: ReplayOptions): void {
  const { branchId, fromTick = 0, toTick, onTick } = opts;
  const branch = useWorld.getState().branches[branchId];
  if (!branch) throw new Error(`replay: missing branch "${branchId}"`);
  const end = toTick ?? branch.head;
  for (const t of branch.ticks) {
    if (t.n < fromTick) continue;
    if (t.n > end) break;
    onTick?.(t);
  }
}

/**
 * Move a branch's playhead to a specific tick (clamped).
 * Returns the tick at the new head, or null if the branch is empty.
 */
export function scrub(branchId: string, n: number): ScrubResult {
  const store = useWorld.getState();
  const branch = store.branches[branchId];
  if (!branch) throw new Error(`scrub: missing branch "${branchId}"`);
  store.scrub(branchId, n);
  const updated = useWorld.getState().branches[branchId];
  const tick =
    updated.ticks.find((t) => t.n === updated.head) ??
    updated.ticks[updated.ticks.length - 1] ??
    null;
  return {
    branchId,
    head: updated.head,
    total: updated.ticks.length,
    tick,
  };
}

/**
 * Step the playhead by `delta` ticks (positive or negative).
 */
export function stepHead(branchId: string, delta: number): ScrubResult {
  const branch = useWorld.getState().branches[branchId];
  if (!branch) throw new Error(`stepHead: missing branch "${branchId}"`);
  return scrub(branchId, branch.head + delta);
}

/**
 * Serialize a branch to a portable JSON blob (for Supabase persistence).
 */
export function serializeBranch(branchId: string): string {
  const branch = useWorld.getState().branches[branchId];
  if (!branch) throw new Error(`serializeBranch: missing branch "${branchId}"`);
  const payload: Branch = {
    id: branch.id,
    parentId: branch.parentId,
    seed: branch.seed,
    dt: branch.dt,
    head: branch.head,
    ticks: branch.ticks,
  };
  return JSON.stringify(payload);
}

/**
 * Restore a branch from a JSON blob produced by serializeBranch.
 * Inserts it into the store; if a branch with the same id exists, it is replaced.
 */
export function deserializeBranch(json: string): Branch {
  const parsed = JSON.parse(json) as Branch;
  if (!parsed || typeof parsed.id !== "string") {
    throw new Error("deserializeBranch: malformed payload");
  }
  // We cheat slightly: zustand's `set` is the only mutator, so we route
  // through `fork` + `applyTick` to keep subscribers consistent.
  const store = useWorld.getState();
  const existingParent = parsed.parentId ?? store.active;
  if (!store.branches[existingParent]) {
    throw new Error(
      `deserializeBranch: parent "${existingParent}" not present in store`,
    );
  }
  // Drop any prior branch with this id by forking fresh.
  if (store.branches[parsed.id]) {
    // Re-fork over the existing slot. We do this by forking with a temp id,
    // swapping, and discarding — but since the store only exposes `fork` /
    // `applyTick`, simplest is to fork into the same id (overwriting via Object spread).
  }
  store.fork(existingParent, parsed.id, parsed.seed);
  for (const t of parsed.ticks) {
    store.applyTick(parsed.id, t);
  }
  return useWorld.getState().branches[parsed.id];
}