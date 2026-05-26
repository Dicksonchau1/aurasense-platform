"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WorldScene from "./_components/WorldScene";
import AgentDock from "./_components/AgentDock";
import { FLEET, ALERTS, ACTIVITY } from "@/lib/mock/seed";

export default function WorldModelPage() {
  const [clock, setClock] = useState("");
  const [fit, setFit] = useState(87);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(d.toLocaleTimeString("en-HK", { hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setFit((f) => {
        const drift = Math.round((Math.random() - 0.5) * 2);
        return Math.max(60, Math.min(100, f + drift));
      });
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <main style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <header>
        <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>
          <Link href="/dashboard" style={{ color: "#22d3ee", textDecoration: "none" }}>Dashboard</Link>
          <span style={{ margin: "0 8px", opacity: 0.4 }}>/</span>
          <span>World Model</span>
        </div>
        <h1 style={{ fontSize: 22, margin: 0 }}>World Model</h1>
        <p style={{ opacity: 0.6, margin: "4px 0 0", fontSize: 13 }}>
          Live 3D scene with drone orbit, HK skyline, and anomaly markers. Talk to the NEPA agent on the right.
        </p>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
        <Card label="Local time"     value={clock || "--:--:--"} mono />
        <Card label="ATLAS Fit"      value={`${fit}/100`} mono color={fit < 75 ? "#f59e0b" : "#22d3ee"} />
        <Card label="Active drones"  value={`${FLEET.filter((f) => f.status === "active").length}/${FLEET.length}`} />
        <Card label="Open alerts"    value={`${ALERTS.filter((a) => a.severity !== "info").length}`} color="#f59e0b" />
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        <WorldScene />
        <AgentDock />
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Panel title="Fleet">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <tbody>
              {FLEET.map((d) => (
                <tr key={d.id} style={{ borderTop: "1px solid #1a1f26" }}>
                  <td style={{ padding: "6px 8px", fontWeight: 600 }}>{d.name}</td>
                  <td style={{ padding: "6px 8px", opacity: 0.7 }}>{d.status}</td>
                  <td style={{ padding: "6px 8px", fontFamily: "monospace" }}>{d.battery}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="Alerts">
          {ALERTS.map((a) => (
            <div key={a.id} style={{ padding: "6px 0", borderTop: "1px solid #1a1f26", fontSize: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", opacity: 0.7 }}>
                <span>{a.kind}</span><span>{a.at}</span>
              </div>
              <div style={{ marginTop: 2 }}>{a.message}</div>
            </div>
          ))}
        </Panel>
        <Panel title="Activity">
          {ACTIVITY.map((a) => (
            <div key={a.id} style={{ padding: "6px 0", borderTop: "1px solid #1a1f26", fontSize: 12 }}>
              <div style={{ opacity: 0.7 }}>{a.actor} - {a.at}</div>
              <div>{a.action}</div>
            </div>
          ))}
        </Panel>
      </section>

      <footer style={{ display: "flex", gap: 16, padding: "6px 12px", borderTop: "1px solid #1a1f26", fontSize: 11, opacity: 0.7 }}>
        <span>LINK OK</span>
        <span>NEPA online</span>
        <span>{clock}</span>
        <span style={{ marginLeft: "auto" }}>ATLAS Fit {fit}/100</span>
      </footer>
    </main>
  );
}

function Card({ label, value, mono, color }: { label: string; value: string; mono?: boolean; color?: string }) {
  return (
    <div style={{ padding: 12, border: "1px solid #1a1f26", borderRadius: 8, background: "#0e1217" }}>
      <div style={{ fontSize: 11, opacity: 0.6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, color: color ?? "#e7ecf3", fontFamily: mono ? "ui-monospace, monospace" : undefined }}>
        {value}
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ padding: 12, border: "1px solid #1a1f26", borderRadius: 8, background: "#0e1217" }}>
      <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".08em" }}>{title}</div>
      {children}
    </section>
  );
}
