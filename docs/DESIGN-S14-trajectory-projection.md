# DESIGN.md §14 — Trajectory Projection as Forward-Unfolding of Recognised Signatures

> Status: LOCKED (2026-05-22, Architectural Lock #4)

## 14.1 The Distinction That Matters

Trajectory projection is **not** dead-reckoning. Dead-reckoning integrates current velocity forward in time; it carries no structural knowledge and its error grows monotonically. Trajectory projection, as implemented in ATLAS, is the **forward-unfolding of a recognised physical-law signature**.

When the substrate recognises a signature — e.g. "this drone class in a 12 m/s NW wind shear at this payload produces a lateral drift of +0.34 m/s² with a damping time constant of 340 ms" — the rehearse-orchestrator can project that signature forward into the 3D scene as a **predicted curve entity** anchored to the scene geometry. The projection is only emitted when a signature is recognised. If no signature fires, no trajectory is projected. The absence of a projected trajectory is itself an operator signal: the substrate has not yet accumulated sufficient lawful knowledge of this regime to project trustworthy futures.

## 14.2 Rendering Trigger

The substrate emits `project:trajectory` actions when a recognised signature implies a forward path. The polygon-engine orchestrator receives this action and calls `scene.upsertEntity()` with:

```typescript
{
  entity_id: `trajectory:${run_id}:${tick}`,
  type: 'trajectory_curve',
  points: SignaturePayload.projectedPath,   // Array<[x,y,z]> in scene coordinates
  color: 0x00ff88,
  opacity: SignaturePayload.confidence,     // 0..1 — fades when confidence low
  anchor_object_id: structuralAnchor.object_id,
  ttl_ticks: 30                             // auto-expire after 30 ticks if not refreshed
}
```

The curve is rendered in the R3F scene as a `<Line>` primitive (drei) drawn along the projected 3D path. Opacity encodes confidence so the operator can see how firmly the substrate believes the projection.

## 14.3 Why Spatial Projection Requires 3D

A 2D dashboard cannot faithfully represent a projected trajectory because:

- Wind-shear-induced drift is a 3D vector. Projecting it into a 2D plan-view discards the altitude component.
- Structural mode coupling (e.g. torsional oscillation of a bridge cable) unfolds along the cable's 3D geometry.
- Glare-cone projection from a west-facing window hits surfaces at an angle that only makes sense in 3D scene coordinates.

All projected curves live in the 3D scene's coordinate frame. The rehearse environment's camera can orbit, zoom, and inspect the projection from any angle. This is non-negotiable.

## 14.4 Failure Mode: No Projection ≠ Bug

If the substrate has not yet recognised a signature for the current regime, it emits no `project:trajectory` action. The orchestrator renders nothing. The operator sees an empty scene with live telemetry but no projection curve. This is correct behaviour: **the system is honest about what it does not yet know**. Operators are trained to recognise the absent projection as a signal to operate more conservatively until the substrate accumulates enough lawful knowledge to project.

## 14.5 Relationship to signature_map

Once a frame is captured (`frame:captured` action), its geometric anchor encodes the 3D location where the trajectory projection was active. When the frame is contributed to the signature_map, future rehearse sessions in the same spatial neighbourhood will load this projection prior and begin projecting from tick 0 — reducing the "cold start" period before trustworthy projections appear.
