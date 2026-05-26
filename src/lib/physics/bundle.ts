import { createHash } from "crypto";
import { AIRFRAMES } from "./airframes";

const PHYSICS_CODE_VERSION = "1.0.0";
const INTEGRATOR_KIND = "rk4";

export interface PhysicsBundleManifest {
  readonly codeVersion: string;
  readonly integrator: string;
  readonly airframeCount: number;
  readonly airframeIds: readonly string[];
  readonly airframeChecksum: string;
}

function stableStringify(obj: unknown): string {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return "[" + obj.map(stableStringify).join(",") + "]";
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  return "{" + keys.map(k => JSON.stringify(k) + ":" + stableStringify((obj as Record<string, unknown>)[k])).join(",") + "}";
}

export function airframeChecksum(): string {
  const ids = Object.keys(AIRFRAMES).sort();
  const flat = ids.map(id => ({ id, spec: AIRFRAMES[id] }));
  return createHash("sha256").update(stableStringify(flat)).digest("hex");
}

export function physicsBundleManifest(): PhysicsBundleManifest {
  const ids = Object.keys(AIRFRAMES).sort();
  return Object.freeze({
    codeVersion: PHYSICS_CODE_VERSION,
    integrator: INTEGRATOR_KIND,
    airframeCount: ids.length,
    airframeIds: ids,
    airframeChecksum: airframeChecksum(),
  });
}

export function physicsBundleHash(): string {
  return createHash("sha256").update(stableStringify(physicsBundleManifest())).digest("hex");
}
