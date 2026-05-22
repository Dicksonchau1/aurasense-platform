// src/lib/signature-map/altitudeBand.ts
import type { AltitudeBand } from './types';

export function latLngToAltitudeBand(alt_m: number): AltitudeBand {
  if (alt_m < 5) return 'ground';
  if (alt_m < 50) return 'low';
  if (alt_m < 200) return 'mid';
  return 'high';
}
