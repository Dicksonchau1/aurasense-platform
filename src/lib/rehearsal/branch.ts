// Rehearsal branch helpers — fork a live world into a deterministic sandbox,
// commit it back, and diff two branches tick-by-tick.

import { mulberry32, useWorld } from "@/lib/world/state";
import type { Branch, Entity, Tick, Vec3 } from "@/lib/world/types";

export interface ForkOptions {
  id?: string;          // defaults to "rh-<rand>"
  seed?: number;        // defaults to parent.seed xor Date.now()
}

export interface CommitOptions {
  // Strategy for merging the rehearsal tail back into the parent branch.
  // "append" = just append rehearsal ticks past parent.head onto parent.
  // "replace" = drop parent ticks after fork point, then append rehearsal tail.
  strategy?: "append" | "replace";
}

export interface EntityDiff {
  id: string;
  kind: "added" | "removed" | "moved" | "changed";
  before?: Entity;
  after?: Entity;
  posDelta?: Vec3;
}

export interface TickDiff {
  n: number;
  entities: EntityDiff[];
  eventCountDelta: number;
}

export interface BranchDiff {
  fromId: string;
  toId: string;
  forkedAtTick: number;
  diverged: boolean;
  ticks: TickDiff[];
}

function genId(prefix = "rh"): string {
  const r = Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0");
  return `${prefix}-${r}`;
}

function vecDelta(a: Vec3, b: Vec3): Vec3 {
  return [b[0] - a[0], b[1] - a[1], b[2] - a[2]] as Vec3;
}

function vecNonZero(d: Vec3, eps = 1e-6): boolean {
  return Math.abs(d[0]) > eps || Math.abs(d[1]) > eps || Math.abs(d[2]) > eps;
}

/**
 * Fork the currently active world branch into a new rehearsal branch.
 * Returns the new branch. The fork is deterministic if a seed is provided.
 */
export function forkWorld(opts: ForkOptions = {}): Branch {
  const store = useWorld.getState();
  const parentId = store.active;
  const parent = store.branches[parentId];
  if (!parent) throw new Error(`forkWorld: no active branch "${parentId}"`);
  const id = opts.id ?? genId("rh");
  const seed =
    opts.seed ?? ((parent.seed ^ (Date.now() & 0xffffffff)) >>> 0);
  const branch = store.fork(parentId, id, seed);
  store.setActive(id);
  return branch;
}

/**
 * Merge a rehearsal branch back into its parent.
 * Returns the parent branch after merge.
 */
export function commitBranch(
  branchId: string,
  opts: CommitOptions = {},
): Branch {
  const strategy = opts.strategy ?? "append";
  const store = useWorld.getState();
  const branch = store.branches[branchId];
  if (!branch) throw new Error(`commitBranch: missing branch "${branchId}"`);
  if (!branch.parentId) throw new Error(`commitBranch: "${branchId}" has no parent`);
  const parent = store.branches[branch.parentId];
  if (!parent) throw new Error(`commitBranch: missing parent "${branch.parentId}"`);

  // Find fork point: largest n present in both at the start of branch.ticks
  // (parent ticks were copied into branch at fork time, so they share a prefix).
  const forkPointN = parent.head;

  let mergedTicks: Tick[];
  if (strategy === "append") {
    const tail = branch.ticks.filter((t) => t.n > forkPointN);
    mergedTicks = [...parent.ticks, ...tail];
  } else {
    const parentHead = parent.ticks.filter((t) => t.n <= forkPointN);
    const tail = branch.ticks.filter((t) => t.n > forkPointN);
    mergedTicks = [...parentHead, ...tail];
  }

  // Apply ticks into the parent via the store so subscribers see the update.
  // We replace by issuing applyTick for the tail only.
  for (const t of mergedTicks.slice(parent.ticks.length)) {
    store.applyTick(parent.id, t);
  }
  return useWorld.getState().branches[parent.id];
}

/**
 * Diff two branches tick-by-tick from the fork point forward.
 */
export function diff(fromId: string, toId: string): BranchDiff {
  const store = useWorld.getState();
  const a = store.branches[fromId];
  const b = store.branches[toId];
  if (!a || !b) throw new Error(`diff: missing branch ${!a ? fromId : toId}`);

  // Establish fork point as the highest tick.n where both branches agree.
  let forkN = -1;
  const aByN = new Map(a.ticks.map((t) => [t.n, t] as const));
  const bByN = new Map(b.ticks.map((t) => [t.n, t] as const));
  for (const t of a.ticks) {
    const other = bByN.get(t.n);
    if (other && JSON.stringify(other.entities) === JSON.stringify(t.entities)) {
      if (t.n > forkN) forkN = t.n;
    }
  }

  const ticks: TickDiff[] = [];
  let diverged = false;

  const ns = new Set<number>();
  for (const t of a.ticks) if (t.n > forkN) ns.add(t.n);
  for (const t of b.ticks) if (t.n > forkN) ns.add(t.n);
  const ordered = Array.from(ns).sort((x, y) => x - y);

  for (const n of ordered) {
    const ta = aByN.get(n);
    const tb = bByN.get(n);
    const entA = ta?.entities ?? {};
    const entB = tb?.entities ?? {};
    const ids = new Set([...Object.keys(entA), ...Object.keys(entB)]);
    const ents: EntityDiff[] = [];
    for (const id of ids) {
      const before = entA[id];
      const after = entB[id];
      if (before && !after) ents.push({ id, kind: "removed", before });
      else if (!before && after) ents.push({ id, kind: "added", after });
      else if (before && after) {
        const dpos = vecDelta(before.pos, after.pos);
        if (vecNonZero(dpos)) {
          ents.push({ id, kind: "moved", before, after, posDelta: dpos });
        } else if (JSON.stringify(before) !== JSON.stringify(after)) {
          ents.push({ id, kind: "changed", before, after });
        }
      }
    }
    if (ents.length > 0) diverged = true;
    ticks.push({
      n,
      entities: ents,
      eventCountDelta: (tb?.events.length ?? 0) - (ta?.events.length ?? 0),
    });
  }

  return { fromId, toId, forkedAtTick: forkN, diverged, ticks };
}

/**
 * Convenience: deterministic RNG seeded from a branch.
 */
export function rngForBranch(branchId: string): () => number {
  const b = useWorld.getState().branches[branchId];
  if (!b) throw new Error(`rngForBranch: missing branch "${branchId}"`);
  return mulberry32(b.seed);
}