"use client";

export interface MissionConfig {
  name: string;
  robot: string;
  priority: "Normal" | "High" | "Critical";
  nermLearn: boolean;
  collisionAvoid: boolean;
}

interface Props {
  cfg: MissionConfig;
  onChange: (c: Partial<MissionConfig>) => void;
}

const ROBOTS = ["ATLAS-01 Aerial (DJI M30)", "GND-01 Ground (Unitree B2)", "AMR-D200 Ground", "HUMA-01 Humanoid (H1)"];

export default function MissionConfigPanel({ cfg, onChange }: Props) {
  return (
    <section style={{ background: "linear-gradient(180deg, rgba(218,226,236,.07) 0%, rgba(202,213,224,.03) 100%)", border: "1px solid #1a1f26", borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#8b9aae", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>
        Mission Config
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Field label="Mission Name">
          <input value={cfg.name} onChange={(e) => onChange({ name: e.target.value })} style={input} />
        </Field>

        <Field label="Assign Robot">
          <select value={cfg.robot} onChange={(e) => onChange({ robot: e.target.value })} style={input}>
            {ROBOTS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </Field>

        <Field label="Priority">
          <select value={cfg.priority} onChange={(e) => onChange({ priority: e.target.value as MissionConfig["priority"] })} style={input}>
            <option>Normal</option>
            <option>High</option>
            <option>Critical</option>
          </select>
        </Field>

        <Toggle label="NERM Auto-Learning" value={cfg.nermLearn} onChange={(v) => onChange({ nermLearn: v })} />
        <Toggle label="Collision Avoidance" value={cfg.collisionAvoid} onChange={(v) => onChange({ collisionAvoid: v })} />
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 10.5, color: "#8b9aae", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
      <span style={{ fontSize: 12, color: "#cfd8e3" }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 36, height: 20, borderRadius: 999,
          background: value ? "linear-gradient(90deg,#2e6b74,#4f98a3)" : "rgba(90,122,168,.25)",
          border: "1px solid " + (value ? "transparent" : "rgba(90,122,168,.3)"),
          position: "relative",
          cursor: "pointer",
          transition: "background .18s",
          flexShrink: 0,
        }}
        aria-pressed={value}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: value ? 19 : 2,
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

const input: React.CSSProperties = {
  height: 32,
  borderRadius: 6,
  background: "rgba(255,255,255,.04)",
  border: "1px solid #1a1f26",
  color: "#e0e8f2",
  fontSize: 12.5,
  padding: "0 9px",
  width: "100%",
};
