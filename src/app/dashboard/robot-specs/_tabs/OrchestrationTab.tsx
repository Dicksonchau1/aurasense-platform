"use client";

import { Card, Row, Badge } from "../../_components/SpecCard";
import { NEPA_ORCH, TENDON_ORCH, PIPELINE, ORCH_METRICS } from "@/lib/mock/robot-specs";

export default function OrchestrationTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card title="NEPA Orchestration">
          {NEPA_ORCH.map((s) =>
            s.badge ? (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 9px", fontSize: 12 }}>
                <span style={{ color: "#8b9aae", fontWeight: 500 }}>{s.label}</span>
                <Badge kind={s.badge}>{s.value}</Badge>
              </div>
            ) : (
              <Row key={s.label} label={s.label}>{s.value}</Row>
            )
          )}
        </Card>

        <Card title="Tendon Orchestration">
          {TENDON_ORCH.map((s) =>
            s.badge ? (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 9px", fontSize: 12 }}>
                <span style={{ color: "#8b9aae", fontWeight: 500 }}>{s.label}</span>
                <Badge kind={s.badge}>{s.value}</Badge>
              </div>
            ) : (
              <Row key={s.label} label={s.label}>{s.value}</Row>
            )
          )}
        </Card>
      </div>

      <Card title="Orchestration Pipeline">
        <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", padding: "8px 0", marginBottom: 12 }}>
          {PIPELINE.map((stage, i) => (
            <div key={stage.label} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  padding: "7px 14px",
                  borderRadius: 7,
                  background: stage.active
                    ? "linear-gradient(135deg, rgba(59,93,141,.25), rgba(79,152,163,.2))"
                    : "rgba(255,255,255,.04)",
                  border: "1px solid " + (stage.active ? "rgba(79,152,163,.4)" : "#1a1f26"),
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: stage.active ? "#5ab8d0" : "#8b9aae",
                  whiteSpace: "nowrap",
                }}
              >
                {stage.label}
              </div>
              {i < PIPELINE.length - 1 && (
                <div style={{ width: 22, textAlign: "center", fontSize: 11, color: "#4f98a3" }}>&rarr;</div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {ORCH_METRICS.map((m) => (
            <div key={m.label} style={{ textAlign: "center", padding: 10, background: "rgba(79,152,163,.05)", border: "1px solid rgba(79,152,163,.18)", borderRadius: 9 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#e0e8f2", fontFamily: "ui-monospace, monospace" }}>{m.value}</div>
              <div style={{ fontSize: 10, color: "#8b9aae", marginTop: 2 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
