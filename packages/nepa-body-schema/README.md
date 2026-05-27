# @nepa/body-schema

NEPA Body-Schema: Hardware-agnostic embodiment, telemetry, and health contracts for robotics fleet management.

## Features
- Protobuf and TypeScript contracts for robot embodiment, telemetry, schema state, and events
- Adapter base class and mock implementation
- WebSocket topic and envelope utilities
- Ready for integration with ATLAS orchestrator and Supabase persistence

## Directory Structure
- `proto/` — Protobuf contracts
- `src/types/` — TypeScript interfaces and enums
- `src/adapters/` — Adapter base, mock, and stubs
- `src/websocket/` — Topics, publisher, subscriber
- `src/generated/` — (Generated proto stubs)
- `tests/` — Vitest contract tests

## Usage
- Extend `BaseBodySchemaAdapter` for new hardware or runtime
- Use `MockBodySchemaAdapter` for simulation and testing
- Integrate with ATLAS via the bridge contract

## Development
- `pnpm build` — Compile TypeScript
- `pnpm test` — Run Vitest contract tests
- `pnpm proto:gen` — Generate proto stubs (requires buf)

## License
MIT
