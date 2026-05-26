// PolygonEngine — GLTF loader + three-mesh-bvh acceleration.
// Constructor takes a base URL ("" for /public, or your Supabase public bucket URL).
// Safe to import from server components; heavy work only runs when methods are called in the browser.

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  computeBoundsTree,
  disposeBoundsTree,
  acceleratedRaycast,
  MeshBVH,
} from "three-mesh-bvh";
import type { RaycastHit, Vec3 } from "./types";

// Idempotent prototype patch — guarded so HMR doesn't re-bind.
const PATCH_FLAG = "__atlasBvhPatched__";
if (!(THREE as unknown as Record<string, unknown>)[PATCH_FLAG]) {
  (THREE.BufferGeometry.prototype as unknown as {
    computeBoundsTree: typeof computeBoundsTree;
    disposeBoundsTree: typeof disposeBoundsTree;
  }).computeBoundsTree = computeBoundsTree;
  (THREE.BufferGeometry.prototype as unknown as {
    computeBoundsTree: typeof computeBoundsTree;
    disposeBoundsTree: typeof disposeBoundsTree;
  }).disposeBoundsTree = disposeBoundsTree;
  (THREE.Mesh.prototype as unknown as { raycast: typeof acceleratedRaycast }).raycast =
    acceleratedRaycast;
  (THREE as unknown as Record<string, unknown>)[PATCH_FLAG] = true;
}

export interface LoadedMesh {
  id: string;
  gltfPath: string;
  root: THREE.Object3D;
  meshes: THREE.Mesh[];
  bvh: MeshBVH[];
  aabb: THREE.Box3;
}

export class PolygonEngine {
  private cache = new Map<string, LoadedMesh>();
  private inFlight = new Map<string, Promise<LoadedMesh>>();
  private loader = new GLTFLoader();
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  get(id: string): LoadedMesh | undefined {
    return this.cache.get(id);
  }

  has(id: string): boolean {
    return this.cache.has(id);
  }

  list(): LoadedMesh[] {
    return Array.from(this.cache.values());
  }

  async load(id: string, gltfPath: string): Promise<LoadedMesh> {
    const cached = this.cache.get(id);
    if (cached) return cached;
    const pending = this.inFlight.get(id);
    if (pending) return pending;

    const url = gltfPath.startsWith("http")
      ? gltfPath
      : `${this.baseUrl}/${gltfPath.replace(/^\//, "")}`;

    const p = new Promise<LoadedMesh>((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => {
          const meshes: THREE.Mesh[] = [];
          gltf.scene.traverse((o) => {
            if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh);
          });
          const bvh: MeshBVH[] = [];
          for (const m of meshes) {
            const g = m.geometry as THREE.BufferGeometry;
            (g as unknown as { computeBoundsTree: () => void }).computeBoundsTree();
            const tree = (g as unknown as { boundsTree?: MeshBVH }).boundsTree;
            if (tree) bvh.push(tree);
          }
          const aabb = new THREE.Box3().setFromObject(gltf.scene);
          const rec: LoadedMesh = {
            id,
            gltfPath,
            root: gltf.scene,
            meshes,
            bvh,
            aabb,
          };
          this.cache.set(id, rec);
          this.inFlight.delete(id);
          resolve(rec);
        },
        undefined,
        (err) => {
          this.inFlight.delete(id);
          reject(err);
        },
      );
    });

    this.inFlight.set(id, p);
    return p;
  }

  raycast(origin: Vec3, dir: Vec3, far = 1000): RaycastHit | null {
    const ro = new THREE.Vector3(origin[0], origin[1], origin[2]);
    const rd = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
    const ray = new THREE.Raycaster(ro, rd, 0, far);

    let best: RaycastHit | null = null;
    for (const rec of this.cache.values()) {
      const hits = ray.intersectObjects(rec.meshes, true);
      if (hits.length === 0) continue;
      const h = hits[0];
      if (!best || h.distance < best.distance) {
        const n = h.face?.normal ?? new THREE.Vector3(0, 1, 0);
        best = {
          meshId: rec.id,
          point: [h.point.x, h.point.y, h.point.z] as Vec3,
          normal: [n.x, n.y, n.z] as Vec3,
          distance: h.distance,
        };
      }
    }
    return best;
  }

  overlap(min: Vec3, max: Vec3): LoadedMesh[] {
    const box = new THREE.Box3(
      new THREE.Vector3(min[0], min[1], min[2]),
      new THREE.Vector3(max[0], max[1], max[2]),
    );
    const out: LoadedMesh[] = [];
    for (const rec of this.cache.values()) {
      if (rec.aabb.intersectsBox(box)) out.push(rec);
    }
    return out;
  }

  dispose(id: string) {
    const rec = this.cache.get(id);
    if (!rec) return;
    for (const m of rec.meshes) {
      const g = m.geometry as THREE.BufferGeometry;
      (g as unknown as { disposeBoundsTree?: () => void }).disposeBoundsTree?.();
      g.dispose();
      const mat = m.material as THREE.Material | THREE.Material[];
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat.dispose();
    }
    this.cache.delete(id);
  }

  disposeAll() {
    for (const id of Array.from(this.cache.keys())) this.dispose(id);
  }
}

// Convenient singleton for the browser. Pages can swap in a custom engine via context.
let _singleton: PolygonEngine | null = null;
export function getPolygonEngine(baseUrl: string = ""): PolygonEngine {
  if (typeof window === "undefined") {
    // Return a throwaway instance on the server; never used for rendering.
    return new PolygonEngine(baseUrl);
  }
  if (!_singleton) _singleton = new PolygonEngine(baseUrl);
  return _singleton;
}