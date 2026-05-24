"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/copy";
import { MetricsPanel, type RehearseMetrics } from "./metrics-panel";

// Deterministic pseudo-random for stable demo output
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED = 0xc0ffee;
const TICK_MS = 250;

const ZERO: RehearseMetrics = {
  envelope: 0,
  consistency: 0,
  lanes: { pace: 0, pitch: 0, stillness: 0, gaze: 0 },
  durationSec: 0,
};

export function MockRuntime() {
  const [running, setRunning] = React.useState(false);
  const [metrics, setMetrics] = React.useState<RehearseMetrics>(ZERO);
  const startedAt = React.useRef<number | null>(null);
  const rng = React.useRef(mulberry32(SEED));

  React.useEffect(() => {
    if (!running) return;
    startedAt.current = performance.now();
    rng.current = mulberry32(SEED);

    const id = window.setInterval(() => {
      const elapsed = (performance.now() - (startedAt.current ?? 0)) / 1000;
      const r = rng.current;
      // Smoothly ramp lanes upward with jitter
      const ramp = Math.min(1, elapsed / 8);
      const j = () => (r() - 0.5) * 14;
      const pace = clamp(60 + ramp * 24 + j());
      const pitch = clamp(58 + ramp * 28 + j());
      const stillness = clamp(70 + ramp * 18 + j());
      const gaze = clamp(55 + ramp * 30 + j());
      const consistency = clamp((pace + pitch + stillness + gaze) / 4 + j() * 0.3);
      const envelope = clamp(consistency * 0.85 + (r() * 12 + ramp * 6));
      setMetrics({
        envelope,
        consistency,
        lanes: { pace, pitch, stillness, gaze },
        durationSec: elapsed,
      });
    }, TICK_MS);

    return () => window.clearInterval(id);
  }, [running]);

  // ⌘↵ keyboard shortcut
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        setRunning((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="space-y-5">
      <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
        <div className="grid h-full place-items-center text-zinc-600">
          <div className="text-center">
            <div className="text-xs uppercase tracking-widest text-zinc-500">
              Camera preview
            </div>
            <div className="mt-2 text-sm text-zinc-400">
              {running
                ? "Mock session running · all signals stay on this device"
                : "Press Start Rehearsal to begin"}
            </div>
          </div>
        </div>
      </div>

      <MetricsPanel metrics={metrics} />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="lg"
          variant={running ? "danger" : "primary"}
          onClick={() => setRunning((v) => !v)}
        >
          {running ? COPY.rehearse.runningCta : COPY.rehearse.startCta}
          <kbd className="ml-1 rounded bg-black/30 px-1.5 py-0.5 text-[10px] font-mono">
            {COPY.rehearse.startHint}
          </kbd>
        </Button>
        {/* V0.5 will add <SaveSessionButton /> here once duration ≥ 15 s. */}
        <span className="text-xs text-zinc-500">
          Save & share arrives in V0.5.
        </span>
      </div>
    </div>
  );
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, n));
}
