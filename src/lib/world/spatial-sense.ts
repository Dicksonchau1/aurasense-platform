// SpatialSense — sparse 3D occupancy grid + semantic field + nav graph + A*.
// Pure TS, no DOM, no three.js. Designed to run in a web worker later.

import type {
  NavEdge,
  NavNode,
  OccupancyCell,
  RaycastHit,
  SpatialQueryResult,
  SpatialSenseOptions,
  Tick,
  Vec3,
} from "./types";

function cellKey(x: number, y: number, z: number): string {
  return `${x},${y},${z}`;
}

function dist(a: Vec3, b: Vec3): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Minimal binary heap for A* open set. Lower priority = popped first.
class MinHeap<T> {
  private data: Array<{ k: number; v: T }> = [];
  size(): number {
    return this.data.length;
  }
  push(k: number, v: T): void {
    this.data.push({ k, v });
    this.bubbleUp(this.data.length - 1);
  }
  pop(): T | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      this.sinkDown(0);
    }
    return top.v;
  }
  private bubbleUp(i: number) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.data[p].k <= this.data[i].k) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  private sinkDown(i: number) {
    const n = this.data.length;
    for (;;) {
      const l = i * 2 + 1;
      const r = l + 1;
      let s = i;
      if (l < n && this.data[l].k < this.data[s].k) s = l;
      if (r < n && this.data[r].k < this.data[s].k) s = r;
      if (s === i) break;
      [this.data[s], this.data[i]] = [this.data[i], this.data[s]];
      i = s;
    }
  }
}

export class SpatialSense {
  private cells = new Map<string, OccupancyCell>();
  private nodes = new Map<string, NavNode>();
  private adj = new Map<string, NavEdge[]>();
  private readonly cellSize: number;
  private readonly decay: number;
  private readonly forgetAfter: number;
  private currentTick = 0;

  constructor(opts: SpatialSenseOptions = {}) {
    this.cellSize = opts.cellSize ?? 1.0;
    this.decay = opts.decayPerTick ?? 0.995;
    this.forgetAfter = opts.forgetAfterTicks ?? 600;
  }

  // ---------- nav graph ----------
  addNode(node: NavNode): void {
    this.nodes.set(node.id, node);
    if (!this.adj.has(node.id)) this.adj.set(node.id, []);
  }

  addEdge(edge: NavEdge): void {
    const a = this.adj.get(edge.a);
    const b = this.adj.get(edge.b);
    if (!a || !b) throw new Error(`addEdge: missing node ${edge.a} or ${edge.b}`);
    a.push(edge);
    b.push({ a: edge.b, b: edge.a, cost: edge.cost });
  }

  pathfind(startId: string, goalId: string): NavNode[] | null {
    const start = this.nodes.get(startId);
    const goal = this.nodes.get(goalId);
    if (!start || !goal) return null;

    const open = new MinHeap<string>();
    const came = new Map<string, string>();
    const g = new Map<string, number>();
    g.set(startId, 0);
    open.push(dist(start.pos, goal.pos), startId);

    while (open.size() > 0) {
      const cur = open.pop()!;
      if (cur === goalId) {
        const path: NavNode[] = [];
        let id: string | undefined = cur;
        while (id) {
          const n = this.nodes.get(id);
          if (n) path.unshift(n);
          id = came.get(id);
        }
        return path;
      }
      const curNode = this.nodes.get(cur);
      if (!curNode) continue;
      const edges = this.adj.get(cur) ?? [];
      for (const e of edges) {
        const next = this.nodes.get(e.b);
        if (!next) continue;
        const tentative = (g.get(cur) ?? Infinity) + e.cost;
        if (tentative < (g.get(e.b) ?? Infinity)) {
          came.set(e.b, cur);
          g.set(e.b, tentative);
          const f = tentative + dist(next.pos, goal.pos);
          open.push(f, e.b);
        }
      }
    }
    return null;
  }

  // ---------- occupancy + semantic ingest ----------
  private cellCoordsFor(pos: Vec3): [number, number, number] {
    return [
      Math.floor(pos[0] / this.cellSize),
      Math.floor(pos[1] / this.cellSize),
      Math.floor(pos[2] / this.cellSize),
    ];
  }

  ingestTick(tick: Tick): void {
    this.currentTick = tick.n;
    // Decay all labels.
    for (const cell of this.cells.values()) {
      for (const k of Object.keys(cell.labels)) {
        cell.labels[k] *= this.decay;
        if (cell.labels[k] < 0.01) delete cell.labels[k];
      }
    }
    // Update occupancy from entities.
    for (const e of Object.values(tick.entities)) {
      const [cx, cy, cz] = this.cellCoordsFor(e.pos);
      const key = cellKey(cx, cy, cz);
      const cell =
        this.cells.get(key) ??
        ({ key, count: 0, lastSeenTick: tick.n, labels: {} } as OccupancyCell);
      cell.count += 1;
      cell.lastSeenTick = tick.n;
      cell.labels[e.kind] = Math.min(1, (cell.labels[e.kind] ?? 0) + 0.25);
      this.cells.set(key, cell);
    }
    // Forget stale cells.
    if (tick.n % 60 === 0) {
      for (const [key, cell] of this.cells) {
        if (tick.n - cell.lastSeenTick > this.forgetAfter) this.cells.delete(key);
      }
    }
  }

  ingestRaycast(hit: RaycastHit, label: string, confidence = 0.6): void {
    const [cx, cy, cz] = this.cellCoordsFor(hit.point);
    const key = cellKey(cx, cy, cz);
    const cell =
      this.cells.get(key) ??
      ({ key, count: 0, lastSeenTick: this.currentTick, labels: {} } as OccupancyCell);
    cell.labels[label] = Math.min(1, (cell.labels[label] ?? 0) + confidence);
    cell.lastSeenTick = this.currentTick;
    this.cells.set(key, cell);
  }

  // ---------- query ----------
  query(point: Vec3, radius: number): SpatialQueryResult {
    const r = Math.max(radius, this.cellSize);
    const rCells = Math.ceil(r / this.cellSize);
    const [cx, cy, cz] = this.cellCoordsFor(point);
    const result: SpatialQueryResult = {
      occupancy: 0,
      labels: {},
      nearestNav: null,
      cells: [],
    };
    let total = 0;
    for (let dx = -rCells; dx <= rCells; dx++) {
      for (let dy = -rCells; dy <= rCells; dy++) {
        for (let dz = -rCells; dz <= rCells; dz++) {
          const key = cellKey(cx + dx, cy + dy, cz + dz);
          const cell = this.cells.get(key);
          if (!cell) continue;
          result.cells.push(cell);
          total += cell.count;
          for (const [k, v] of Object.entries(cell.labels)) {
            result.labels[k] = (result.labels[k] ?? 0) + v;
          }
        }
      }
    }
    const vol = Math.max(1, result.cells.length);
    result.occupancy = total / vol;

    let best: NavNode | null = null;
    let bestD = Infinity;
    for (const n of this.nodes.values()) {
      const d = dist(n.pos, point);
      if (d < bestD) {
        bestD = d;
        best = n;
      }
    }
    result.nearestNav = best;
    return result;
  }

  // ---------- introspection ----------
  cellCount(): number {
    return this.cells.size;
  }
  snapshot(): OccupancyCell[] {
    return Array.from(this.cells.values());
  }
  clear(): void {
    this.cells.clear();
  }
}