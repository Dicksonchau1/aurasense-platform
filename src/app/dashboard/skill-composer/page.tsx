"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SKILLS, type Skill } from "@/lib/mock/skills";
import ChainList from "./_components/ChainList";
import ScriptPreview from "./_components/ScriptPreview";
import MissionConfigPanel, { type MissionConfig } from "./_components/MissionConfigPanel";
import QuickAddPanel from "./_components/QuickAddPanel";

export interface ChainItem {
  uid: number;
  skill: Skill;
}

interface Toast { id: number; msg: string; kind: "info" | "success" | "error"; }

const QUICK_ADD_IDS = ["indoornav", "indoordelivery", "nermdecide", "collisionavoid"];

export default function SkillComposerPage() {
  const [chain, setChain] = useState<ChainItem[]>([]);
  const [cfg, setCfg] = useState<MissionConfig>({
    name: "Delivery Run L1->L3",
    robot: "AMR-D200 Ground",
    priority: "Normal",
    nermLearn: true,
    collisionAvoid: true,
  });
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = (msg: string, kind: Toast["kind"] = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, kind }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  };

  const addSkill = (id: string) => {
    const s = SKILLS.find((x) => x.id === id);
    if (!s) return;
    setChain((c) => [...c, { uid: Date.now() + Math.random(), skill: s }]);
    pushToast(s.name + " added to chain", "success");
  };

  const removeAt = (uid: number) => setChain((c) => c.filter((x) => x.uid !== uid));
  const clearChain = () => { setChain([]); pushToast("Chain cleared", "info"); };

  const move = (uid: number, dir: -1 | 1) => {
    setChain((c) => {
      const i = c.findIndex((x) => x.uid === uid);
      if (i < 0) return c;
      const j = i + dir;
      if (j < 0 || j >= c.length) return c;
      const copy = c.slice();
      const tmp = copy[i]; copy[i] = copy[j]; copy[j] = tmp;
      return copy;
    });
  };

  const deploy = () => {
    if (chain.length === 0) { pushToast("Add at least one skill", "error"); return; }
    pushToast("Deploying " + chain.length + "-skill chain to " + cfg.robot, "success");
  };

  const quickAddSkills = useMemo(
    () => QUICK_ADD_IDS.map((id) => SKILLS.find((s) => s.id === id)).filter((s): s is Skill => !!s),
    [],
  );

  return (
    <main style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 12, color: "#8b9aae" }}>
        <Link href="/dashboard" style={{ color: "#5ab8d0", textDecoration: "none" }}>Dashboard</Link>
        <span style={{ margin: "0 8px", opacity: 0.5 }}>/</span>
        <Link href="/dashboard/skills" style={{ color: "#5ab8d0", textDecoration: "none" }}>Skills</Link>
        <span style={{ margin: "0 8px", opacity: 0.5 }}>/</span>
        <span>Skill Composer</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div>
          <h1 style={{ fontSize: 22, margin: 0, color: "#e0e8f2" }}>Skill Composer</h1>
          <div style={{ fontSize: 12, color: "#8b9aae", marginTop: 2 }}>
            Chain skills into orchestration flows - generated as NERM script
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={clearChain} style={btnG}>Clear</button>
          <button onClick={deploy} style={btnT}>Deploy Chain</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 12, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          <ChainList
            chain={chain}
            onRemove={removeAt}
            onMove={move}
            onAdd={() => pushToast("Open Skill Library to add - direct add coming in C1.B", "info")}
          />
          <ScriptPreview chain={chain} cfg={cfg} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <MissionConfigPanel cfg={cfg} onChange={(c) => setCfg((prev) => ({ ...prev, ...c }))} />
          <QuickAddPanel skills={quickAddSkills} onAdd={addSkill} />
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 6, zIndex: 120, pointerEvents: "none" }}>
        {toasts.map((t) => {
          const palette = t.kind === "success"
            ? { bg: "rgba(46,125,82,.15)", bd: "rgba(46,125,82,.4)", fg: "#6ee7a4" }
            : t.kind === "error"
            ? { bg: "rgba(185,28,28,.15)", bd: "rgba(185,28,28,.4)", fg: "#fca5a5" }
            : { bg: "rgba(79,152,163,.15)", bd: "rgba(79,152,163,.4)", fg: "#5ab8d0" };
          return (
            <div key={t.id} style={{ background: palette.bg, border: "1px solid " + palette.bd, color: palette.fg, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, backdropFilter: "blur(8px)", boxShadow: "0 8px 24px rgba(0,0,0,.3)", pointerEvents: "all" }}>
              {t.msg}
            </div>
          );
        })}
      </div>
    </main>
  );
}

const btnBase: React.CSSProperties = { padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none" };
const btnG: React.CSSProperties = { ...btnBase, background: "rgba(255,255,255,.06)", border: "1px solid #1a1f26", color: "#cfd8e3" };
const btnT: React.CSSProperties = { ...btnBase, background: "linear-gradient(135deg,#3b5d8d,#4f98a3)", color: "#fff" };
