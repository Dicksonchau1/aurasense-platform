# hri-core

Shared Human-Robot Interaction (HRI) Core Contract for NEPA Agent


## Purpose

This package provides a reusable, headless, and type-safe contract and state management layer for NEPA HRI sessions. It enables both Playground and Atlas apps to consume and manage HRI session state, actions, and events in a consistent way.


## Session Lifecycle

1. **SESSION_STARTED**: Session is created and activated.
2. **PERCEPTION_UPDATED**: Agent or environment perception is updated.
3. **RECOMMENDATION_ISSUED**: Agent issues a recommendation.
4. **OPERATOR_ACKNOWLEDGED/CORRECTED/OVERRIDDEN**: Human operator responds.
5. **TRUST_RECEIPT_ATTACHED**: Trust envelope is attached.
6. **POLICY_RECEIPT_ATTACHED**: Policy receipt is attached.
7. **SESSION_COMPLETED/FAILED**: Session ends.


## Example Usage

```ts
import { useHriSession, getCurrentRecommendation, HriRole } from 'hri-core';

const [state, dispatch] = useHriSession('session-123', 'operator', new Date().toISOString());

// Dispatch actions
dispatch({ type: 'PERCEPTION_UPDATED', payload: { summary: 'All clear', timestamp: new Date().toISOString() } });

// Selectors
const rec = getCurrentRecommendation(state);
```


## Exports

- Domain types/interfaces (see `src/types`)
- Reducer and state helpers (see `src/state`)
- Selectors (see `src/selectors`)
- Zod schemas for runtime validation (see `src/schemas`)
- React hook: `useHriSession`


## Constraints

- No app-specific business logic
- No UI components
- Explicit named exports


## Integration

- Use in both apps/playground and apps/atlas for session state and contract

---
MIT License
