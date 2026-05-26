'use client';

import { useState } from "react";
import Link from "next/link";

export default function CompliancePage() {
  const [decision, setDecision] = useState<"pending" | "go" | "no-go">("pending");

  return (
    <main style={{ padding: "28px 36px" }}>
      <header style={{ marginBottom: 24, borderBottom: "1px solid #1f2937", paddingBottom: 18 }}>
        <div style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
          <Link href="/dashboard" style={{ color: "#22d3ee", textDecoration: "none" }}>Dashboard</Link>
          <span style={{ margin: "0 8px", color: "#374151" }}>/</span>
          <span>Compliance</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Pre-flight Compliance</h1>
        <p style={{ color: "#9ca3af", marginTop: 6, fontSize: 14 }}>HKCAD-aligned go/no-go decision for the next dispatch.</p>
      </header>

      <section style={{ padding: 24, background: "linear-gradient(180deg, #132035, #0d1a2b)", border: "1px solid rgba(8,145,178,.18)", borderRadius: 14, marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
          <div style={{ fontSize: 64, fontWeight: 800, color: "#22c55e", fontFamily: "ui-monospace, monospace", lineHeight: 1 }}>
            94<span style={{ fontSize: 28, color: "#6b7280" }}>/100</span>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#22c55e", marginBottom: 4 }}>Compliance score: GO WITH CAUTION</div>
            <div style={{ fontSize: 13, color: "#9ca3af" }}>7 passed / 1 advisory / 0 blocked / 8 total</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setDecision("go")} style={{ padding: "12px 24px", background: decision === "go" ? "#065f46" : "#0a0e15", color: "#a7f3d0", border: "1px solid #065f46", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              {decision === "go" ? "GO authorised" : "Authorise GO"}
            </button>
            <button onClick={() => setDecision("no-go")} style={{ padding: "12px 24px", background: decision === "no-go" ? "#7f1d1d" : "#0a0e15", color: "#fecaca", border: "1px solid #7f1d1d", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              {decision === "no-go" ? "NO-GO recorded" : "Abort to NO-GO"}
            </button>
          </div>
        </div>
      </section>

      <section style={{ padding: 20, background: "linear-gradient(180deg, #132035, #0d1a2b)", border: "1px solid rgba(8,145,178,.18)", borderRadius: 14 }}>
        <h2 style={{ margin: "0 0 14px 0", fontSize: 15, fontWeight: 700, color: "#a8d4ee" }}>Pre-flight checklist</h2>
        <div style={{ display: "grid", gap: 8 }}>

          <Row dot="#10b981" badge="PASS"     title="Wind within limits"     detail="5.2 m/s measured / 12 m/s max" />
          <Row dot="#10b981" badge="PASS"     title="Battery sufficient"     detail="95% charge / 41 min endurance / mission needs 38" />
          <Row dot="#f59e0b" badge="ADVISORY" title="Glare risk moderate"    detail="Solar elevation 45 deg / mitigated by route plan" />
          <Row dot="#10b981" badge="PASS"     title="Clearance zone clear"   detail="50 m buffer enforced / HKCAD notified" />
          <Row dot="#10b981" badge="PASS"     title="RTK lock established"   detail="24 satellites / HDOP 0.6" />
          <Row dot="#10b981" badge="PASS"     title="Insurance active"       detail="AXA-HK-2026-D-00892 valid until 2026-12-31" />
          <Row dot="#10b981" badge="PASS"     title="HKCAD permit verified"  detail="Type-B operator / VLOS / daytime only" />
          <Row dot="#10b981" badge="PASS"     title="Audit chain healthy"    detail="Last appended 2 min ago / chain verified" />

        </div>
      </section>

      <section style={{ marginTop: 20, padding: 14, background: "#0a0e15", border: "1px solid #1f2937", borderRadius: 8, fontSize: 12, color: "#6b7280", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Decision: <strong style={{ color: decision === "go" ? "#a7f3d0" : decision === "no-go" ? "#fecaca" : "#9ca3af" }}>{decision === "pending" ? "AWAITING AUTHORISATION" : decision.toUpperCase()}</strong></span>
        <span>All decisions appended to immutable evidence chain.</span>
      </section>
    </main>
  );
}

function Row({ dot, badge, title, detail }: { dot: string; badge: string; title: string; detail: string }) {
  const bg = dot === "#10b981" ? "rgba(34,197,94,0.15)" : dot === "#f59e0b" ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "#0a0e15", border: "1px solid #1f2937", borderRadius: 8 }}>
      <span style={{ width: 10, height: 10, borderRadius: 10, background: dot, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{detail}</div>
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: bg, color: dot, letterSpacing: "0.06em" }}>{badge}</span>
    </div>
  );
}
