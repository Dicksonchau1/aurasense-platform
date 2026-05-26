import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

// ---------------------------------------------------------------------
// WorldState - single source of truth for live + rehearsal ticks
// ---------------------------------------------------------------------
// Deterministic tick-based simulation (fixed dt, seeded RNG).
// Shared by /dashboard/world-model (live) and /rehearse/drone (fork).

export type Vec3 = readonly [number, number, number];
export type Quat = readonly [number, number, number, number];

export interface Entity {
  id: string;
  kind: "drone" | "humanoid" | "static" | "target" | "sensor";
  pos: Vec3;
  rot: Quat;
  vel: Vec3;
  meshId?: string; // points into PolygonEngine
  meta?: Record<string, unknown>;
}

export interface Tick {
  n: number; // tick index
  t: number; // simulated seconds
  entities: Readonly<Record<string, Entity>>;
  events: ReadonlyArray<{ kind: string; payload: unknown }>;
}

export interface Branch {
  id: string;       // "live" | "rh-<uuid>"
  parentId: string | null;
  seed: number;     // for deterministic RNG
  dt: number;       // fixed step (s)
  head: number;     // current tick index
  ticks: Tick[];   // ring buffer (live) or full history (rehearsal)
}

export interface WorldState {
  branches: Record<string, Branch>;
  active: string; // currently viewed branch id
  // actions
  applyTick: (branchId: string, tick: Tick) => void;
  fork: (from: string, id: string, seed?: number) => Branch;
  setActive: (id: string) => void;
  scrub: (branchId: string, n: number) => void;
}

const LIVE_RING_CAP = 1800; // 1 min @ 30 Hz

export const useWorld = create<WorldState>((set, get) => ({
  active: "live",
  branches: {
    live: {
      id: "live",
      parentId: null,
      seed: 0xC0FFEE,
      dt: 1 / 30,
      head: -1,
      ticks: [],
    },
  },
  applyTick: (branchId, tick) =>
    set((s) => {
      const b = s.branches[branchId];
      if (!b) return s;
      const ticks =
        branchId === "live"
          ? [...b.ticks.slice(-(LIVE_RING_CAP - 1)), tick]
          : [...b.ticks, tick];
      return {
        ...s,
        branches: {
          ...s.branches,
          [branchId]: { ...b, ticks, head: tick.n },
        },
      };
    }),
  fork: (from, id, seed) => {
    const parent = get().branches[from];
    if (!parent) throw new Error(`no branch ${from}`);
    const branch: Branch = {
      id,
      parentId: from,
      seed: seed ?? (parent.seed ^ (Date.now() & 0xffffffff)) >>> 0,
      dt: parent.dt,
      head: parent.head,
      ticks: [...parent.ticks],
    };
    set((s) => ({
      ...s,
      branches: { ...s.branches, [id]: branch },
    }));
    return branch;
  },
  setActive: (id) => set((s) => ({ ...s, active: id })),
  scrub: (branchId, n) =>
    set((s) => {
      const b = s.branches[branchId];
      if (!b) return s;
      const clamped = Math.max(0, Math.min(b.ticks.length - 1, n));
      return {
        ...s,
        branches: { ...s.branches, [branchId]: { ...b, head: clamped } },
      };
    }),
}));

// ---------------------------------------------------------------------
// Deterministic RNG (mulberry32)
// ---------------------------------------------------------------------
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const subscribeWorld = subscribeWithSelector;


