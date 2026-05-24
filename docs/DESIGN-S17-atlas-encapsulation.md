# DESIGN.md §17 — ATLAS as Encapsulation: The Four-Component Closed Loop

> Status: LOCKED (2026-05-22, Architectural Lock #4)

## 17.1 The Loop

ATLAS is not four separate systems. It is one closed loop with four faces:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ATLAS META-LOOP                             │
│                                                                     │
│   ┌──────────────────┐         substrate actions                    │
│   │  3D REHEARSE ENV │ ◄────────────────────────────────────┐       │
│   │  (R3F scene)     │                                      │       │
│   └────────┬─────────┘                                      │       │
│            │ shape-of-change envelopes                      │       │
│            ▼                                                │       │
│   ┌──────────────────┐         correct:* project:*          │       │
│   │  NEPA SUBSTRATE  ├────────── frame:* flag:* ────────────┘       │
│   │  (shared single- │                                              │
│   │   ton, Axiom #2) │                                              │
│   └────────┬─────────┘                                              │
│            │ high-modulator frames                                  │
│            ▼                                                        │
│   ┌──────────────────┐         spatial-neighbourhood priors        │
│   │  POLYGON-ENGINE  ├────────────────────────────────────────────►│
│   │  ORCHESTRATOR    │  normalised                 ┌───────────────┤
│   └────────┬─────────┘  contributions              │ SIGNATURE_MAP │
│            │                                       │ (3D H3 index) │
│            └──────────────────────────────────────►│               │
│                                                    └───────────────┘
└─────────────────────────────────────────────────────────────────────┘
```

## 17.2 What Each Component Owns

**3D Rehearse Environment**: The geometric face of the loop. It is the canvas on which substrate inference is rendered. It is not a UI; it is the spatial model of the operational context that makes physical-law signatures legible to human operators. It consumes `SceneMessage` events from the orchestrator and renders them as 3D entities (projected trajectories, wind cells, crack traces, glare cones, anomaly markers).

**NEPA Substrate**: The learning face of the loop. It is the only component that adjusts weights. It receives shape-of-change envelopes, runs STDP + dopamine-modulated plasticity (the Mechanism), emits substrate actions, and captures high-modulator frames. It does not know about 3D scenes or Supabase.

**Polygon-Engine Orchestrator**: The translation face of the loop. It binds the substrate to the 3D scene and the signature_map. It applies substrate actions as scene updates. It normalises captured frames into signature contributions. It queries the signature_map for spatial priors on session start. It is the only component that touches both the substrate and the scene simultaneously.

**signature_map**: The memory face of the loop. It is the append-only, hash-chained, geospatially indexed repository of civilisation-accumulated physical-law signatures. It grows with every deployment. It priors every future rehearse in its spatial neighbourhood. It is the encapsulation made geometric — the reason ATLAS does not start from scratch at every deployment.

## 17.3 The Encapsulation Argument

In classical software, "encapsulation" means hiding internal state behind an interface. In ATLAS, encapsulation means something more radical: **the physical world's lawful structure is encapsulated in the signature_map, indexed by the coordinates where it manifests, and retrieved at the moment when a rehearse session opens at those coordinates**.

The system does not need to re-learn that a 12 m/s NW wind shear at 47 m altitude over a suspension bridge produces a characteristic lateral drift signature — because the signature_map already holds that pattern, anchored to the H3 cells where it was observed, ready to prime the substrate before the first tick of the new session arrives.

That is Axiom #3's real encapsulation made geometric. The meta-loop closes not in abstract feature space but in physical space — in the latitude, longitude, and altitude where physical law actually operates.

## 17.4 What This Is Not

The four-component loop is **not** a simulation. The rehearse environment is not a game engine playing out hypothetical scenarios. It is a substrate-resounding surface — it resounds to actual substrate inference drawn from actual physical-law signatures extracted from actual operational deployments. The 3D scene is the geometric face of real accumulated knowledge, not a visualisation of a model's imagination.

This distinction matters for the Rosewood pitch: ATLAS is not "AI that simulates drone flights." ATLAS is "the geometric face of civilisation-accumulated operational physics" — the missing encapsulation layer between raw telemetry and trustworthy forward projection.
