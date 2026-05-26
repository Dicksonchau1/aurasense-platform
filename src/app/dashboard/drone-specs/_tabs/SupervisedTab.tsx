"use client";

import { Card, Badge } from "../../_components/SpecCard";
import { SUPERVISED } from "@/lib/mock/drone-specs";

export default function SupervisedTab() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
      <Card title="Supervised Actions">
        <p style={{ fontSize: 12, color: "#8b9aae", margin: "0 0 12px" }}>
          All actions require operator confirmation before dispatch. NEPA suggests, you decide.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {SUPERVISED.map((a) => {
            const badgeKind: "ok" | "warn" | "info" =
              a.status === "approved" ? "ok" : a.status === "pending" ? "warn" : "info";
            return (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "10px 12px",
                  background: "rgba(79,152,163,.05)",
                  border: "1px solid #1a1f26",
                  borderRadius: 8,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", color: "#5ab8d0" }}>
                      {a.id}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#e0e8f2" }}>{a.name}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "#8b9aae" }}>{a.detail}</div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Badge kind={badgeKind}>{a.status}</Badge>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button style={btnP}>Approve</button>
                    <button style={btnW}>Deny</button>
                    <button style={btnG}>Detail</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button style={btnP}>Dispatch Approved</button>
          <button style={btnG}>Clear Queue</button>
          <button style={btnG}>Export Log</button>
        </div>
      </Card>
    </div>
  );
}

const btnBase: React.CSSProperties = { padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none" };
const btnP: React.CSSProperties = { ...btnBase, background: "linear-gradient(135deg,#2e6b74,#4f98a3)", color: "#fff" };
const btnW: React.CSSProperties = { ...btnBase, background: "rgba(180,83,9,.14)", border: "1px solid rgba(180,83,9,.3)", color: "#fcd34d" };
const btnG: React.CSSProperties = { ...btnBase, background: "rgba(255,255,255,.06)", border: "1px solid #1a1f26", color: "#cfd8e3" };
