"use client";

import { CATEGORY_META, type Skill } from "@/lib/mock/skills";

interface Props {
  skills: Skill[];
  onAdd: (id: string) => void;
}

export default function QuickAddPanel({ skills, onAdd }: Props) {
  return (
    <section style={{ background: "linear-gradient(180deg, rgba(218,226,236,.07) 0%, rgba(202,213,224,.03) 100%)", border: "1px solid #1a1f26", borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#8b9aae", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>
        Quick Add
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {skills.map((s) => {
          const cat = CATEGORY_META.find((c) => c.key === s.cat);
          const catColor = cat ? cat.color : "5ab8d0";
          return (
            <button
              key={s.id}
              onClick={() => onAdd(s.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "8px 10px",
                borderRadius: 7,
                background: "#0f1419",
                border: "1px solid #1a1f26",
                cursor: "pointer",
                textAlign: "left",
                transition: "background .14s, border-color .14s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(79,152,163,.08)";
                e.currentTarget.style.borderColor = "rgba(79,152,163,.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#0f1419";
                e.currentTarget.style.borderColor = "#1a1f26";
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: "#" + s.color + "22",
                  border: "1px solid #" + s.color + "44",
                  color: "#" + s.color,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 800,
                  fontFamily: "ui-monospace, monospace",
                  flexShrink: 0,
                }}
              >
                {s.name[0]}
              </span>
              <span style={{ flex: 1, minWidth: 0, fontSize: 12, color: "#e0e8f2", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {s.name}
              </span>
              <span
                style={{
                  fontSize: 9.5,
                  padding: "1px 6px",
                  borderRadius: 999,
                  background: "#" + catColor + "22",
                  color: "#" + catColor,
                  border: "1px solid #" + catColor + "44",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  fontWeight: 700,
                }}
              >
                {s.cat}
              </span>
              <span style={{ color: "#6b7a8c", fontSize: 14, marginLeft: 4, flexShrink: 0 }}>+</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
