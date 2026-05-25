# Batch 1 Quick Reference

## Full replacement
Replace the content of:

- `src/components/atlas/shells/MissionCoreShell.tsx`

with the content from:

- `output/MissionCoreShell.batch1.tsx`

## Surgical patch

Add these imports:

```tsx
import { TelemetryHealthSection } from "@/components/atlas/sections/TelemetryHealthSection";
import { ParametersSection } from "@/components/atlas/sections/ParametersSection";
import {
  useArduPilotTelemetryHealth,
  useArduPilotParameters,
} from "@/lib/atlas/hooks-ardupilot";
import {
  getTelemetryHealthPanelVM,
  getParametersPanelVM,
} from "@/lib/atlas/view-models-ardupilot";
```

Add these inside `MissionCoreShell`:

```tsx
const telemetryHealth = useArduPilotTelemetryHealth();
const parameters = useArduPilotParameters();

const telemetryVM = getTelemetryHealthPanelVM(telemetryHealth.state);
const parametersVM = getParametersPanelVM(parameters.state);
```

Render these sections in the shell body:

```tsx
<section aria-label="Telemetry Health" style={{ marginTop: 24 }}>
  <TelemetryHealthSection vm={telemetryVM} />
</section>

<section aria-label="Parameters" style={{ marginTop: 24 }}>
  <ParametersSection
    vm={parametersVM}
    onParameterChange={parameters.updateParameter}
  />
</section>
```

## Ensure exports exist

If using a barrel file, confirm:

```tsx
export { default as TelemetryHealthSection } from "./TelemetryHealthSection";
export { default as ParametersSection } from "./ParametersSection";
```

## Run
```bash
npm run dev
# or
pnpm dev
```

Open the local ATLAS app and validate using `BATCH1_VALIDATION_CHECKLIST.md`.
What to tell the implementer
Send this after creating the files:

the three Batch 1 files are now available in output/:

- output/MissionCoreShell.batch1.tsx
- output/BATCH1_VALIDATION_CHECKLIST.md
- output/BATCH1_QUICK_REFERENCE.md

Proceed with either:
1. full replacement of MissionCoreShell.tsx using MissionCoreShell.batch1.tsx
or
2. the surgical patch path from BATCH1_QUICK_REFERENCE.md

Then run the validation checklist and report:
- exact files changed
- any import/type/runtime issues
- whether MissionCoreShell rendered successfully
- whether layout rhythm stayed consistent with the ATLAS baseline
