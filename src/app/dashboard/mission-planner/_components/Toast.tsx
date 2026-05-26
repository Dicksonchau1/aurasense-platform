"use client";

import { useMission } from "@/lib/mission/context";

export default function Toast() {
  const m = useMission();
  return (
    <div style={{ position: "fixed", bottom: 14, right: 14, zIndex: 9999, display: "flex", flexDirection: "column", gap: 5, pointerEvents: "none" }}>
      {m.toasts.map((t) => {
        const palette = t.kind === "success"
          ? { bg: "rgba(34,197,94,.14)", border: "rgba(34,197,94,.35)", color: "#6ee7a4" }
          : t.kind === "warn"
          ? { bg: "rgba(245,158,11,.14)", border: "rgba(245,158,11,.35)", color: "#fcd34d" }
          : t.kind === "danger"
          ? { bg: "rgba(239,68,68,.14)", border: "rgba(239,68,68,.35)", color: "#fca5a5" }
          : { bg: "rgba(8,145,178,.18)", border: "rgba(8,145,178,.35)", color: "#7dd3e8" };
        return (
          <div
            key={t.id}
            onClick={() => m.dismissToast(t.id)}
            style={{ padding: "8px 13px", borderRadius: 8, fontSize: 11.5, fontWeight: 500, display: "flex", alignItems: "center", gap: 7, backdropFilter: "blur(14px)", boxShadow: "0 4px 16px rgba(0,0,0,.35)", pointerEvents: "all", whiteSpace: "nowrap", background: palette.bg, border: "1px solid " + palette.border, color: palette.color, cursor: "pointer" }}
          >
            {t.msg}
          </div>
        );
      })}
    </div>
  );
}
