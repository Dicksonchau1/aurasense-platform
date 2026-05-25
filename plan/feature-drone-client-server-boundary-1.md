---
goal: Full Audit and Compliance of Client/Server Boundaries for /rehearse/drone Route
version: 1.0
date_created: 2026-05-25
last_updated: 2026-05-25
owner: Atlas Frontend Team
status: 'Planned'
tags: [feature, compliance, nextjs, client-server, bugfix]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This plan defines a systematic, deterministic audit and remediation process to ensure full compliance with Next.js client/server boundaries for the `/rehearse/drone` route and all its dependencies. The goal is to eliminate the "React Context is unavailable in Server Components" error by ensuring that all React context and hooks are only used in client components, and that no client component is imported into a server component.

## 1. Requirements & Constraints

- **REQ-001**: All files in the `/rehearse/drone` route and its dependency tree must be audited for client/server boundary compliance.
- **REQ-002**: All usage of React hooks and context must occur only in files with the `"use client"` directive.
- **REQ-003**: No client component may be imported into a server component.
- **REQ-004**: All context providers must be defined and used only in client components.
- **CON-001**: No breaking changes to public API or user-facing features.
- **CON-002**: All changes must be tracked and reversible.
- **GUD-001**: Follow Next.js 16+ app directory conventions for client/server boundaries.
- **PAT-001**: Use top-level `"use client"` directive for all files using hooks/context.

## 2. Implementation Steps

### Implementation Phase 1
- GOAL-001: Audit all files in the `/rehearse/drone` route and its dependency tree for client/server boundary violations.

| Task     | Description                                                                                  | Completed | Date       |
| -------- | -------------------------------------------------------------------------------------------- | --------- | ---------- |
| TASK-001 | Enumerate all files directly or indirectly imported by `/rehearse/drone/page.tsx`.           |           |            |
| TASK-002 | For each file, determine if it uses React hooks/context or imports a client component.        |           |            |
| TASK-003 | Identify any server components importing client components or using hooks/context.             |           |            |
| TASK-004 | Document all violations and affected files.                                                   |           |            |

### Implementation Phase 2
- GOAL-002: Remediate all identified violations and enforce permanent compliance.

| Task     | Description                                                                                  | Completed | Date |
| -------- | -------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-005 | Add `"use client"` to all files using hooks/context that are missing it.                      |           |      |
| TASK-006 | Refactor any server component importing a client component to split logic or move to client.  |           |      |
| TASK-007 | Ensure all context providers are only defined/used in client components.                      |           |      |
| TASK-008 | Add automated test to verify no client component is imported into a server component.         |           |      |
| TASK-009 | Validate that `/rehearse/drone` loads without context/server errors.                          |           |      |

## 3. Alternatives

- **ALT-001**: Patch only the top-level page and immediate children. (Rejected: does not guarantee full compliance.)
- **ALT-002**: Ignore indirect imports. (Rejected: error can propagate through deep import chains.)

## 4. Dependencies

- **DEP-001**: Next.js 16+ app directory structure
- **DEP-002**: React 18+
- **DEP-003**: All custom hooks and context providers used by `/rehearse/drone`

## 5. Files

- **FILE-001**: src/app/rehearse/drone/page.tsx
- **FILE-002**: src/components/rehearse/DroneInspectionScene.tsx
- **FILE-003**: All files imported by the above, recursively
- **FILE-004**: Any context provider or hook used in the above

## 6. Testing

- **TEST-001**: Manual test: Load `/rehearse/drone` in browser, verify no context/server errors.
- **TEST-002**: Automated test: Static analysis to ensure no client component is imported into a server component.
- **TEST-003**: Regression test: All existing dashboard routes must remain functional.

## 7. Risks & Assumptions

- **RISK-001**: Deep or circular import chains may obscure violations.
- **RISK-002**: Refactoring may introduce subtle bugs if not carefully validated.
- **ASSUMPTION-001**: All custom hooks/context are correctly marked as client-only.

## 8. Related Specifications / Further Reading

- [Next.js Client and Server Components Documentation](https://nextjs.org/docs/getting-started/react-essentials#client-and-server-components)
- [React Context API Documentation](https://react.dev/reference/react/createContext)
