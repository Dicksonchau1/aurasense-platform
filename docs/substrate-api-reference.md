# Substrate API Reference

## Python Exports
- Substrate
- SubstrateConfig
- SubstrateStatus
- PlasticityController
- AdaptationTrace
- LayerManager
- LayerConfig
- LayerDescriptor
- ReflexInterface
- ReflexSignal
- ReflexOutcome
- CouplingLog
- CouplingEvent
- Envelope
- EnvelopeStream
- AuditEvent
- load_substrate
- save_snapshot
- load_snapshot
- stream_envelopes

## TypeScript Exports
- SubstrateConfig
- SubstrateStatus
- LayerConfig
- LayerDescriptor
- ReflexSignal
- ReflexOutcome
- CouplingEvent
- AdaptationTrace
- Envelope
- AuditEvent
- SubstrateClient

## Type Signatures & Usage
- See README.md for usage examples.
- All types are kept in sync between Python and TypeScript.

## Relationships
- `Substrate` is the root runtime handle.
- `PlasticityController` powers adaptation (used by hybrid-learning).
- `LayerManager` tracks active layers (feeds HRI and scoring).
- `ReflexInterface` is for low-latency pathways.
- `Envelope`/`EnvelopeStream` are the message boundary.
- `AuditEvent` is compatible with audit-events package.
- `export_weights`/`import_weights` persist state for replay and continuity.
- `coupling_log` feeds debug and adaptation trace.

## Integration
- Consuming packages: stdp-debug, hybrid-learning, world-model-client, audit-events, hri-core.
- Import from `nepa-substrate` instead of defining substrate-level types.
