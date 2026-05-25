---
goal: Full Implementation and Validation of ATLAS OS Mission Planner, MAVLink Console, and OS Snapshot Export
version: 1.0
date_created: 2026-05-25
last_updated: 2026-05-25
owner: ATLAS OS Engineering
status: 'Planned'
tags: [feature, validation, mission-planner, mavlink, snapshot, manual-test]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This plan details the full implementation and validation of the ATLAS OS Mission Planner, MAVLink Command Console, and OS Snapshot Export features. It includes all required UI, API, backend, and manual validation steps to ensure production readiness.

## 1. Requirements & Constraints

- **REQ-001**: Sidebar must include a "Missions" link under the ATLAS OS section.
- **REQ-002**: Mission Planner UI must display, create, edit, and manage missions and waypoints.
- **REQ-003**: MAVLink Command Console must allow sending commands and display a real-time log.
- **REQ-004**: OS Snapshot Export must generate a signed JSON state dump including all mission, weather, NOTAM, and command log data.
- **REQ-005**: All API endpoints must use zod validation and envelope response pattern.
- **REQ-006**: All state is in-memory; no persistent DB.
- **CON-001**: TypeScript strict mode enforced.
- **CON-002**: All UI must use React 19, Next.js 16, Tailwind v4, shadcn/ui, and lucide-react.
- **CON-003**: Supabase is used for auth/audit, but not for mission state.
- **CON-004**: setInterval is used for mission ETA/flight time and weather polling.
- **SEC-001**: All endpoints must be protected by Supabase auth middleware.
- **PAT-001**: Envelope pattern for all API responses.

## 2. Implementation Steps

### Implementation Phase 1

- GOAL-001: Integrate Missions page into sidebar navigation.

| Task     | Description                                                      | Completed | Date       |
| -------- | ---------------------------------------------------------------- | --------- | ---------- |
| TASK-001 | Add "Missions" link to sidebar under ATLAS OS section            | ✅        | 2026-05-19 |
| TASK-002 | Validate navigation to `/atlas/missions`                         |           |            |

### Implementation Phase 2

- GOAL-002: Implement and validate Mission Planner UI and API.

| Task     | Description                                                      | Completed | Date       |
| -------- | ---------------------------------------------------------------- | --------- | ---------- |
| TASK-003 | Display seeded missions in mission list                          |           |            |
| TASK-004 | Implement mission creation via Mission Creation Sheet             |           |            |
| TASK-005 | Implement mission selection, details, and waypoint editing       |           |            |
| TASK-006 | Implement mission lifecycle controls (arm, launch, land)         |           |            |
| TASK-007 | Validate all mission API endpoints (list, details, waypoints)    |           |            |

### Implementation Phase 3

- GOAL-003: Implement and validate MAVLink Command Console.

| Task     | Description                                                      | Completed | Date       |
| -------- | ---------------------------------------------------------------- | --------- | ---------- |
| TASK-008 | Implement MAVLink command send and log display                   |           |            |
| TASK-009 | Validate command log updates and error handling                  |           |            |
| TASK-010 | Validate command API endpoint                                    |           |            |

### Implementation Phase 4

- GOAL-004: Implement and validate OS Snapshot Export.

| Task     | Description                                                      | Completed | Date       |
| -------- | ---------------------------------------------------------------- | --------- | ---------- |
| TASK-011 | Implement export snapshot button in UI                           |           |            |
| TASK-012 | Validate download of signed JSON state dump                      |           |            |
| TASK-013 | Validate snapshot includes all required data                     |           |            |
| TASK-014 | Validate snapshot API endpoint                                   |           |            |

### Implementation Phase 5

- GOAL-005: Manual validation and QA.

| Task     | Description                                                      | Completed | Date       |
| -------- | ---------------------------------------------------------------- | --------- | ---------- |
| TASK-015 | Run `pnpm exec tsc --noEmit` and resolve all type errors         | ✅        | 2026-05-25 |
| TASK-016 | Manually test all UI and API flows per checklist                 |           |            |
| TASK-017 | Validate no errors in browser console or network tab             |           |            |
| TASK-018 | Document any issues and resolve                                  |           |            |

## 3. Alternatives

- **ALT-001**: Use persistent DB for mission state (not chosen; ephemeral by design).
- **ALT-002**: Use REST API without envelope pattern (not chosen; envelope required for consistency).

## 4. Dependencies

- **DEP-001**: Next.js 16, React 19, Tailwind v4, shadcn/ui, lucide-react
- **DEP-002**: Supabase for auth/audit
- **DEP-003**: zod for schema validation

## 5. Files

- **FILE-001**: `src/components/app-sidebar.tsx` (sidebar navigation)
- **FILE-002**: `src/app/atlas/missions/page.tsx` (Mission Planner UI)
- **FILE-003**: `src/lib/atlas/mission-store.ts` (in-memory mission store)
- **FILE-004**: `src/app/api/atlas/missions/route.ts` (mission API)
- **FILE-005**: `src/app/api/atlas/missions/[id]/route.ts` (mission details API)
- **FILE-006**: `src/app/api/atlas/missions/[id]/waypoints/route.ts` (waypoints API)
- **FILE-007**: `src/app/api/atlas/missions/[id]/command-log/route.ts` (command log API)
- **FILE-008**: `src/app/api/missions/[id]/command/route.ts` (MAVLink command API)
- **FILE-009**: `src/app/api/exports/snapshot/route.ts` (snapshot export API)
- **FILE-010**: `src/app/api/wx/current/route.ts` (weather API)
- **FILE-011**: `src/app/api/atlas/airspace/notams/route.ts` (NOTAMs API)

## 6. Testing

- **TEST-001**: TypeScript type check (`pnpm exec tsc --noEmit`)
- **TEST-002**: Manual UI validation (navigation, mission CRUD, waypoints, status)
- **TEST-003**: Manual API validation (all endpoints, envelope, zod)
- **TEST-004**: Manual validation of MAVLink command send/log
- **TEST-005**: Manual validation of OS snapshot export
- **TEST-006**: Browser console and network error check

## 7. Risks & Assumptions

- **RISK-001**: In-memory store may lose state on reload (by design).
- **RISK-002**: Supabase auth integration must be functional for all endpoints.
- **ASSUMPTION-001**: All dependencies are installed and up to date.

## 8. Related Specifications / Further Reading

- [ATLAS OS Product Requirements Document]
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [lucide-react Documentation](https://lucide.dev/)