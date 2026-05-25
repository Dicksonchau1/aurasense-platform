'use client';

import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { makeCoverageMap, paintCoverage } from './coverageMap';
import { computeSurfaceHits } from './computeHits';
import type { Rollout, Scores } from '../nepa/client';

export function CoverageOverlay({ rollout, scores, assetIds }:{
  rollout: Rollout; scores: Scores; assetIds: string[];
}) {
  const { scene } = useThree();
  const cmap = useMemo(() => makeCoverageMap(assetIds), [assetIds.join(',')]);

  useEffect(() => {
    const hits = computeSurfaceHits({ rollout, scores, scene });
    paintCoverage(cmap, hits);

    // Attach the coverage texture to each asset as an overlay layer
    scene.traverse((o) => {
      const id = o.userData?.assetId;
      if (!id || !(o instanceof THREE.Mesh)) return;
      const tex = cmap.textures.get(id); if (!tex) return;
      const mat = (o.material as THREE.MeshStandardMaterial).clone();
      mat.emissiveMap = tex;
      mat.emissive = new THREE.Color('#ffffff');
      mat.emissiveIntensity = 0.9;
      o.material = mat;
    });
  }, [rollout, scores, scene, cmap]);

  return null;
}