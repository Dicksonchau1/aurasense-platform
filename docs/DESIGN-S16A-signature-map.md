# DESIGN.md §16-A — signature_map: 3D Spatial Index of Physical-Law Signatures

> Status: LOCKED (2026-05-22, Architectural Lock #4)

## 16-A.1 What the signature_map Is

The signature_map is the **civilisation map's 3D spatial index** — the persistent, shared, append-only repository of locally-calibrated physical-law signatures contributed by every ATLAS deployment worldwide. It is not a flat database of model weights. It is a geospatially indexed collection of **lawful patterns observed at specific physical locations, on specific structures, under specific operational regimes**.

Every signature entry carries five mandatory anchors:

| Anchor | Type | Description |
|---|---|---|
| `geometric_anchor` | H3 cell (res 9) + altitude band | Where the signature manifested in physical space |
| `structural_anchor` | object_id + structural_class + node_id | Which object/structure the signature was extracted from |
| `regime_anchor` | Serialised regime descriptor + SHA-256 hash | Operational conditions under which the signature was active |
| `signature_payload` | Locked physical-law pattern (JSON) | The actual accretively-gathered signature from Axiom #2 |
| `contribution_provenance` | run_id + frame_id + audit_hash + chain_hash | Audit trail back to the originating frame, hash-chained |

## 16-A.2 TypeScript Interface

```typescript
// src/lib/signature-map/types.ts

export type H3Cell = string; // H3 index string at resolution 9 (~174 m² cells)
export type AltitudeBand = 'ground' | 'low' | 'mid' | 'high'; // <5m, 5-50m, 50-200m, >200m

export interface GeometricAnchor {
  h3_cell: H3Cell;          // H3 res-9 cell of the 3D location
  altitude_band: AltitudeBand;
  lat: number;
  lon: number;
  alt_m: number;
}

export interface StructuralAnchor {
  object_id: string;         // Unique ID of the physical object (e.g. 'tsing-ma-bridge-N17')
  structural_class: string;  // Taxonomy: 'suspension_bridge' | 'wind_turbine' | 'building_facade' | 'pipeline' | ...
  node_id?: string;          // Optional sub-node on the structure
  object_metadata?: Record<string, unknown>;
}

export interface RegimeAnchor {
  wind_speed_ms?: number;
  wind_direction_deg?: number;
  sun_azimuth_deg?: number;
  sun_elevation_deg?: number;
  time_of_day_utc?: string;  // HH:MM
  payload_kg?: number;
  temperature_c?: number;
  [key: string]: unknown;    // Extensible for domain-specific regime fields
  regime_hash: string;       // SHA-256 of deterministic JSON.stringify of all regime fields
}

export interface SignaturePayload {
  signature_type: string;    // e.g. 'engine_response_time_constant' | 'wind_drift_vector' | 'crack_propagation_rate'
  parameters: Record<string, number | string>; // The locked-in pattern values
  projectedPath?: [number, number, number][];  // 3D scene coords for trajectory projection
  confidence: number;        // 0..1
  observation_count: number; // How many frames contributed to this signature
}

export interface ContributionProvenance {
  deployment_id: string;
  run_id: string;
  frame_id: string;
  audit_hash: string;        // SHA-256 of the originating frame content
  chain_hash: string;        // SHA-256(previous_chain_hash + audit_hash) — hash-chained
  contributed_at: string;    // ISO-8601 timestamp
}

export interface SignatureEntry {
  id: string;                // UUID primary key
  geometric_anchor: GeometricAnchor;
  structural_anchor: StructuralAnchor;
  regime_anchor: RegimeAnchor;
  signature_payload: SignaturePayload;
  contribution_provenance: ContributionProvenance;
  created_at: string;
  updated_at: string;
}
```

## 16-A.3 Supabase Migration

```sql
-- supabase/migrations/20260522230000_create_signature_map.sql

create extension if not exists postgis;

create table public.signature_map (
  id                   uuid primary key default gen_random_uuid(),
  h3_cell              text not null,          -- H3 res-9 index
  altitude_band        text not null check (altitude_band in ('ground','low','mid','high')),
  lat                  double precision not null,
  lon                  double precision not null,
  alt_m                double precision not null,
  object_id            text not null,
  structural_class     text not null,
  node_id              text,
  object_metadata      jsonb default '{}',
  regime_hash          text not null,          -- SHA-256 of regime fields
  regime_anchor        jsonb not null,
  signature_type       text not null,
  signature_payload    jsonb not null,
  deployment_id        text not null,
  run_id               text not null,
  frame_id             text not null,
  audit_hash           text not null,
  chain_hash           text not null,
  contributed_at       timestamptz not null default now(),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Spatial neighbourhood query index (H3 prefix matching)
create index idx_signature_map_h3 on public.signature_map (h3_cell);

-- Structural class + object query index
create index idx_signature_map_structural on public.signature_map (structural_class, object_id);

-- Regime hash lookup for exact-regime matching
create index idx_signature_map_regime on public.signature_map (regime_hash);

-- Audit chain query
create index idx_signature_map_audit on public.signature_map (run_id, frame_id);

-- RLS: authenticated users can read; service role can write
alter table public.signature_map enable row level security;
create policy "read_signature_map" on public.signature_map for select using (true);
create policy "write_signature_map" on public.signature_map for insert with check (auth.role() = 'service_role');
```

## 16-A.4 Read Protocol — Spatial Neighbourhood Query

When a rehearse session starts for a given (lat, lon, alt, structural_class, regime), the SignatureMapClient:

1. Computes the H3 res-9 cell for the target location
2. Expands to the k=1 ring (7 cells covering ~1.2 km²) or k=2 ring (19 cells) for sparser deployments
3. Queries `signature_map` WHERE `h3_cell IN (ring_cells) AND structural_class = ? AND regime_hash = ?`
4. Returns matching `SignatureEntry[]` sorted by `observation_count DESC` (most-observed first)
5. These entries are loaded as the substrate's prior weights for the session

```typescript
// src/lib/signature-map/SignatureMapClient.ts (read excerpt)
async queryNeighbourhood(params: {
  lat: number; lon: number; alt_m: number;
  structural_class: string;
  regime_hash: string;
  k_ring?: number; // default 1
}): Promise<SignatureEntry[]> {
  const cell = latLngToCell(params.lat, params.lon, 9);
  const ring = gridDisk(cell, params.k_ring ?? 1);
  const { data, error } = await this.supabase
    .from('signature_map')
    .select('*')
    .in('h3_cell', ring)
    .eq('structural_class', params.structural_class)
    .eq('regime_hash', params.regime_hash)
    .order('observation_count', { ascending: false });
  if (error) throw error;
  return data as SignatureEntry[];
}
```

## 16-A.5 Write Protocol — Frame-to-Contribution Normalisation

At checkpoint or session end, the orchestrator normalises captured frames:

1. Take each `frame:captured` log entry (contains geometric + structural + regime context)
2. Extract the signature payload from the frame's substrate state snapshot
3. Compute `regime_hash = SHA-256(deterministicStringify(regimeFields))`
4. Compute `audit_hash = SHA-256(frame_content_bytes)`
5. Compute `chain_hash = SHA-256(previous_chain_hash + audit_hash)`
6. Write the `SignatureEntry` to `signature_map` via service role
7. Update the local chain tip for the deployment

## 16-A.6 The Civilisation-Scale Moat

The signature_map is the moat. Every deployment adds anchored signatures. Every future rehearse in the same spatial neighbourhood starts from a richer prior. The map is append-only and hash-chained — contributions cannot be silently altered. The geometric index means spatial neighbours share knowledge automatically. This is not a feature; it is the core value proposition: **ATLAS gets smarter at every location every time anyone deploys there**.
