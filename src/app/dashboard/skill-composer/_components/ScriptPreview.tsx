"use client";

import type { Skill } from "@/lib/mock/skills";
import type { MissionConfig } from "./MissionConfigPanel";

interface Item { uid: number; skill: Skill; }

export default function ScriptPreview({ chain, cfg }: { chain: Item[]; cfg: MissionConfig }) {
  return (
    <section style={{ background: "#040d1a", border: "1px solid #1a1f26", borderRadius: 12, padding: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#8b9aae", textTransform: "uppercase", letterSpacing: ".06em" }}>
          Generated NERM Script
        </div>
        <span style={{ fontSize: 10, color: "#5ab8d0", fontFamily: "ui-monospace, monospace" }}>
          {chain.length} steps
        </span>
      </div>

      <pre
        style={{
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: 11,
          color: "#cfd8e3",
          margin: 0,
          lineHeight: 1.65,
          whiteSpace: "pre",
          overflowX: "auto",
        }}
      >
        <span style={{ color: "#5ab8d0" }}>mission</span>: <span style={{ color: "#6ee7a4" }}>{'"' + cfg.name + '"'}</span>,{"\n"}
        <span style={{ color: "#5ab8d0" }}>robot</span>: <span style={{ color: "#6ee7a4" }}>{'"' + cfg.robot + '"'}</span>,{"\n"}
        <span style={{ color: "#5ab8d0" }}>priority</span>: <span style={{ color: "#6ee7a4" }}>{'"' + cfg.priority + '"'}</span>,{"\n"}
        <span style={{ color: "#5ab8d0" }}>nerm</span>: {"{"}{"\n"}
        {"  "}<span style={{ color: "#5ab8d0" }}>auto_learn</span>: <span style={{ color: "#fcd34d" }}>{String(cfg.nermLearn)}</span>,{"\n"}
        {"  "}<span style={{ color: "#5ab8d0" }}>collision_avoid</span>: <span style={{ color: "#fcd34d" }}>{String(cfg.collisionAvoid)}</span>{"\n"}
        {"}"},{"\n"}
        <span style={{ color: "#5ab8d0" }}>skills</span>: [{"\n"}
        {chain.length === 0 ? (
          <span style={{ color: "#6b7a8c" }}>{"  // empty - add at least one skill"}</span>
        ) : (
          chain.map((it, i) => (
            <span key={it.uid}>
              {"  "}{"{"} <span style={{ color: "#6b7a8c" }}>{"// step " + (i + 1)}</span>{"\n"}
              {"    "}<span style={{ color: "#5ab8d0" }}>id</span>: <span style={{ color: "#6ee7a4" }}>{'"' + it.skill.id + '"'}</span>,{"\n"}
              {"    "}<span style={{ color: "#5ab8d0" }}>cat</span>: <span style={{ color: "#6ee7a4" }}>{'"' + it.skill.cat + '"'}</span>,{"\n"}
              {"    "}<span style={{ color: "#5ab8d0" }}>stdp</span>: <span style={{ color: "#fcd34d" }}>{it.skill.stdpWeight.toFixed(2)}</span>{"\n"}
              {"  "}{"}"}{i === chain.length - 1 ? "" : ","}{"\n"}
            </span>
          ))
        )}
        {"]"}
      </pre>
    </section>
  );
}
