// Pure type module for the World layer. Zero runtime, SSR-safe.

export type Vec3 = readonly [number, number, number];
export type Quat = readonly [number, number, number, number];

export type EntityKind = "drone" | "humanoid" | "static" | "target" | "sensor";

export interface Entity {
  id: string;
  kind: EntityKind;
  pos: Vec3;
  rot: Quat;
  vel: Vec3;
  meshId?: string;
  meta?: Record<string, unknown>;
}

export interface Tick {
  n: number;
  t: number;
  entities: Readonly<Record<string, Entity>>;
  events: ReadonlyArray<{ kind: string; payload: unknown }>;
}

export interface Branch {
  id: string;
  parentId: string | null;
  seed: number;
  dt: number;
  head: number;
  ticks: Tick[];
}

export interface MeshRecord {
  id: string;
  gltfPath: string;
  // Three objects are typed as unknown here to keep this module SSR-safe.
  // PolygonEngine narrows them internally.
  root: unknown;
  meshes: unknown[];
  bvh: unknown[];
  aabb: { min: Vec3; max: Vec3 };
}

export interface RaycastHit {
  meshId: string;
  point: Vec3;
  normal: Vec3;
  distance: number;
}

export interface OccupancyCell {
  key: string;          // "x,y,z" cell coordinates
  count: number;        // number of entities seen in this cell
  lastSeenTick: number;
  labels: Record<string, number>; // label -> confidence [0..1]
}

export interface NavNode {
  id: string;
  pos: Vec3;
}

export interface NavEdge {
  a: string;
  b: string;
  cost: number;
}

export interface SpatialQueryResult {
  occupancy: number;                 // density estimate at point
  labels: Record<string, number>;    // aggregated semantic labels
  nearestNav: NavNode | null;
  cells: OccupancyCell[];            // raw cells in radius
}

export interface SpatialSenseOptions {
  cellSize?: number;       // meters per occupancy cell, default 1.0
  decayPerTick?: number;   // label confidence decay, default 0.995
  forgetAfterTicks?: number; // drop cells unseen for this long, default 600
}