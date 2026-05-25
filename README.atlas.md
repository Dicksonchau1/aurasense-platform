# ATLAS frontend additions

This scaffold now includes:

- Dockerfile for container deployment
- vercel.json for simple Vercel deployment
- App shell with sidebar, sticky header, and auth-gate placeholder
- Mock backend data for dashboard, worlds, agents, and runs
- Reusable UI components:
  - WorldCard
  - AgentTable
  - RunTimeline
  - TriggerRunButton
  - StatCard
- Typed backend interfaces in lib/types.ts
- Fetch helpers in lib/api.ts
- Hooks:
  - useWorlds
  - useWorldDetail
  - useRun
- Dynamic pages:
  - /worlds/[worldId]
  - /runs/[runId]
- Design-system upgrade:
  - shared ATLAS tokens in globals.css
  - improved dark control-plane styling
  - mobile-responsive navigation and stacked table behavior
  - more consistent spacing, panel hierarchy, and action styling

## Current mode

The shell currently uses mock data for rapid UI iteration. You can swap the mock imports to atlasApi calls as soon as the backend endpoints are live.
