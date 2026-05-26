"use client";

import { CATEGORY_META, type Skill } from "@/lib/mock/skills";

interface Item { uid: number; skill: Skill; }
interface Props {
  chain: Item[];
  onRemove: (uid: number) => void;
  onMove: (uid: number, dir: -1 | 1) => void;
  onAdd: () => void;
}

export default function ChainList({ chain, onRemove, onMove, onAdd }: Props) {
  return (
    <section style={{ background: "linear-gradient(180deg, rgba(218,226,236,.07) 0%, rgba(202,213,224,.03) 100%)", border: "1px solid #1a1f26", borderRadius: 12, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#8b9aae", textTransform: "uppercase", letterSpacing: ".06em" }}>
          Skill Chain ({chain.length})
        </div>
        <button onClick={onAdd} style={{ padding: "5px 12px", borderRadius: 6, background: "rgba(255,255,255,.06)", border: "1px solid #1a1f26", color: "#cfd8e3", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
          + Add Skill
        </button>
      </div>

      {chain.length === 0 ? (
        <div style={{ padding: 32, textAlign: "center", color: "#6b7a8c", fontSize: 12, border: "1px dashed #1a1f26", borderRadius: 8 }}>
          Empty chain. Use Quick Add or open the Skill Library to add steps.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {chain.map((it, i) => {
            const s = it.skill;
            const cat = CATEGORY_META.find((c) => c.key === s.cat);
            const catColor = cat ? cat.color : "5ab8d0";
            return (
              <div key={it.uid} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", background: "#0f1419", border: "1px solid #1a1f26", borderRadius: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#" + catColor + "22", border: "1px solid #" + catColor + "44", color: "#" + catColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, fontFamily: "ui-monospace, monospace", flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "#e0e8f2" }}>{s.name}</div>
                  <div style={{ fontSize: 10.5, color: "#8b9aae", marginTop: 2 }}>
                    {s.cat} - {s.ver} - STDP {s.stdpWeight.toFixed(2)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => onMove(it.uid, -1)} disabled={i === 0} style={iconBtn(i === 0)} title="Move up">^</button>
                  <button onClick={() => onMove(it.uid, 1)} disabled={i === chain.length - 1} style={iconBtn(i === chain.length - 1)} title="Move down">v</button>
                  <button onClick={() => onRemove(it.uid)} style={{ ...iconBtn(false), color: "#fca5a5" }} title="Remove">x</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function iconBtn(disabled: boolean): React.CSSProperties {
  return {
    width: 24,
    height: 24,
    borderRadius: 5,
    background: "rgba(255,255,255,.04)",
    border: "1px solid #1a1f26",
    color: disabled ? "#3a4252" : "#cfd8e3",
    fontSize: 11,
    cursor: disabled ? "not-allowed" : "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };
}
