// src/components/skills/SkillFilters.tsx
"use client";

interface FilterState {
  domain: string;
  status: string;
  provenance: string;
}

interface Props {
  filter: FilterState;
  onChange: (f: FilterState) => void;
}

const DOMAINS = ["", "perception", "world_model", "orchestration", "actuation", "verification", "self_extension"];
const STATUSES = ["", "active", "approval_pending", "sandbox_passed", "sandbox_failed", "draft", "deprecated"];
const PROVENANCES = ["", "human_authored", "nepa_generated"];

export default function SkillFilters({ filter, onChange }: Props) {
  const sel = "bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-zinc-500";

  return (
    <div className="flex gap-2 flex-wrap">
      <select className={sel} value={filter.domain} onChange={(e) => onChange({ ...filter, domain: e.target.value })}>
        {DOMAINS.map((d) => <option key={d} value={d}>{d || "All domains"}</option>)}
      </select>
      <select className={sel} value={filter.status} onChange={(e) => onChange({ ...filter, status: e.target.value })}>
        {STATUSES.map((s) => <option key={s} value={s}>{s || "All statuses"}</option>)}
      </select>
      <select className={sel} value={filter.provenance} onChange={(e) => onChange({ ...filter, provenance: e.target.value })}>
        {PROVENANCES.map((p) => <option key={p} value={p}>{p || "All provenance"}</option>)}
      </select>
    </div>
  );
}