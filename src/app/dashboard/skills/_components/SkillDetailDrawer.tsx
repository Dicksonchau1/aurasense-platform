"use client";

import { useState, useEffect } from "react";
import {
  CATEGORY_META,
  STATUS_META,
  type Skill,
  type SkillParam,
} from "@/lib/mock/skills";

interface Props {
  skill: Skill | null;
  onClose: () => void;
  onAddToChain: (id: string) => void;
}

export default function SkillDetailDrawer({ skill, onClose, onAddToChain }: Props) {
  const [params, setParams] = useState<SkillParam[]>([]);

  useEffect(() => {
    if (skill) setParams(skill.params.map((p) => ({ ...p })));
  }, [skill]);

  if (!skill) return null;

  const cat = CATEGORY_META.find((c) => c.key === skill.cat);
  const catColor = cat ? cat.color : "5ab8d0";
  const status = STATUS_META[skill.status];

  const updateParam = (key: string, val: number | string | boolean) => {
    setParams((arr) =>
      arr.map((p) => (p.key === key ? ({ ...p, val } as SkillParam) : p)),
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.5)",
          backdropFilter: "blur(2px)",
          zIndex: 100,
        }}
      />

      {/* Drawer */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: 440,
          maxWidth: "95vw",
          height: "100vh",
          background: "#0f1419",
          borderLeft: "1px solid #1a1f26",
          boxShadow: "-20px 0 48px rgba(0,0,0,.5)",
          zIndex: 101,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 18px",
            borderBottom: "1px solid #1a1f26",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#" + skill.color + "22",
              border: "1px solid #" + skill.color + "44",
              color: "#" + skill.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 800,
              fontFamily: "ui-monospace, monospace",
              flexShrink: 0,
            }}
          >
            {skill.name[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#e0e8f2" }}>{skill.name}</div>
            <div style={{ fontSize: 11, color: "#8b9aae", marginTop: 2 }}>
              {skill.cat} - {skill.ver}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              background: "rgba(255,255,255,.04)",
              border: "1px solid #1a1f26",
              color: "#cfd8e3",
              cursor: "pointer",
              fontSize: 14,
            }}
            aria-label="Close"
          >
            x
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
          {/* Description */}
          <Section title="Description">
            <p style={{ fontSize: 12, color: "#cfd8e3", lineHeight: 1.6, margin: 0 }}>
              {skill.desc}
            </p>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 10 }}>
              {skill.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: 10,
                    padding: "1px 7px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,.04)",
                    color: "#8b9aae",
                    border: "1px solid #1a1f26",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </Section>

          {/* Compatible robots */}
          <Section title="Compatible Robots">
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {skill.robots.map((r) => (
                <span
                  key={r}
                  style={{
                    fontSize: 11,
                    padding: "3px 9px",
                    borderRadius: 999,
                    background: "rgba(79,152,163,.08)",
                    color: "#5ab8d0",
                    border: "1px solid rgba(79,152,163,.25)",
                  }}
                >
                  {r}
                </span>
              ))}
            </div>
          </Section>

          {/* Parameters */}
          <Section title="Parameters">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {params.map((p) => <ParamEditor key={p.key} param={p} onChange={updateParam} />)}
            </div>
          </Section>

          {/* NERM script preview */}
          <Section title="NERM Script Preview">
            <pre
              style={{
                background: "#040d1a",
                border: "1px solid #1a1f26",
                borderRadius: 8,
                padding: 12,
                fontFamily: "ui-monospace, Menlo, monospace",
                fontSize: 11,
                color: "#cfd8e3",
                margin: 0,
                overflow: "auto",
              }}
            >
              <span style={{ color: "#5ab8d0" }}>skill</span>: <span style={{ color: "#6ee7a4" }}>{'"' + skill.id + '"'}</span>,{"\n"}
              <span style={{ color: "#5ab8d0" }}>category</span>: <span style={{ color: "#6ee7a4" }}>{'"' + skill.cat + '"'}</span>,{"\n"}
              <span style={{ color: "#5ab8d0" }}>nerm_context</span>: <span style={{ color: "#fcd34d" }}>{String(skill.nermContext)}</span>,{"\n"}
              <span style={{ color: "#5ab8d0" }}>stdp_weight</span>: <span style={{ color: "#fcd34d" }}>{skill.stdpWeight.toFixed(2)}</span>,{"\n"}
              <span style={{ color: "#5ab8d0" }}>on_complete</span>: <span style={{ color: "#6ee7a4" }}>{'"emit_reward(+1)"'}</span>,{"\n"}
              <span style={{ color: "#6b7a8c" }}>{"  // params auto-injected at deploy"}</span>
            </pre>
          </Section>

          {/* Status row */}
          <Section title="Status">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#" + status.pillColor,
                  boxShadow: "0 0 8px #" + status.pillColor,
                }}
              />
              <span style={{ fontSize: 12, color: "#e0e8f2", fontWeight: 600 }}>{status.label}</span>
              <span style={{ fontSize: 11, color: "#6b7a8c", marginLeft: "auto", fontFamily: "ui-monospace, monospace" }}>
                cat tint #{catColor}
              </span>
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: 14,
            borderTop: "1px solid #1a1f26",
            flexShrink: 0,
          }}
        >
          <button onClick={onClose} style={btnG}>Cancel</button>
          <button
            onClick={() => { onAddToChain(skill.id); onClose(); }}
            style={btnT}
          >
            + Add to Chain
          </button>
        </div>
      </aside>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: ".08em",
          color: "#6b7a8c",
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function ParamEditor({
  param, onChange,
}: {
  param: SkillParam;
  onChange: (key: string, val: number | string | boolean) => void;
}) {
  if (param.type === "range") {
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, marginBottom: 4 }}>
          <span style={{ color: "#8b9aae", fontWeight: 600 }}>{param.label}</span>
          <span style={{ color: "#5ab8d0", fontFamily: "ui-monospace, monospace" }}>{param.val}{param.suffix ?? ""}</span>
        </div>
        <input
          type="range"
          min={param.min}
          max={param.max}
          value={param.val}
          onChange={(e) => onChange(param.key, parseFloat(e.target.value))}
          style={{ width: "100%", accentColor: "#4f98a3" }}
        />
      </div>
    );  }
  if (param.type === "toggle") {
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#cfd8e3", fontWeight: 500 }}>{param.label}</span>
        <button
          onClick={() => onChange(param.key, !param.val)}
          style={{
            width: 36,
            height: 20,
            borderRadius: 999,
            background: param.val ? "linear-gradient(90deg,#2e6b74,#4f98a3)" : "rgba(90,122,168,.25)",
            border: "1px solid " + (param.val ? "transparent" : "rgba(90,122,168,.3)"),
            position: "relative",
            cursor: "pointer",
            transition: "background .18s",
            flexShrink: 0,
          }}
          aria-pressed={param.val}
        >
          <span
            style={{
              position: "absolute",
              top: 2,
              left: param.val ? 19 : 2,
              width: 13,
              height: 13,
              borderRadius: "50%",
              background: "#fff",
              transition: "left .18s",
              boxShadow: "0 1px 3px rgba(0,0,0,.25)",
            }}
          />
        </button>
      </div>
    );
  }
  if (param.type === "select") {
    return (
      <div>
        <div style={{ fontSize: 10.5, color: "#8b9aae", fontWeight: 600, marginBottom: 4 }}>{param.label}</div>
        <select
          value={param.val}
          onChange={(e) => onChange(param.key, e.target.value)}
          style={{
            width: "100%",
            height: 30,
            borderRadius: 6,
            background: "rgba(255,255,255,.04)",
            border: "1px solid #1a1f26",
            color: "#e0e8f2",
            fontSize: 12,
            padding: "0 9px",
          }}
        >
          {param.opts.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
    );
  }
  // text
  return (
    <div>
      <div style={{ fontSize: 10.5, color: "#8b9aae", fontWeight: 600, marginBottom: 4 }}>{param.label}</div>
      <input
        type="text"
        value={param.val}
        onChange={(e) => onChange(param.key, e.target.value)}
        style={{
          width: "100%",
          height: 30,
          borderRadius: 6,
          background: "rgba(255,255,255,.04)",
          border: "1px solid #1a1f26",
          color: "#e0e8f2",
          fontSize: 12,
          padding: "0 9px",
        }}
      />
    </div>
  );
}

const btnBase: React.CSSProperties = {
  flex: 1,
  height: 32,
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  border: "none",
};
const btnG: React.CSSProperties = { ...btnBase, background: "rgba(255,255,255,.06)", border: "1px solid #1a1f26", color: "#cfd8e3" };
const btnT: React.CSSProperties = { ...btnBase, background: "linear-gradient(135deg,#3b5d8d,#4f98a3)", color: "#fff" };
