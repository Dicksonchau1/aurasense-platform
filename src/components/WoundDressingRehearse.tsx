'use client';

import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { v4 as uuidv4 } from "uuid";

const WS_PATH = "/ws/rehearse/wound-dressing/";

const STEP_NAMES = [
  "Clean wound",
  "Apply antiseptic",
  "Place dressing",
  "Secure dressing",
  "Final check",
];

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString();
}

export default function WoundDressingRehearse() {
  const { data: session } = useSession();
  const [sessionId, setSessionId] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [stepEvents, setStepEvents] = useState<any[]>([]);
  const [scores, setScores] = useState<{ [k: number]: number }>({});
  const [complete, setComplete] = useState<any>(null);
  const [audit, setAudit] = useState<any[]>([]);
  const [replayKey, setReplayKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [actionPerformed, setActionPerformed] = useState<string>("");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const id = uuidv4();
    setSessionId(id);
    setReplayKey(0);
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    const socket = new WebSocket(WS_PATH + sessionId);
    wsRef.current = socket;
    setWs(socket);
    setCurrentStep(-1);
    setStepEvents([]);
    setScores({});
    setComplete(null);
    setAudit([]);

    // --- User info wiring ---
    let userInfo = {
      id: "anonymous",
      email: "anonymous",
      name: "Anonymous",
      institution: "Unknown"
    };
    if (session && session.user) {
      userInfo = {
        id: session.user.id || session.user.email || "anonymous",
        email: session.user.email || "anonymous",
        name: session.user.name || "Anonymous",
        institution: session.user.institution || "Unknown"
      };
    }
    socket.onopen = () => {
      socket.send(
        JSON.stringify({ type: "user_info", user: userInfo })
      );
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setAudit((prev) => [...prev, data]);
      if (data.event_type === "session.start") {
        setError(null);
      } else if (data.event_type === "step.advance") {
        setCurrentStep(data.payload.step_index);
        setStepEvents((prev) => [...prev, data.payload]);
        setActionPerformed("");
        setError(null);
      } else if (data.event_type === "assessment.score") {
        setScores((prev) => ({ ...prev, [data.payload.step_index]: data.payload.score }));
        setError(null);
      } else if (data.event_type === "session.complete") {
        setComplete(data.payload);
        setError(null);
      } else if (data.event_type === "step.error") {
        setError(data.payload?.error || "Unknown error");
      } else if (data.event_type === "session.replay") {
        // no-op for now
      }
    };
    socket.onclose = () => {
      setError("Connection closed.");
    };
    return () => {
      socket.close();
    };
  }, [sessionId, replayKey, session]);

  const handleConfirm = () => {
    if (wsRef.current && currentStep >= 0) {
      wsRef.current.send(
        JSON.stringify({
          type: "action_confirmed",
          step_index: currentStep,
          action_performed: actionPerformed,
        })
      );
    }
  };

  const handleReplay = () => {
    setReplayKey((k) => k + 1);
    setStepEvents([]);
    setScores({});
    setComplete(null);
    setAudit([]);
    // reconnect with same sessionId
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ textAlign: 'center', fontSize: 28, marginBottom: 16 }}>Wound Dressing Rehearsal</h2>
      {error && (
        <div role="alert" aria-live="assertive" style={{ background: '#ffeaea', color: '#b00020', padding: 12, marginBottom: 12, borderRadius: 6, border: '1px solid #b00020' }}>
          <b>Error:</b> {error}
        </div>
      )}
      {complete ? (
        <div style={{ background: complete.passed ? "#d4f7d4" : "#f7d4d4", padding: 16, margin: "16px 0", borderRadius: 8, textAlign: 'center' }}>
          <b style={{ fontSize: 20 }}>{complete.passed ? "âœ… Session Complete" : "âŒ Session Complete"}</b> <br />
          <span style={{ fontWeight: 500 }}>{complete.passed ? "Passed" : "Failed"}</span> <br />
          <span>Score: <b>{complete.total_score} / {complete.max_score}</b></span>
          <br />
          <button onClick={handleReplay} style={{ marginTop: 12, padding: '8px 18px', borderRadius: 6, border: 'none', background: '#1976d2', color: 'white', fontWeight: 500, cursor: 'pointer' }}>Replay</button>
        </div>
      ) : (
        <div>
          {stepEvents.length > 0 && currentStep >= 0 && currentStep < STEP_NAMES.length && (
            <div style={{ border: "1px solid #ccc", padding: 16, margin: "16px 0", borderRadius: 8, background: '#fafbfc' }}>
              <b>Step {currentStep + 1}: {STEP_NAMES[currentStep]}</b>
              <br />
              <label htmlFor="action-performed" style={{ display: 'block', marginTop: 12 }}>Action performed:</label>
              <select
                id="action-performed"
                aria-label="Action performed"
                value={actionPerformed}
                onChange={e => setActionPerformed(e.target.value)}
                style={{ marginTop: 4, marginBottom: 8, width: '100%', padding: 6, borderRadius: 4 }}
              >
                <option value="">Select action</option>
                <option value="clean_wound">Clean wound</option>
                <option value="apply_antiseptic">Apply antiseptic</option>
                <option value="place_dressing">Place dressing</option>
                <option value="secure_dressing">Secure dressing</option>
                <option value="final_check">Final check</option>
              </select>
              <button
                onClick={handleConfirm}
                style={{ marginTop: 8, padding: '8px 18px', borderRadius: 6, border: 'none', background: '#1976d2', color: 'white', fontWeight: 500, cursor: 'pointer' }}
                disabled={!actionPerformed}
                aria-disabled={!actionPerformed}
              >
                Action Confirmed
              </button>
              {scores[currentStep] !== undefined && (
                <div style={{ color: scores[currentStep] === 1 ? "green" : "#b00020", marginTop: 8, fontWeight: 500 }}>
                  Score: {scores[currentStep]}
                  {scores[currentStep] === 1 ? " âœ…" : " âŒ"}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <details style={{ marginTop: 24 }}>
        <summary style={{ fontWeight: 500, fontSize: 16 }}>Audit Log</summary>
        <ul style={{ fontSize: 12, wordBreak: 'break-all', paddingLeft: 0 }}>
          {audit.map((evt, i) => (
            <li key={i} style={{ marginBottom: 2, listStyle: 'none' }}>
              <b>{formatTimestamp(evt.timestamp)}</b> â€” <code>{evt.event_type}</code> â€” <pre style={{ display: "inline" }}>{JSON.stringify(evt.payload)}</pre>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
