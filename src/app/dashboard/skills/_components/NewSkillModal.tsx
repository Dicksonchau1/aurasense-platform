"use client";

import { useState } from "react";
import { CATEGORY_META, type SkillCategory } from "@/lib/mock/skills";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; cat: SkillCategory; desc: string; robots: string }) => void;
}

export default function NewSkillModal({ open, onClose, onCreate }: Props) {
  const [name, setName]   = useState("");
  const [cat, setCat]     = useState<SkillCategory>("aerial");
  const [desc, setDesc]   = useState("");
  const [robots, setRobots] = useState("");

  if (!open) return null;

  const submit = () => {
    if (!name.trim()) return;
    onCreate({ name: name.trim(), cat, desc: desc.trim(), robots: robots.trim() });
    setName(""); setDesc(""); setRobots("");
    onClose();
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.55)",
          backdropFilter: "blur(2px)",
          zIndex: 110,
        }}
      />
      <div
        role="dialog"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(560px, 95vw)",
          maxHeight: "90vh",
          background: "#0f1419",
          border: "1px solid #1a1f26",
          borderRadius: 14,
          boxShadow: "0 20px 60px rgba(0,0,0,.6)",
          zIndex: 111,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid #1a1f26" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e0e8f2" }}>Create New Skill</div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(255,255,255,.04)", border: "1px solid #1a1f26", color: "#cfd8e3", cursor: "pointer", fontSize: 14 }} aria-label="Close">
            x
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Skill Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. door.open.push"
              style={inputStyle}
            />
          </Field>

          <Field label="Category">
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value as SkillCategory)}
              style={inputStyle}
            >
              {CATEGORY_META.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Description">
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              placeholder="What does this skill do?"
              style={{ ...inputStyle, height: "auto", padding: 9, resize: "vertical", fontFamily: "inherit" }}
            />
          </Field>

          <Field label="Compatible Robots (comma separated)">
            <input
              value={robots}
              onChange={(e) => setRobots(e.target.value)}
              placeholder="ground, humanoid"
              style={inputStyle}
            />
          </Field>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: 14, borderTop: "1px solid #1a1f26" }}>
          <button onClick={onClose} style={btnG}>Cancel</button>
          <button onClick={submit} disabled={!name.trim()} style={{ ...btnT, opacity: name.trim() ? 1 : 0.5, cursor: name.trim() ? "pointer" : "not-allowed" }}>
            Create Skill
          </button>
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontSize: 10.5, color: "#8b9aae", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  height: 32,
  borderRadius: 6,
  background: "rgba(255,255,255,.04)",
  border: "1px solid #1a1f26",
  color: "#e0e8f2",
  fontSize: 12.5,
  padding: "0 9px",
  width: "100%",
};

const btnBase: React.CSSProperties = { height: 32, padding: "0 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none" };
const btnG: React.CSSProperties = { ...btnBase, background: "rgba(255,255,255,.06)", border: "1px solid #1a1f26", color: "#cfd8e3" };
const btnT: React.CSSProperties = { ...btnBase, background: "linear-gradient(135deg,#3b5d8d,#4f98a3)", color: "#fff" };
