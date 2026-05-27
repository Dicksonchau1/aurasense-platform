# Aura Rehearse — Architecture Map

Companion to `AUDIT_2026_05.md`. Source of truth for **what's actually wired** across the 18 NEPA subdomains as of May 2026. Status legend:

- 🟢 **real** — runs in production, owned by this repo
- 🟡 **stub / fixture** — endpoint exists, returns mock or static data
- 🟠 **proxy** — owned by sibling repo `Dicksonchau1/AuraSense_NEPA` (`feat/edge-service-v1`), this repo only forwards
- 🔴 **absent** — no code, no plan in this milestone

```
┌──────────────────────────── BROWSER (Next.js client) ─────────────────────────────┐
│                                                                                   │
│  /rehearse  ─── 🟢 MediaPipe Tasks Vision (CDN)                                   │
│              ─── 🟢 Web Audio API                                                 │
│              ─── 🟢 client-side envelope/consistency in src/lib/signals.ts        │
│              ─── 🟢 SSE listener → /api/nepa/anomalies/live                       │
│  /drone     ─── 🟡 placeholder (waitlist, per LAUNCH.md)                          │
│  /portal    ─── 🟢 Supabase auth + sessions list                                  │
│                                                                                   │
└────────────────────────────────────┬──────────────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼──────────────────────────────────────────────┐
│                       NEXT.JS API (this repo, src/app/api/**)                     │
│                                                                                   │
│  ┌─ Perception bridge ─────────────────────────────────────────────────────────┐  │
│  │ POST /api/nepa/inference/frame   🟢 inferFrameSafe → adapter (mock fallback)│  │
│  │ POST /api/nepa/inference/stdp    🟢 wired in audit-2026-05                  │  │
│  │ POST /api/nepa/inference/visual  🟢 wired in audit-2026-05                  │  │
│  │ POST /api/nepa/world-model/...   🟢 wired in audit-2026-05                  │  │
│  │ GET  /api/nepa/anomalies/live    🟢 SSE bus (in-memory, single-instance)    │  │
│  │ GET  /api/nepa/runtime/health    🟢 adapter.health()                        │  │
│  │ GET  /api/nepa/{status,pipeline,missions}  🟡 fixtures                      │  │
│  │ GET  /api/registry/drones        🟡 fixture                                 │  │
│  └────────────────────────┬────────────────────────────────────────────────────┘  │
│                           │ (gating module 🟢 added in audit-2026-05)             │
│                           │ src/lib/nepa/gating.ts → stay_quiet | nudge | safety  │
│  ┌─ Edge proxy ───────────▼────────────────────────────────────────────────────┐  │
│  │ POST /api/edge/token                  🟢 mintEdgeToken (HS256, ≥16B secret) │  │
│  │ POST /api/edge/{offer,ingest}         🟠 proxy → AuraSense_NEPA             │  │
│  │ GET  /api/edge/stream/[id]/events     🟠 SSE proxy (audit fixed buffering)  │  │
│  │ POST /api/edge/stream/[id]/{close,…}  🟠 proxy                              │  │
│  └────────────────────────┬────────────────────────────────────────────────────┘  │
│                           │                                                       │
│  ┌─ Auth + billing ───────┼────────────────────────────────────────────────────┐  │
│  │ middleware.ts          │ 🟢 Supabase SSR session refresh (added in audit)   │  │
│  │ /auth/callback         │ 🟢 magic link + Google OAuth                       │  │
│  │ /api/billing/{...}     │ 🟢 Stripe                                          │  │
│  │ /api/quota/check       │ 🟢 Supabase-backed daily caps                      │  │
│  └────────────────────────┼────────────────────────────────────────────────────┘  │
│                           │                                                       │
│  ┌─ Data ─────────────────▼────────────────────────────────────────────────────┐  │
│  │ Supabase (Postgres + Storage `nepa-frames`)  🟢                             │  │
│  │ Redis (Upstash)                              🔴 not used                    │  │
│  │ MinIO / S3                                   🔴 not used                    │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                   │
│  ┌─ Observability ─────────────────────────────────────────────────────────────┐  │
│  │ Sentry / OpenTelemetry / Prometheus / structlog  🔴 env vars only, no init │  │
│  │ Vercel Analytics                                 🟢 (page views only)       │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                   │
└─────────────────────────────────────┬─────────────────────────────────────────────┘
                                      │  gRPC / HTTP / mock
┌─────────────────────────────────────▼─────────────────────────────────────────────┐
│                     NEPA RUNTIME (this repo, nepa_runtime/)                       │
│                                                                                   │
│  proto/nepa.proto — InferFrame / InferVideo / StreamAnomalies / Health            │
│  backends:                                                                        │
│    • null      🟢 deterministic stub (default)                                    │
│    • onnx      🟢 ORT CUDA → CPU fallback                                         │
│    • tensorrt  🟢 Jetson native                                                   │
│  STDP / world-model loops 🟡 fields exist on response, no per-user state          │
│  Calibration            🔴 not present                                            │
│  Rubric ingestion       🔴 not present                                            │
│  Agentic flow / VLM     🔴 not present                                            │
│  systemd unit + Makefile 🟢                                                       │
│  Roboflow blocks        🔴 not present                                            │
└───────────────────────────────────────────────────────────────────────────────────┘

         (sibling repo, 🟠 proxied only — not modified by this audit)
┌───────────────────────────────────────────────────────────────────────────────────┐
│              AuraSense_NEPA / feat/edge-service-v1 (FastAPI + aiortc)             │
│  /webrtc/offer · /ingest/url · /sessions · /stream/[id]/* · SSE telemetry         │
└───────────────────────────────────────────────────────────────────────────────────┘
```

## Subdomains absent (parked, not in this milestone)

- 🔴 **Inngest** workflows
- 🔴 **Roboflow Inference** + custom NEPA blocks
- 🔴 **OpenRouter / Deepgram / ElevenLabs**
- 🔴 **MinIO** (Supabase Storage covers the only object-store need today)
- 🔴 **OpenTelemetry / Prometheus** (Sentry env vars exist; SDK not initialised)
- 🔴 **Per-user calibration** (`user_calibrations` table)
- 🔴 **Rubric JSON store** (per-rubric scoring; weights are hard-coded in `signals.ts`)
- 🔴 **Agentic flow** (nothing reads gate + rubric + history → action; UI hints only)
- 🔴 **ROS2 bag ingest**
- 🔴 **Cloud → edge model-push channel** (today: manual `scp` + systemd restart)

## Frontend Product Boundary Rules

## Overview

This codebase contains two distinct product frontends:

- **ATLAS platform frontend**: For building, world-model, inspection, and flight-plan workflows.
- **Rehearse Nurse frontend**: For nurse/tutor auth, skills library, rehearsal sessions, progress, achievements, cohorts, annotations, analytics, and NEPA training views.

## Boundary Rules

- Each product has its own top-level route group and supporting folders under `src/app/atlas` and `src/app/rehearse`.
- Product-specific components, hooks, stores, and types must live in their respective product folders:
    - `src/components/atlas`, `src/hooks/atlas`, `src/types/atlas`, `src/lib/atlas` for ATLAS
    - `src/components/rehearse`, `src/hooks/rehearse`, `src/types/rehearse`, `src/lib/rehearse` for Rehearse Nurse
- Only truly generic UI, auth primitives, and infrastructure utilities are allowed in shared locations:
    - `src/components/ui`, `src/lib`, `src/types`
- Do not share feature folders or import product-specific code across the two products.
- Eliminate ambiguous names like `dashboard` for nurse-specific features; use clear, product-scoped names.
- Preserve existing ATLAS API paths (e.g., `api/atlas/...`) unless backend refactoring is explicitly required.

## Folder Rules

- Anything tied to skills rehearsal, tutor review, nurse progress, or NEPA training stays in Rehearse.
- Anything tied to buildings, world models, flight plans, inspections, maps, or MBIS tiles stays in ATLAS.

---

This separation ensures clean boundaries and prevents cross-product ambiguity. All contributors must follow these rules for new features and refactors.
