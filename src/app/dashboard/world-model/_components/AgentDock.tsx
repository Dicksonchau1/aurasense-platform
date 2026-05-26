"use client";

import { useState } from "react";
import { AGENT_RESPONSES } from "@/lib/mock/seed";

interface Msg { who: "you" | "agent"; text: string; }

export default function AgentDock() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { who: "agent", text: "Hi - ask me about status, pre-flight, weather, or audit." },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    const q = input.trim().toLowerCase();
    if (!q) return;
    const key = ["status", "preflight", "weather", "audit"].find((k) => q.includes(k)) ?? "default";
    const reply = AGENT_RESPONSES[key] ?? AGENT_RESPONSES.default;
    setMsgs((m) => [...m, { who: "you", text: input }, { who: "agent", text: reply }]);
    setInput("");
  };

  return (
    <div
      style={{
        border: "1px solid #1a1f26",
        borderRadius: 8,
        background: "#0e1217",
        display: "flex",
        flexDirection: "column",
        height: 520,
      }}
    >
      <div style={{ padding: "10px 14px", borderBottom: "1px solid #1a1f26", fontSize: 12, opacity: 0.7, textTransform: "uppercase", letterSpacing: ".08em" }}>
        NEPA Agent
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {msgs.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.who === "you" ? "flex-end" : "flex-start",
              maxWidth: "80%",
              padding: "8px 10px",
              borderRadius: 8,
              background: m.who === "you" ? "#0e1c25" : "#11151a",
              border: "1px solid #1a1f26",
              fontSize: 13,
              whiteSpace: "pre-wrap",
            }}
          >
            <div style={{ fontSize: 10, opacity: 0.6, marginBottom: 2, textTransform: "uppercase", letterSpacing: ".08em" }}>
              {m.who === "you" ? "You" : "Agent"}
            </div>
            {m.text}
          </div>
        ))}
      </div>
      <div style={{ padding: 10, borderTop: "1px solid #1a1f26", display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="Ask the agent..."
          style={{
            flex: 1,
            padding: "8px 10px",
            background: "#11151a",
            border: "1px solid #1a1f26",
            borderRadius: 6,
            color: "#e7ecf3",
            fontSize: 13,
          }}
        />
        <button
          onClick={send}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            background: "#22d3ee",
            color: "#0b0d10",
            border: "none",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
