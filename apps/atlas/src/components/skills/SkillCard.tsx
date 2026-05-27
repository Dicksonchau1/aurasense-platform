// src/components/skills/SkillCard.tsx
"use client";

import type { AtlasSkill } from "@/lib/skills/types";

const DOMAIN_COLORS: Record<string, string> = {
  perception:      "bg-blue-500/20 text-blue-300 border-blue-500/30",
  world_model:     "bg-purple-500/20 text-purple-300 border-purple-500/30",
  orchestration:   "bg-amber-500/20 text-amber-300 border-amber-500/30",
  actuation:       "bg-green-500/20 text-green-300 border-green-500/30",
  verification:    "bg-teal-500/20 text-teal-300 border-teal-500/30",
  self_extension:  "bg-rose-500/20 text-rose-300 border-rose-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  active:           "text-emerald-400",
  approval_pending: "text-amber-400",
  sandbox_passed:   "text-sky-400",
  sandbox_failed:   "text-red-400",
  draft:            "text-zinc-400",
  deprecated:       "text-zinc-600",
};

const PROVENANCE_BADGE = {
  human_authored: {
    label: "Human",
    cls: "bg-zinc-700 text-zinc-300",
    icon: "👤",
  },
  nepa_generated: {
    label: "NEPA Agent",
    cls: "bg-rose-900/60 text-rose-300 border border-rose-500/40",
    icon: "🧠",
  },
};

interface Props {
  skill: AtlasSkill;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export default function SkillCard({ skill, onApprove, onReject }: Props) {
  const domainCls = DOMAIN_COLORS[skill.domain] ?? "bg-zinc-700 text-zinc-300";
  const statusCls = STATUS_COLORS[skill.status] ?? "text-zinc-400";
  const provenance = PROVENANCE_BADGE[skill.provenance];

  return (
    <div className="rounded-xl border border-zinc-700/60 bg-zinc-900 p-4 flex flex-col gap-3 hover:border-zinc-600 transition-colors">

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white leading-tight">
            {skill.name}
          </h3>
          <span className="text-xs text-zinc-500">v{skill.version}</span>
        </div>
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${provenance.cls} whitespace-nowrap`}
        >
          {provenance.icon} {provenance.label}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-zinc-400 line-clamp-2">{skill.description}</p>

      {/* Meta row */}
      <div className="flex flex-wrap gap-1.5">
        <span className={`text-[11px] px-2 py-0.5 rounded-full border ${domainCls}`}>
          {skill.domain.replace("_", " ")}
        </span>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
          {skill.orchestration.executionMode}
        </span>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
          {skill.safety.level} risk
        </span>
      </div>

      {/* Orchestration flags */}
      <div className="flex gap-2 text-[10px] text-zinc-500">
        {skill.orchestration.canBeComposed && <span>◉ composable</span>}
        {skill.orchestration.canBeInterrupted && <span>◉ interruptible</span>}
        {skill.safety.canAffectRealHardware && (
          <span className="text-amber-500">⚡ hardware</span>
        )}
      </div>

      {/* Benchmark */}
      {skill.benchmark.lastBenchmarkScore !== undefined && (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-zinc-800 rounded-full h-1.5">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{ width: `${skill.benchmark.lastBenchmarkScore * 100}%` }}
            />
          </div>
          <span className="text-[11px] text-zinc-400">
            {(skill.benchmark.lastBenchmarkScore * 100).toFixed(0)}% bench
          </span>
        </div>
      )}

      {/* Status + approval actions */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-zinc-800">
        <span className={`text-[11px] font-medium ${statusCls}`}>
          ● {skill.status.replace("_", " ")}
        </span>

        {skill.status === "approval_pending" && onApprove && onReject && (
          <div className="flex gap-2">
            <button
              onClick={() => onApprove(skill.id)}
              className="text-[11px] px-2 py-1 rounded bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 border border-emerald-600/40 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => onReject(skill.id)}
              className="text-[11px] px-2 py-1 rounded bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-600/40 transition-colors"
            >
              Reject
            </button>
          </div>
        )}

        {skill.provenance === "nepa_generated" && skill.status === "active" && (
          <span className="text-[10px] text-zinc-600">
            promoted {skill.promotedAt?.split("T")[0]}
          </span>
        )}
      </div>
    </div>
  );
}