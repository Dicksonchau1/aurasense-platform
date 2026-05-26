"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  SKILLS,
  CATEGORY_META,
  STATUS_META,
  type Skill,
  type SkillCategory,
} from "@/lib/mock/skills";
import SkillDetailDrawer from "./_components/SkillDetailDrawer";
import NewSkillModal from "./_components/NewSkillModal";

type Filter = "all" | SkillCategory;

interface Toast {
  id: number;
  msg: string;
  kind: "info" | "success";
}

export default function SkillsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Skill | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = (msg: string, kind: Toast["kind"] = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, kind }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SKILLS.filter((s) => {
      const catOk = filter === "all" || s.cat === filter;
      if (!catOk) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.desc.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [filter, query]);

  return (
    <main style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 12, color: "#8b9aae" }}>
        <Link href="/dashboard" style={{ color: "#5ab8d0", textDecoration: "none" }}>Dashboard</Link>
        <span style={{ margin: "0 8px", opacity: 0.5 }}>/</span>
        <span>Skill Library</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div>
          <h1 style={{ fontSize: 22, margin: 0, color: "#e0e8f2" }}>Robotic Skill Library</h1>
          <div style={{ fontSize: 12, color: "#8b9aae", marginTop: 2 }}>
            {SKILLS.length} hero skills across {CATEGORY_META.length} categories - NERM-linked
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setModalOpen(true)} style={btnG}>+ New Skill</button>
          <Link href="/dashboard/skill-composer" style={{ ...btnT, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            Compose Chain
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills, tags, robots..."
            style={{
              width: "100%",
              padding: "8px 10px 8px 32px",
              background: "rgba(255,255,255,.04)",
              border: "1px solid #1a1f26",
              borderRadius: 8,
              color: "#e0e8f2",
              fontSize: 12.5,
              outline: "none",
            }}
          />
          <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#6b7a8c", fontSize: 12, pointerEvents: "none" }}>?</span>
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          <Chip
            label={`All (${SKILLS.length})`}
            color="5ab8d0"
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          {CATEGORY_META.map((c) => {
            const count = SKILLS.filter((s) => s.cat === c.key).length;
            return (
              <Chip
                key={c.key}
                label={`${c.label} (${count})`}
                color={c.color}
                active={filter === c.key}
                onClick={() => setFilter(c.key)}
              />
            );
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#6b7a8c", fontSize: 12, border: "1px dashed #1a1f26", borderRadius: 12 }}>
          No skills match your search.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {visible.map((s) => (
            <SkillCard key={s.id} s={s} onOpen={() => setActive(s)} />
          ))}
        </div>
      )}

      <SkillDetailDrawer
        skill={active}
        onClose={() => setActive(null)}
        onAddToChain={(id) => pushToast("Added " + id + " to chain", "success")}
      />

      <NewSkillModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={(d) => pushToast("Created skill: " + d.name, "success")}
      />

      {/* Toast layer */}
      <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 6, zIndex: 120, pointerEvents: "none" }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              background: t.kind === "success" ? "rgba(46,125,82,.15)" : "rgba(79,152,163,.15)",
              border: "1px solid " + (t.kind === "success" ? "rgba(46,125,82,.4)" : "rgba(79,152,163,.4)"),
              color: t.kind === "success" ? "#6ee7a4" : "#5ab8d0",
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 500,
              backdropFilter: "blur(8px)",
              boxShadow: "0 8px 24px rgba(0,0,0,.3)",
              pointerEvents: "all",
            }}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </main>
  );
}

function Chip({ label, color, active, onClick }: { label: string; color: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 12px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        cursor: "pointer",
        border: "1px solid " + (active ? "#" + color : "#1a1f26"),
        background: active ? "#" + color + "22" : "rgba(255,255,255,.04)",
        color: active ? "#" + color : "#8b9aae",
        transition: "all .14s",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

function SkillCard({ s, onOpen }: { s: Skill; onOpen: () => void }) {
  const cat = CATEGORY_META.find((c) => c.key === s.cat);
  const catColor = cat ? cat.color : "5ab8d0";
  const status = STATUS_META[s.status];

  return (
    <div
      onClick={onOpen}
      style={{
        background: "linear-gradient(180deg, rgba(218,226,236,.07) 0%, rgba(202,213,224,.03) 100%)",
        border: "1px solid #1a1f26",
        borderRadius: 12,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 9,
        cursor: "pointer",
        transition: "transform .14s, box-shadow .14s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 9, background: "#" + s.color + "22", border: "1px solid #" + s.color + "44", color: "#" + s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, flexShrink: 0, fontFamily: "ui-monospace, monospace" }}>
          {s.name[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#e0e8f2" }}>{s.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
            <span style={{ fontSize: 9.5, fontWeight: 700, padding: "1px 7px", borderRadius: 999, background: "#" + catColor + "22", color: "#" + catColor, border: "1px solid #" + catColor + "44", textTransform: "uppercase", letterSpacing: ".06em" }}>
              {s.cat}
            </span>
            <span style={{ fontSize: 9.5, color: "#6b7a8c", fontFamily: "ui-monospace, monospace" }}>{s.ver}</span>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 11.5, color: "#8b9aae", lineHeight: 1.5, minHeight: 50 }}>
        {s.desc}
      </div>

      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {s.tags.slice(0, 4).map((t) => (
          <span key={t} style={{ fontSize: 10, padding: "1px 7px", borderRadius: 999, background: "rgba(255,255,255,.04)", color: "#8b9aae", border: "1px solid #1a1f26" }}>
            {t}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 9, borderTop: "1px solid #1a1f26" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#" + status.pillColor, boxShadow: "0 0 5px #" + status.pillColor }} />
          <span style={{ color: "#cfd8e3" }}>{status.label}</span>
        </div>
        <span style={{ fontSize: 9.5, color: "#6b7a8c", fontFamily: "ui-monospace, monospace" }}>
          STDP {s.stdpWeight.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

const btnBase: React.CSSProperties = { padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none" };
const btnG: React.CSSProperties = { ...btnBase, background: "rgba(255,255,255,.06)", border: "1px solid #1a1f26", color: "#cfd8e3" };
const btnT: React.CSSProperties = { ...btnBase, background: "linear-gradient(135deg,#3b5d8d,#4f98a3)", color: "#fff" };
