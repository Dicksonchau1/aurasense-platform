import * as THREE from 'three';
import type { Rollout, Scores } from '../nepa/client';

export function computeSurfaceHits(opts: {
  rollout: Rollout;
  scores: Scores;
  scene: THREE.Object3D;
  fovDeg?: number;
  raysPerStep?: number;
}) {
  const fov = (opts.fovDeg ?? 70) * Math.PI / 180;
  const N = opts.raysPerStep ?? 24;
  const raycaster = new THREE.Raycaster();
  const hits: { assetId: string; uv: THREE.Vector2; coverageStrength: number; defectLikelihood: number }[] = [];

  opts.rollout.states.forEach((s, i) => {
    const origin = new THREE.Vector3(s.pose.x, s.pose.y, s.pose.z);
    const q = new THREE.Quaternion(s.pose.qx, s.pose.qy, s.pose.qz, s.pose.qw);
    const fwd = new THREE.Vector3(0,0,-1).applyQuaternion(q);
    const up  = new THREE.Vector3(0,1,0).applyQuaternion(q);
    const right = new THREE.Vector3().crossVectors(fwd, up);

    for (let k = 0; k < N; k++) {
      const ax = (Math.random() - 0.5) * fov;
      const ay = (Math.random() - 0.5) * fov;
      const dir = fwd.clone()
        .addScaledVector(right, Math.tan(ax))
        .addScaledVector(up,    Math.tan(ay))
        .normalize();
      raycaster.set(origin, dir);
      const ints = raycaster.intersectObject(opts.scene, true);
      if (!ints.length || !ints[0].uv) continue;
      const hit = ints[0];
      const dist = hit.distance;
      const conf = 1 - (opts.rollout.uncertainty[i] ?? 0);
      const coverageStrength = conf * Math.exp(-dist * 0.05);
      hits.push({
        assetId: (hit.object.userData?.assetId ?? hit.object.name ?? 'asset_unknown'),
        uv: hit.uv.clone(),
        coverageStrength,
        defectLikelihood: opts.scores.defectLikelihood * coverageStrength,
      });
    }
  });

  return hits;
}