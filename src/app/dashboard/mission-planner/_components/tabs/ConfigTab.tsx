"use client";

import { useMission } from "@/lib/mission/context";

export default function ConfigTab() {
  const m = useMission();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#8b9aae", textTransform: "uppercase", letterSpacing: ".06em" }}>Mission</div>

      <Field label="Mission Name">
        <input
          type="text"
          value={m.cfg.name}
          onChange={(e) => m.setCfg({ name: e.target.value })}
          style={inputStyle}
        />
      </Field>

      <Field label="Drone">
        <select value={m.cfg.drone} onChange={(e) => m.setCfg({ drone: e.target.value })} style={inputStyle}>
          <option>NERM-A1 (M30T) 87%</option>
          <option>NERM-A2 (M30T) 32%</option>
          <option>NERM-C1 (EVO II) 100%</option>
        </select>
      </Field>

      <Field label="Task">
        <select value={m.cfg.task} onChange={(e) => m.setCfg({ task: e.target.value })} style={inputStyle}>
          <option>Facade Inspection</option>
          <option>Thermal Survey</option>
          <option>LiDAR Mapping</option>
        </select>
      </Field>

      <Slider
        label="Altitude AGL"
        suffix="m"
        min={20}
        max={200}
        value={m.cfg.alt}
        onChange={(v) => m.setCfg({ alt: v })}
      />

      <Slider
        label="Speed"
        suffix=" m/s"
        min={1}
        max={15}
        value={m.cfg.spd}
        onChange={(v) => m.setCfg({ spd: v })}
      />

      <Slider
        label="Standoff"
        suffix=" m"
        min={2}
        max={25}
        value={m.cfg.so}
        onChange={(v) => m.setCfg({ so: v })}
      />

      <div style={{ height: 1, background: "#1a1f26", margin: "4px 0" }} />

      <div style={{ fontSize: 11, fontWeight: 700, color: "#8b9aae", textTransform: "uppercase", letterSpacing: ".06em" }}>HKCAD</div>
      <InfoRow label="Permit"    value="Active"   pill />
      <InfoRow label="Category"  value="Cat B Urban" />
      <InfoRow label="Max alt"   value="120m AMSL" />
      <InfoRow label="Insurance" value="Valid"    pill />
      <InfoRow label="RTK sats"  value="24 (HDOP 0.6)" />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{ fontSize: 10.5, color: "#8b9aae", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</span>
      {children}
    </label>
  );
}

function Slider({
  label, suffix, min, max, value, onChange,
}: { label: string; suffix?: string; min: number; max: number; value: number; onChange: (v: number) => void; }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, marginBottom: 3 }}>
        <span style={{ color: "#8b9aae", textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 600 }}>{label}</span>
        <span style={{ color: "#5ab8d0", fontFamily: "ui-monospace, monospace" }}>{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: "#4f98a3" }}
      />
    </div>
  );
}

function InfoRow({ label, value, pill }: { label: string; value: string; pill?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", fontSize: 11.5 }}>
      <span style={{ color: "#8b9aae" }}>{label}</span>
      {pill ? (
        <span style={{ display: "inline-flex", alignItems: "center", padding: "1px 7px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: "rgba(46,125,82,.14)", color: "#6ee7a4", border: "1px solid rgba(46,125,82,.3)" }}>{value}</span>
      ) : (
        <span style={{ color: "#e0e8f2", fontFamily: "ui-monospace, monospace", fontWeight: 600 }}>{value}</span>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  height: 30,
  borderRadius: 6,
  background: "rgba(255,255,255,.04)",
  border: "1px solid #1a1f26",
  padding: "0 9px",
  color: "#e0e8f2",
  fontSize: 12,
  width: "100%",
};
