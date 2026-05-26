'use client';

import { useState, useRef, useEffect } from "react";

interface Msg {
  role: "user" | "agent";
  text: string;
  ts: number;
}

const CANNED_RESPONSES: Record<string, string> = {
  default:     "I am analysing the live world model. Ask me about anomalies, drift, mission progress, or calibration.",
  anomaly:     "2 anomalies in the current envelope. One spalling pattern on Face N (confidence 0.91), one thermal hotspot on Face W (confidence 0.74). Both within 3-sigma of the baseline; logging for council review.",
  drift:       "Calibration drift score is 0.034 and trending up over 27 days. Recommend recalibrating within 3 days. The drift is uniform across sensor modalities, which rules out hardware fault.",
  battery:     "DRN-12 is at 82% battery, sufficient for the remaining 12 waypoints. RTH threshold is 30%. Estimated battery at mission end: 51%.",
  signal:      "Link strength 96%, no packet loss in the last 4 minutes. RTK fix is Fixed with HDOP 0.6.",
  mode:        "Vehicle is in AUTO mode executing mission MSN-007. Next mode change scheduled at WP-22 (LAND).",
  envelope:    "Active mission MSN-007 is well within the predicted envelope. Max divergence in the last 60 s was 0.18 m (predicted 0.21 m budget). Prediction error trending down.",
  weather:     "Wind 5.2 m/s SW, well below the 12 m/s safety limit. Solar elevation 45 degrees, glare risk advisory only.",
  nepa:        "NEPA STDP is reinforcing 3 patterns this session: confined-space transit, low-light edge detection, and humid-region facade adaptation. Dopamine modulation at 0.83.",
  council:     "3-model council agreement on the last 60 weight updates: 64% unanimous, 28% majority (2 of 3), 8% rejected. Last rejection was a wound-dressing pattern with negative delta.",
  what:        "I am NEPA Copilot. I have read access to the live world model, sensor fusion telemetry, ArduPilot link state, and audit chain. I can explain what the autonomy is doing right now.",
  hello:       "Hello. World model is healthy, mission MSN-007 is progressing nominally. What would you like me to inspect?",
};

function pickResponse(input: string): string {
  const q = input.toLowerCase();
  if (q.match(/hello|hi |hey/)) return CANNED_RESPONSES.hello;
  if (q.match(/what are you|who are you|what is this|what can you/)) return CANNED_RESPONSES.what;
  if (q.match(/anomal|defect|spall|crack/)) return CANNED_RESPONSES.anomaly;
  if (q.match(/drift|calibrat|baseline/)) return CANNED_RESPONSES.drift;
  if (q.match(/battery|charge|power/)) return CANNED_RESPONSES.battery;
  if (q.match(/signal|link|rtk|gps/)) return CANNED_RESPONSES.signal;
  if (q.match(/mode|auto|manual|rth/)) return CANNED_RESPONSES.mode;
  if (q.match(/envelope|diverge|predict/)) return CANNED_RESPONSES.envelope;
  if (q.match(/wind|weather|glare|solar/)) return CANNED_RESPONSES.weather;
  if (q.match(/nepa|stdp|spike|dopamine/)) return CANNED_RESPONSES.nepa;
  if (q.match(/council|critic|review|promot/)) return CANNED_RESPONSES.council;
  return CANNED_RESPONSES.default;
}

const PROMPT_CHIPS = ["Anomalies?", "Drift?", "Battery?", "Council?"];

export default function NepaCopilot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "agent",
      text: "Hello. I am NEPA Copilot. Ask me about anomalies, drift, mission progress, or anything the autonomy is doing right now.",
      ts: Date.now(),
    },
  ]);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [msgs, open]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMsgs((prev) => [...prev, { role: "user", text, ts: Date.now() }]);
    setInput("");
    setBusy(true);
    setTimeout(() => {
      const reply = pickResponse(text);
      setMsgs((prev) => [...prev, { role: "agent", text: reply, ts: Date.now() }]);
      setBusy(false);
    }, 700 + Math.random() * 600);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed", bottom: 50, right: 18,
          width: 56, height: 56, borderRadius: 28,
          background: "linear-gradient(135deg, #1a3a80, #0891b2)",
          color: "#fff", border: 0, fontSize: 22, fontWeight: 800,
          cursor: "pointer", boxShadow: "0 8px 24px rgba(8,145,178,0.45)", zIndex: 500,
        }}
      >
        N
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed", bottom: 50, right: 18,
        width: 360, height: 480,
        background: "linear-gradient(180deg, #132035, #0d1a2b)",
        border: "1px solid rgba(8,145,178,0.35)", borderRadius: 14,
        boxShadow: "0 12px 32px rgba(0,0,0,0.55)",
        display: "flex", flexDirection: "column", zIndex: 500, fontFamily: "system-ui",
      }}
    >
      <header
        style={{
          padding: "12px 14px",
          borderBottom: "1px solid rgba(8,145,178,0.18)",
          display: "flex", alignItems: "center", gap: 10,
        }}
      >
        <div
          style={{
            width: 32, height: 32, borderRadius: 16,
            background: "linear-gradient(135deg, #1a3a80, #0891b2)",
            display: "grid", placeItems: "center",
            color: "#fff", fontWeight: 800, fontSize: 13,
          }}
        >
          N
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#cee0f0" }}>NEPA Copilot</div>
          <div style={{ fontSize: 10, color: "#6ee7a4", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: 6, background: "#10b981" }} />
            Connected / world-model context
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          style={{
            background: "transparent",
            border: "1px solid rgba(207,224,240,0.2)",
            color: "#9ca3af",
            width: 26, height: 26, borderRadius: 6,
            fontSize: 14, cursor: "pointer",
          }}
        >
          x
        </button>
      </header>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "14px 14px 8px 14px" }}>
        {msgs.map((m, i) => (
          <MsgBubble key={i} msg={m} />
        ))}
        {busy && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
            <div
              style={{
                padding: "8px 12px", borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(8,145,178,0.18)",
                fontSize: 12, color: "#6a90ae", fontStyle: "italic",
              }}
            >
              thinking...
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "8px 14px", borderTop: "1px solid rgba(8,145,178,0.18)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
          {PROMPT_CHIPS.map((q) => (
            <button
              key={q}
              onClick={() => setInput(q)}
              style={{
                padding: "4px 10px", fontSize: 11,
                color: "#7dd3e8",
                background: "rgba(8,145,178,0.1)",
                border: "1px solid rgba(8,145,178,0.3)",
                borderRadius: 12, cursor: "pointer",
                              }}
            >
              {q}
            </button>
          ))}
        </div>
        <form onSubmit={send} style={{ display: "flex", gap: 6 }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the live world model..."
            disabled={busy}
            style={{
              flex: 1, padding: "8px 10px",
              background: "#0a0e15",
              border: "1px solid rgba(8,145,178,0.25)",
              borderRadius: 6,
              color: "#cee0f0",
              fontSize: 12,
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            style={{
              padding: "8px 14px",
              background: "linear-gradient(135deg, #1a3a80, #0891b2)",
              color: "#fff",
              border: 0,
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              cursor: busy || !input.trim() ? "not-allowed" : "pointer",
              opacity: busy || !input.trim() ? 0.5 : 1,
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

function MsgBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div
      style={{
        marginBottom: 12,
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          maxWidth: "82%",
          padding: "8px 12px",
          borderRadius: 10,
          background: isUser ? "rgba(8,145,178,0.25)" : "rgba(255,255,255,0.04)",
          border: "1px solid rgba(8,145,178,0.18)",
          fontSize: 12.5,
          lineHeight: 1.5,
          color: "#cee0f0",
        }}
      >
        {msg.text}
      </div>
    </div>
  );
}