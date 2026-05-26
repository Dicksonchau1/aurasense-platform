"use client";

import { useEffect, useRef, useState } from "react";
import { useMission } from "@/lib/mission/context";
import { SUGGS } from "@/lib/mission/nepa";

export default function NepaTab() {
  const m = useMission();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [m.nepa.length]);

  const send = () => {
    const v = input.trim();
    if (!v) return;
    m.sendUserNepa(v);
    setInput("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4f98a3", boxShadow: "0 0 6px #4f98a3" }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: "#e0e8f2" }}>NEPA Agent</span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#6b7a8c", fontFamily: "ui-monospace, monospace" }}>v3.2</span>
      </div>

      <div
        ref={scrollRef}
        style={{
          maxHeight: 240,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          padding: 8,
          background: "rgba(5,14,26,.4)",
          border: "1px solid #1a1f26",
          borderRadius: 8,
        }}
      >
        {m.nepa.map((msg, i) => {
          const me = msg.role === "user";
          return (
            <div
              key={i}
              style={{
                alignSelf: me ? "flex-end" : "flex-start",
                maxWidth: "92%",
                padding: "6px 9px",
                borderRadius: 8,
                fontSize: 11,
                lineHeight: 1.5,
                background: me ? "rgba(79,152,163,.18)" : "rgba(79,152,163,.08)",
                border: "1px solid " + (me ? "rgba(79,152,163,.4)" : "rgba(79,152,163,.18)"),
                color: me ? "#cfeaff" : "#cfd8e3",
              }}
            >
              {msg.text}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="Ask NEPA..."
          style={{
            flex: 1,
            height: 30,
            borderRadius: 6,
            background: "rgba(255,255,255,.04)",
            border: "1px solid #1a1f26",
            padding: "0 9px",
            color: "#e0e8f2",
            fontSize: 11.5,
          }}
        />
        <button onClick={send} style={{ height: 30, padding: "0 12px", borderRadius: 6, background: "linear-gradient(135deg,#3b5d8d,#4f98a3)", color: "#fff", border: "none", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>
          Send
        </button>
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: "#8b9aae", textTransform: "uppercase", letterSpacing: ".06em", marginTop: 4 }}>Suggestions</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {SUGGS.map((s) => (
          <div
            key={s.t}
            onClick={() => { m.toast("Applied: " + s.t, "success"); m.pushNepa({ role: "ai", text: "Applied: " + s.t + " - " + s.d }); }}
            style={{
              display: "flex",
              gap: 8,
              padding: "7px 9px",
              borderRadius: 7,
              background: "rgba(79,152,163,.06)",
              border: "1px solid rgba(79,152,163,.18)",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 12, color: "#5ab8d0" }}>{s.i}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#cfd8e3" }}>{s.t}</div>
              <div style={{ fontSize: 10, color: "#8b9aae" }}>{s.d}</div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => m.optimiseWPs()}
        style={{ width: "100%", height: 29, marginTop: 4, borderRadius: 6, background: "linear-gradient(135deg,#3b5d8d,#4f98a3)", color: "#fff", border: "none", fontWeight: 700, fontSize: 11, cursor: "pointer" }}
      >
        Apply NEPA Optimisation
      </button>

      <div style={{ height: 1, background: "#1a1f26", margin: "4px 0" }} />

      <div style={{ fontSize: 11, fontWeight: 700, color: "#8b9aae", textTransform: "uppercase", letterSpacing: ".06em" }}>STDP State</div>
      <StatRow label="Arch." value="STDP v3.2 LIF" />
      <StatRow label="Learning rate" value="0.0014" />
      <StatRow label="Confidence" value="0.87" />
      <StatRow label="Patterns" value="247" />
      <StatRow label="Reward" value="0.83" />
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", fontSize: 11.5 }}>
      <span style={{ color: "#8b9aae" }}>{label}</span>
      <span style={{ color: "#e0e8f2", fontFamily: "ui-monospace, monospace", fontWeight: 600 }}>{value}</span>
    </div>
  );
}
