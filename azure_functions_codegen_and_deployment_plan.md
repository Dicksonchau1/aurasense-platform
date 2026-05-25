# MultiDomain Threat Console Implementation Plan

## Task 1 Steps

1. **Types**
   - [x] Create `src/types/atlas-threat.ts` with all specified types.
2. **Track Store Module**
   - [ ] Implement `src/lib/atlas/threat-store.ts` with:
     - Module-level track map and authority log.
     - Seeding logic for 9 tracks (3 per domain, with required attributes).
     - All mutator and accessor functions as described.
3. **API Routes**
   - [ ] Implement:
     - `src/app/api/atlas/threat/tracks/route.ts` (GET)
     - `src/app/api/atlas/threat/engage/route.ts` (POST)
     - `src/app/api/atlas/threat/stream/route.ts` (GET, SSE)
     - `src/app/api/atlas/threat/tracks/[id]/advance/route.ts` (POST)
4. **UI Page**
   - [ ] Implement `src/app/atlas/threat/page.tsx`:
     - DomainHeaderStrip
     - TrackCard grid with all state, actions, and animations
     - EngagementAuthorityLog
     - SSE and countdown logic
5. **Migration**
   - [ ] Add `supabase/migrations/0006_threat_tracks.sql` for the `threat_tracks_log` table.
6. **Nav & Docs**
   - [ ] Update navigation and `ARCHITECTURE.md` as specified.

## Validation Strategy
- TypeScript: `tsc --noEmit` must pass.
- API: All endpoints return correct data and enforce rules.
- UI: All acceptance criteria (track seeding, state transitions, SSE, token logic, etc.) are visually and functionally validated.
- No new npm packages; only use allowed libraries.
