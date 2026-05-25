import * as THREE from 'three';
import type { Rollout, Scores } from '../nepa/client';

export type CoverageMap = {
  textures: Map<string, THREE.CanvasTexture>;
  canvases: Map<string, HTMLCanvasElement>;
  resolution: number;
};

export function makeCoverageMap(assetIds: string[], resolution = 1024): CoverageMap {
  const textures = new Map<string, THREE.CanvasTexture>();
  const canvases = new Map<string, HTMLCanvasElement>();
  for (const id of assetIds) {
    const c = document.createElement('canvas');
    c.width = c.height = resolution;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = 'rgba(255,255,255,0)';
    ctx.fillRect(0,0,resolution,resolution);
    canvases.set(id, c);
    const t = new THREE.CanvasTexture(c);
    t.flipY = false;
    textures.set(id, t);
  }
  return { textures, canvases, resolution };
}

export function paintCoverage(
  cmap: CoverageMap,
  hits: { assetId: string; uv: THREE.Vector2; coverageStrength: number; defectLikelihood: number }[],
) {
  for (const h of hits) {
    const c = cmap.canvases.get(h.assetId); if (!c) continue;
    const ctx = c.getContext('2d')!;
    const x = h.uv.x * cmap.resolution;
    const y = h.uv.y * cmap.resolution;
    const r = 14;
    // Coverage in green channel, defect-likelihood in red channel
    const g = Math.min(255, Math.floor(h.coverageStrength * 255));
    const rd = Math.min(255, Math.floor(h.defectLikelihood * 255));
    const grad = ctx.createRadialGradient(x,y,0,x,y,r);
    grad.addColorStop(0, `rgba(${rd},${g},0,0.6)`);
    grad.addColorStop(1, `rgba(${rd},${g},0,0)`);
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    cmap.textures.get(h.assetId)!.needsUpdate = true;
  }
}