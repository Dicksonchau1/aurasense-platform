"use client";

import { CSSProperties } from "react";

export interface SubNavItem {
  id: string;
  label: string;
}

interface Props {
  title: string;
  items: SubNavItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function SubNav({ title, items, activeId, onSelect }: Props) {
  return (
    <aside style={wrap}>
      <div style={head}>{title}</div>
      {items.map((it) => {
        const active = it.id === activeId;
        return (
          <button
            key={it.id}
            onClick={() => onSelect(it.id)}
            style={{ ...btn, ...(active ? btnActive : null) }}
          >
            {it.label}
          </button>
        );
      })}
    </aside>
  );
}

const wrap: CSSProperties = {
  width: 190,
  flexShrink: 0,
  padding: 7,
  display: "flex",
  flexDirection: "column",
  gap: 3,
  background: "rgba(8,12,18,.35)",
  border: "1px solid #1a1f26",
  borderRadius: 10,
  height: "fit-content",
};

const head: CSSProperties = {
  fontSize: 9,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: ".12em",
  color: "#6b7a8c",
  padding: "6px 9px 4px",
};

const btn: CSSProperties = {
  height: 33,
  border: "none",
  background: "transparent",
  borderRadius: 6,
  fontSize: 12.5,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 7,
  padding: "0 9px",
  color: "#cfd8e3",
  transition: "background .14s",
  width: "100%",
  textAlign: "left",
};

const btnActive: CSSProperties = {
  background: "rgba(79,152,163,.16)",
  fontWeight: 700,
  color: "#6ec0cf",
  boxShadow: "inset 2px 0 0 #4f98a3",
};
