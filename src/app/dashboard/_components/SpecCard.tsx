"use client";

import { CSSProperties, ReactNode } from "react";

export function Card({ title, children, style }: { title?: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <section
      style={{
        background:
          "linear-gradient(180deg, rgba(218,226,236,.07) 0%, rgba(202,213,224,.04) 100%)",
        border: "1px solid #1a1f26",
        borderRadius: 12,
        padding: 14,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.04)",
        ...style,
      }}
    >
      {title && (
        <h3
          style={{
            margin: "0 0 10px",
            fontSize: 13,
            fontWeight: 700,
            color: "#e0e8f2",
            letterSpacing: ".02em",
          }}
        >
          {title}
        </h3>
      )}
      {children}
    </section>
  );
}

export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "5px 9px",
        borderRadius: 6,
        fontSize: 12,
      }}
    >
      <span style={{ color: "#8b9aae", fontWeight: 500 }}>{label}</span>
      <span
        style={{
          fontWeight: 600,
          color: "#e0e8f2",
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: 11.5,
        }}
      >
        {children}
      </span>
    </div>
  );
}

export type BadgeKind = "ok" | "warn" | "danger" | "info";

export function Badge({ kind = "info", children }: { kind?: BadgeKind; children: ReactNode }) {
  const palette: Record<BadgeKind, { bg: string; fg: string; bd: string }> = {
    ok:     { bg: "rgba(46,125,82,.14)",  fg: "#6ee7a4", bd: "rgba(46,125,82,.3)"  },
    warn:   { bg: "rgba(180,83,9,.14)",   fg: "#fcd34d", bd: "rgba(180,83,9,.3)"   },
    danger: { bg: "rgba(185,28,28,.14)",  fg: "#fca5a5", bd: "rgba(185,28,28,.3)"  },
    info:   { bg: "rgba(79,152,163,.14)", fg: "#5ab8d0", bd: "rgba(79,152,163,.3)" },
  };
  const p = palette[kind];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 7px",
        borderRadius: 999,
        fontSize: 10.5,
        fontWeight: 600,
        background: p.bg,
        color: p.fg,
        border: `1px solid ${p.bd}`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function ProgressBar({ pct, color = "#4f98a3" }: { pct: number; color?: string }) {
  return (
    <div
      style={{
        height: 5,
        background: "rgba(79,152,163,.15)",
        borderRadius: 999,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${Math.max(0, Math.min(100, pct))}%`,
          background: color,
          borderRadius: 999,
          transition: "width .3s",
        }}
      />
    </div>
  );
}
