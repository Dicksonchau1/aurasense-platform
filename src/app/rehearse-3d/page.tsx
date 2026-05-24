"use client";

import { useEffect, useRef, useState } from "react";
import Card from "@/components/shell/Card";
import Button from "@/components/shell/Button";

type SessionPhase = "idle" | "running" | "complete";

interface ScoreEntry {
  label: string;
  score: number;
  max: number;
}

const DEMO_SCORES: ScoreEntry[] = [
  { label: "Hand positioning", score: 0, max: 25 },
  { label: "Pressure consistency", score: 0, max: 25 },
  { label: "Rate accuracy", score: 0, max: 25 },
  { label: "Depth compliance", score: 0, max: 25 },
];

export default function Rehearse3DPage() {
  const [phase, setPhase] = useState<SessionPhase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [scores, setScores] = useState<ScoreEntry[]>(DEMO_SCORES);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startSession() {
    setPhase("running");
    setElapsed(0);
    setScores(DEMO_SCORES.map((s) => ({ ...s, score: 0 })));
    timerRef.current = setInterval(() => {
      setElapsed((t) => {
        if (t >= 119) {
          endSession();
          return 120;
        }
        return t + 1;
      });
    }, 1000);
  }

  function endSession() {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("complete");
    setScores(DEMO_SCORES.map((s) => ({
      ...s,
      score: Math.round(Math.random() * s.max * 0.4 + s.max * 0.5),
    })));
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const totalScore = scores.reduce((a, s) => a + s.score, 0);
  const totalMax = scores.reduce((a, s) => a + s.max, 0);
  const pct = Math.round((totalScore / totalMax) * 100);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="aura-h1">Rehearse-3D</h1>
          <p className="aura-sub mt-1">
            Pose-guided CPR skill rehearsal with real-time NEPA perception scoring.
          </p>
        </div>
        <span
          className={`aura-badge ${
            phase === "running"
              ? "aura-badge-success"
              : phase === "complete"
              ? "aura-badge-warn"
              : "aura-badge-danger"
          }`}
        >
          {phase === "idle" ? "Waiting" : phase === "running" ? "Session live" : "Session complete"}
        </span>
      </header>

      {/* Viewport placeholder */}
      <div
        className="aura-card flex items-center justify-center"
        style={{ minHeight: 320, background: "var(--bg-elevated)", borderStyle: "dashed" }}
      >
        {phase === "idle" && (
          <div className="text-center space-y-3">
            <p className="aura-sub">3D viewport — camera access required</p>
            <p className="label-tech" style={{ fontSize: "0.7rem" }}>WebGL + MediaPipe loading on session start</p>
          </div>
        )}
        {phase === "running" && (
          <div className="text-center space-y-2">
            <p className="aura-h2" style={{ fontFamily: "var(--font-mono)", fontSize: "2.5rem" }}>{mm}:{ss}</p>
            <p className="aura-sub">Pose tracking active — maintain compression rhythm</p>
          </div>
        )}
        {phase === "complete" && (
          <div className="text-center space-y-2">
            <p className="aura-h1" style={{ color: "var(--accent)" }}>{pct}%</p>
            <p className="aura-sub">Session score</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {phase === "idle" && (
          <Button onClick={startSession}>Start session</Button>
        )}
        {phase === "running" && (
          <Button variant="ghost" onClick={endSession}>End early</Button>
        )}
        {phase === "complete" && (
          <Button onClick={startSession}>Retry</Button>
        )}
      </div>

      {/* Score breakdown */}
      {phase !== "idle" && (
        <Card title="Score breakdown">
          <div className="space-y-3">
            {scores.map((s) => {
              const p = Math.round((s.score / s.max) * 100);
              return (
                <div key={s.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="aura-sub">{s.label}</span>
                    <span className="font-mono text-xs">{s.score}/{s.max}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 4, background: "var(--border)" }}>
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 4,
                        width: `${phase === "running" ? 0 : p}%`,
                        background: p >= 80 ? "var(--success)" : p >= 50 ? "var(--warning)" : "var(--danger)",
                        transition: "width 600ms ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
