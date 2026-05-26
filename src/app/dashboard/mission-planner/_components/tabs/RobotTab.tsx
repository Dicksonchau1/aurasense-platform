"use client";

import { useState } from "react";
import { RDR_OBJS } from "@/lib/mission/radar";

type Sub = "orch" | "radar" | "wp" | "sensors";

export default function RobotTab() {
  const [sub, setSub] = useState<Sub>("orch");
  const tabs: { id: Sub; label: string }[] = [
    { id: "orch",    label: "Orchestration" },
    { id: "radar",   label: "Radar" },
    { id: "wp",      label: "WP Engine" },
    { id: "sensors", label: "Sensors" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {tabs.map((t) => {
          const active = sub === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSub(t.id)}
              style={{
                height: 26,
                padding: "0 9px",
                borderRadius: 5,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                border: "1px solid " + (active ? "rgba(79,152,163,.5)" : "rgba(79,152,163,.18)"),
                background: active ? "rgba(79,152,163,.22)" : "rgba(79,152,163,.06)",
                color: active ? "#5ab8d0" : "#8b9aae",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {sub === "orch" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SectionHead>STDP Pipeline</SectionHead>
          <div style={{ display: "flex", gap: 4, overflowX: "auto", padding: "4px 0" }}>
            {[
              { l: "Perceive", on: true },
              { l: "Plan",     on: true },
              { l: "NEPA",     on: true },
              { l: "STDP",     on: true },
              { l: "Decide",   on: true },
              { l: "Act",      on: true },
              { l: "Feedback", on: true },
            ].map((s) => (
              <span
                key={s.l}
                style={{
                  padding: "5px 8px",
                  borderRadius: 6,
                  fontSize: 9.5,
                  fontWeight: 700,
                  fontFamily: "ui-monospace, monospace",
                  background: s.on ? "rgba(79,152,163,.22)" : "rgba(79,152,163,.05)",
                  color: s.on ? "#5ab8d0" : "#6b7a8c",
                  border: "1px solid " + (s.on ? "rgba(79,152,163,.4)" : "rgba(79,152,163,.15)"),
                  whiteSpace: "nowrap",
                }}
              >
                {s.l}
              </span>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
            <Metric value="4,200" label="Cycles/s" />
            <Metric value="12ms"  label="Latency"  />
            <Metric value="0.87"  label="Reward"   />
            <Metric value="0.24"  label="Entropy"  />
          </div>
          <SectionHead>Tendon Orchestration</SectionHead>
          <Row l="DOF"            v="6-DOF" />
          <Row l="Servos"         v="12 Dynamixel Pro" />
          <Row l="Control loop"   v="1 kHz" />
          <Row l="Max torque"     v="8.2 Nm" />
          <Row l="Position acc."  v="0.01 deg" />
        </div>
      )}

      {sub === "radar" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SectionHead>PPI Radar (Livox Mid-360)</SectionHead>
          <div style={{ position: "relative", height: 180, borderRadius: 8, overflow: "hidden", background: "#040d1a", border: "1px solid rgba(79,152,163,.3)" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(79,152,163,.25) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(79,152,163,.55)", fontSize: 9.5, fontFamily: "ui-monospace, monospace" }}>
              {RDR_OBJS.length} contacts - 10 Hz sweep
            </div>
          </div>
          <SectionHead>Livox Config</SectionHead>
          <Row l="Model"     v="Mid-360" />
          <Row l="Range"     v="0.1-70 m" />
          <Row l="FOV"       v="360 / 59 vert" />
          <Row l="Points/s"  v="240,000" />
          <Row l="Accuracy"  v="2 cm" />
          <Row l="Interface" v="Ethernet 100M" />
        </div>
      )}

      {sub === "wp" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SectionHead>Waypoint Engine</SectionHead>
          <div style={{ display: "flex", gap: 4 }}>
            <SmallBtn label="Clear" />
            <SmallBtn label="A* STDP" primary />
            <SmallBtn label="Export JSON" />
          </div>
          <SectionHead>Config</SectionHead>
          <Row l="Algorithm"     v="A* + STDP" />
          <Row l="Avoidance"     v="Active" />
          <Row l="Wind comp."    v="Active" />
          <Row l="RTK precision" v="0.08 m" />
        </div>
      )}

      {sub === "sensors" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SectionHead>Vision</SectionHead>
          <Row l="Camera"     v="Sony IMX678 8MP" />
          <Row l="Zoom"       v="28x optical" />
          <Row l="Aperture"   v="f/1.7" />
          <Row l="Thermal"    v="FLIR Boson 640x512" />
          <Row l="NETD"       v="<20 mK" />
          <SectionHead>IMU + GNSS</SectionHead>
          <Row l="IMU"        v="ICM-42688" />
          <Row l="Accel res." v="16g / 0.001g LSB" />
          <Row l="GNSS"       v="RTK L1/L2" />
          <Row l="Accuracy"   v="1 cm + 1 ppm" />
          <SectionHead>Environment</SectionHead>
          <Row l="Barometer"  v="MS5611 (10 Pa)" />
          <Row l="Humidity"   v="SHT35 (1.5%)" />
          <Row l="Gas"        v="BME688 VOC" />
        </div>
      )}
    </div>
  );
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: "#8b9aae", textTransform: "uppercase", letterSpacing: ".06em", marginTop: 4 }}>{children}</div>;
}

function Row({ l, v }: { l: string; v: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", fontSize: 11 }}>
      <span style={{ color: "#8b9aae" }}>{l}</span>
      <span style={{ color: "#e0e8f2", fontFamily: "ui-monospace, monospace", fontWeight: 600 }}>{v}</span>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ padding: 6, background: "rgba(5,14,26,.5)", border: "1px solid rgba(79,152,163,.18)", borderRadius: 6, textAlign: "center" }}>
      <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "ui-monospace, monospace", color: "#5ab8d0" }}>{value}</div>
      <div style={{ fontSize: 9.5, color: "#8b9aae", marginTop: 1 }}>{label}</div>
    </div>
  );
}

function SmallBtn({ label, primary }: { label: string; primary?: boolean }) {
  return (
    <button
      style={{
        flex: 1,
        height: 24,
        fontSize: 10.5,
        fontWeight: 600,
        borderRadius: 5,
        border: "none",
        cursor: "pointer",
        background: primary ? "linear-gradient(135deg,#3b5d8d,#4f98a3)" : "rgba(255,255,255,.05)",
        color: primary ? "#fff" : "#cfd8e3",
      }}
    >
      {label}
    </button>
  );
}
