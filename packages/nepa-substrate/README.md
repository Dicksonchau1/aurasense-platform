# NEPA Substrate

The canonical substrate API layer for the aurasense-platform monorepo.

## Purpose
Defines the foundational runtime and message-passing API for all adaptation, audit, and world-model layers.

## Python Module Map
- `substrate.py`: Main API surface
- `plasticity.py`: Adaptive update engine
- `layer_manager.py`: Layer admission and tracking
- `reflex.py`: Low-latency reflex interface
- `coupling_log.py`: Coupling event log
- `envelope.py`: Envelope and stream
- `audit_event.py`: Audit event
- `substrate_io.py`: I/O helpers

## TypeScript Module Map
- `src/types/substrate.types.ts`: Canonical types
- `src/types/substrate.zod.ts`: Zod schemas
- `src/SubstrateClient.ts`: JS adapter
- `src/index.ts`: Exports

## Lifecycle
1. Create substrate/config
2. Connect substrate
3. Use controllers/managers
4. Export/import weights
5. Stream envelopes
6. Disconnect substrate

## Example Usage

### Python
```python
from packages.nepa_substrate.python import Substrate, SubstrateConfig
s = Substrate(SubstrateConfig())
s.connect()
print(s.status().status)
s.disconnect()
```

### TypeScript
```ts
import { SubstrateClient } from "nepa-substrate"
const client = new SubstrateClient({})
await client.connect()
console.log(await client.status())
await client.disconnect()
```

## Transport/Bridge
The TypeScript client is designed to connect to the Python substrate via REST or WebSocket (adapter layer, not implemented here).
