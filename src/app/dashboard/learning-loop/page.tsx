'use client';

import Link from "next/link";

export default function LearningLoopPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0a0e15", color: "#e5e7eb", fontFamily: "system-ui", padding: "32px 40px" }}>
      <header style={{ marginBottom: 28, borderBottom: "1px solid #1f2937", paddingBottom: 20 }}>
        <div style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
          <Link href="/dashboard" style={{ color: "#22d3ee", textDecoration: "none" }}>Dashboard</Link>
          <span style={{ margin: "0 8px", color: "#374151" }}>/</span>
          <span>Learning Loop</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Learning Loop</h1>
        <p style={{ color: "#9ca3af", marginTop: 6, fontSize: 14 }}>STDP weight updates, council review, and postflight retraining.</p>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 22 }}>
        <div style={{ padding: "14px 16px", background: "#111827", border: "1px solid #1f2937", borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>Jobs (24h)</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6, color: "#22d3ee" }}>6</div>
        </div>
        <div style={{ padding: "14px 16px", background: "#111827", border: "1px solid #1f2937", borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>Active</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6, color: "#3b82f6" }}>2</div>
        </div>
        <div style={{ padding: "14px 16px", background: "#111827", border: "1px solid #1f2937", borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>Promoted</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6, color: "#10b981" }}>3</div>
        </div>
        <div style={{ padding: "14px 16px", background: "#111827", border: "1px solid #1f2937", borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>Rejected</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6, color: "#f59e0b" }}>1</div>
        </div>
      </section>

      <section style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 10, padding: 32, textAlign: "center" }}>
        <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>Full STDP trace, council inspector, and retraining queue will be rebuilt under the ATLAS OS visual system.</p>
        <Link href="/atlas/nepa" style={{ display: "inline-block", marginTop: 16, padding: "9px 14px", background: "#22d3ee", color: "#0a0e15", borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
          Open NEPA console
        </Link>
      </section>
    </main>
  );
}
