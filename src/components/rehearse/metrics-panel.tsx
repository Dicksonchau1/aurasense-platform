"use client";

import * as React from "react";
import { LaneBar } from "@/components/rehearse/lane-bar";
import { COPY } from "@/lib/copy";

export interface RehearseMetrics {
  envelope: number;
  consistency: number;
  lanes: { pace: number; pitch: number; stillness: number; gaze: number };
  durationSec: number;
}

export function MetricsPanel({ metrics }: { metrics: RehearseMetrics }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-end gap-6">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">
            {COPY.rehearse.envelopeLabel}
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-5xl font-semibold tabular-nums text-zinc-50">
              {metrics.envelope.toFixed(0)}
            </span>
            <span className="text-sm text-zinc-500">/ 100</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">
            {COPY.rehearse.consistencyLabel}
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-semibold tabular-nums text-zinc-200">
              {metrics.consistency.toFixed(0)}
            </span>
            <span className="text-xs text-zinc-500">/ 100</span>
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">
            Duration
          </div>
          <div className="mt-1 font-mono text-sm text-zinc-300 tabular-nums">
            {format(metrics.durationSec)}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <LaneBar label={COPY.rehearse.laneLabels.pace} value={metrics.lanes.pace} />
        <LaneBar label={COPY.rehearse.laneLabels.pitch} value={metrics.lanes.pitch} />
        <LaneBar
          label={COPY.rehearse.laneLabels.stillness}
          value={metrics.lanes.stillness}
        />
        <LaneBar label={COPY.rehearse.laneLabels.gaze} value={metrics.lanes.gaze} />
      </div>
    </div>
  );
}

function format(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
