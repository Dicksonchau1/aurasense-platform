# Batch 1 Integration Validation Checklist

## Pre-integration
- [ ] Backend scaffold starts cleanly (`uvicorn app.main:app --reload` or equivalent)
- [ ] No import errors in `hooks-ardupilot.ts`
- [ ] No import errors in `view-models-ardupilot.ts`
- [ ] `TelemetryHealthSection.tsx` compiles standalone
- [ ] `ParametersSection.tsx` compiles standalone

## Integration
- [ ] `MissionCoreShell.tsx` imports `TelemetryHealthSection` without type errors
- [ ] `MissionCoreShell.tsx` imports `ParametersSection` without type errors
- [ ] `useArduPilotTelemetryHealth` hook resolves and returns expected state shape
- [ ] `useArduPilotParameters` hook resolves and returns expected state shape
- [ ] `getTelemetryHealthPanelVM` maps state to view-model without runtime errors
- [ ] `getParametersPanelVM` maps state to view-model without runtime errors

## Render check
- [ ] MissionCoreShell renders without white screen or crash
- [ ] TelemetryHealthSection visible in DOM
- [ ] ParametersSection visible in DOM
- [ ] AtlasSurfaceLayout spacing and rhythm unchanged
- [ ] No console errors (missing props, undefined reads, hook violations)

## Functional check
- [ ] TelemetryHealthSection displays KPI cards with demo/live values
- [ ] ParametersSection displays parameter list or table with values
- [ ] `onParameterChange` is wired and does not throw
- [ ] Sections behave correctly on resize / mobile collapse

## Files changed log
Report exact files modified:
- `src/components/atlas/shells/MissionCoreShell.tsx`
- any supporting files touched during integration

## Exit criteria
Batch 1 is verified only when:
1. All checkboxes above are completed
2. No console errors exist
3. Visual layout matches ATLAS baseline rhythm

Do not proceed to Batch 2 until this checklist passes.
