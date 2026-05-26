'use client';

import { useRouter } from 'next/navigation';
import { atlasNavMap, type AtlasNavKey, type AtlasNavTarget } from '@/lib/atlas-nav';

export function useAtlasNav() {
  const router = useRouter();

  function navTo(target: AtlasNavKey | AtlasNavTarget) {
    const path = target in atlasNavMap ? atlasNavMap[target as AtlasNavKey] : target;
    router.push(path);
  }

  return { navTo, atlasNavMap };
}
