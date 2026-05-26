"use client";

import { Card, Row, Badge, ProgressBar } from "../../_components/SpecCard";
import {
  DRONE_PLATFORM,
  FLIGHT_ENVELOPE,
  ENVIRONMENT,
  BATTERY,
  ROTORS,
  FOV_PINS,
} from "@/lib/mock/drone-specs";

export default function ParametersTab() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
      <Card title="Platform">
        {DRONE_PLATFORM.map((s) => <Row key={s.label} label={s.label}>{s.value}</Row>)}
      </Card>

      <Card title="Flight Envelope">
        {FLIGHT_ENVELOPE.map((s) => <Row key={s.label} label={s.label}>{s.value}</Row>)}
      </Card>

      <Card title="Environment">
        {ENVIRONMENT.map((s) => <Row key={s.label} label={s.label}>{s.value}</Row>)}
      </Card>

      <Card title="Battery">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
          <Stat big={BATTERY.charge + "%"} label="Charge">
            <ProgressBar pct={BATTERY.charge} color="#22c55e" />
          </Stat>
          <Stat big={BATTERY.endurance} label="Endurance" />
          <Stat big={BATTERY.capacity} label="Capacity" />
          <Stat big={BATTERY.draw} label="Draw" />
        </div>
      </Card>

      <Card title="Rotors">
        {ROTORS.map((r) => (
          <Row key={r.id} label={r.id}>{r.rpm.toLocaleString()} rpm</Row>
        ))}
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <button style={btnT}>Auto-balance</button>
          <button style={btnG}>Test spin</button>
        </div>
      </Card>

      <Card title="FoV Pins">
        {FOV_PINS.map((p) => (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 9px", borderRadius: 6, background: "rgba(79,152,163,.08)", border: "1px solid rgba(79,152,163,.2)", marginBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(79,152,163,.9)", color: "#fff", fontSize: 9, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                {p.id}
              </span>
              <span style={{ fontSize: 11.5, color: "#cfd8e3" }}>Face {p.face} - {p.alt}m</span>
            </div>
            <Badge kind="info">{p.coverage}% cov</Badge>
          </div>
        ))}
        <div style={{ marginTop: 8, display: "flex", gap: 6, alignItems: "center" }}>
          <button style={btnG}>Add Pin</button>
          <Badge kind="info">{FOV_PINS.length} pins</Badge>
        </div>
      </Card>
    </div>
  );
}

function Stat({ big, label, children }: { big: string; label: string; children?: React.ReactNode }) {
  return (
    <div style={{ textAlign: "center", padding: 9, background: "rgba(79,152,163,.05)", border: "1px solid rgba(79,152,163,.12)", borderRadius: 9 }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#e0e8f2", fontFamily: "ui-monospace, monospace" }}>{big}</div>
      <div style={{ fontSize: 10.5, color: "#8b9aae", marginTop: 2 }}>{label}</div>
      {children && <div style={{ marginTop: 6 }}>{children}</div>}
    </div>
  );
}

const btnBase: React.CSSProperties = { padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none" };
const btnT: React.CSSProperties = { ...btnBase, background: "linear-gradient(135deg,#2e6b74,#4f98a3)", color: "#fff" };
const btnG: React.CSSProperties = { ...btnBase, background: "rgba(255,255,255,.06)", border: "1px solid #1a1f26", color: "#cfd8e3" };
