# ATLAS OS Dashboard — Laptop Demo Walkthrough

This walkthrough demonstrates the full investor/operator flow for the ATLAS OS Dashboard (PR 3), using sidecar fixture mode. It covers all major drill-downs, evidence views, and navigation paths required for the Google Cloud Leaders Connect demo.

---

## Demo Prerequisites
- Sidecar running in fixture mode (no live substrate required)
- All PR 3 code merged and built
- Browser window open to http://localhost:3000/atlas-os
- Feature flag: `NEXT_PUBLIC_ATLAS_ENABLED=0` (default)

---

## 1. Start at Fleet View
- **URL:** `/atlas-os`
- **UI:** Fleet dashboard with all agents and substrates listed
- **Action:**
  - Confirm sidebar shows: Fleet, Agents, Substrate, Benchmarks, Worlds, Diligence
  - Confirm all agent rows are populated (fixture data)

---

## 2. Agent Drill-down
- **Action:** Click on agent `aurasense-rehearse` in the Fleet table or sidebar
- **URL:** `/atlas-os/agents/aurasense-rehearse`
- **UI:**
  - Header: agent_id, session_label, bound substrate run_id with "← same singleton as others" link
  - Six sub-panels:
    - ActionTimeline: Plotly chart, live SSE updates
    - AgentSubstrateCoupling: MI, Δw, envelope share, co-resident agents
    - RecentActions: JSONL viewer, filter, export
    - AuditInvariants: 4 booleans, claim tile
    - EnvelopesIn: stacked bar, source mix
    - ActionsOut: surface/subsurface, rates, latency
- **Test:**
  - Hover hash in RecentActions for full value
  - Click "← same singleton as others" to navigate to substrate

---

## 3. Substrate Drill-down
- **URL:** `/atlas-os/substrate/20260522T190000Z` (example runId)
- **UI:**
  - Header: run_id, type, path, status, elapsed, outcome, L1-L5 dots
  - AllMetrics: 5 stacked Plotly charts, zoom, vertical markers
  - SnapshotHistory: tree view, download buttons
  - LayerAdmission: timeline, hashes
  - WindowComparison: side-by-side table (if baseline/measurement exist)
- **Test:**
  - Download a snapshot file
  - Confirm vertical markers align with events

---

## 4. Benchmarks Page
- **URL:** `/atlas-os/benchmarks`
- **UI:**
  - Left: RunList table, select a run
  - Right: RunDiff, side-by-side diff, color-coded
  - Below: MetricTrend sparklines
- **Test:**
  - Select different runs, observe diff and trends update

---

## 5. Worlds Page (Offline)
- **URL:** `/atlas-os/worlds`
- **UI:**
  - OfflineBanner: "Path B offline — ATLAS-NEPA gRPC integration pending."
- **Test:**
  - Confirm no manifest list is shown (feature flag off)

---

## 6. Diligence Evidence View
- **URL:** `/atlas-os/diligence`
- **UI:**
  - Pillar4Card: Markdown report, L1-L5 verdict table, open/download buttons
  - BenchmarkCard: suite_result.json, M1-M5, substrate commit, copy-button
  - AuditCard: chain verification, badges
  - ClaimEvidenceTable: 4 pillars, links, status dots
- **Test:**
  - Open full report, download artifacts
  - Copy run reproduction command
  - Click evidence links to drill-down pages

---

## 7. Cross-link Navigation
- **Test:**
  - Use sidebar to jump between all pages
  - From Fleet/Benchmarks/Diligence, use all cross-links to reach drill-downs

---

## 8. End-to-End Flow
- Start at Fleet → Agent drill-down → Substrate drill-down → Benchmarks → Diligence
- Confirm all data is live (fixture-backed), no stubs, all navigation works
- Demo duration: ~90 seconds

---

## 9. Screenshots
- See `docs/atlas-os/` for screenshots of each page in fixture mode

---

## 10. Troubleshooting
- If any panel fails to load, check sidecar logs for fixture errors
- All tests must pass (`vitest` green, no-stubs, schema-parity)

---

**This walkthrough is the canonical investor/operator demo for ATLAS OS Dashboard PR 3.**
