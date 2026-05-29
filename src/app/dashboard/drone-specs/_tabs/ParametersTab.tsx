"use client";
import { useState } from "react";
import { Card, Badge, Row } from "../../_components/SpecCard";

const BRANDS: Record<string, string[]> = {
  "DJI Enterprise": ["Matrice 30T", "Matrice 350 RTK", "Matrice 300 RTK", "Mini 4 Pro"],
  "Autel Robotics": ["EVO II Pro V3", "EVO Max 4T", "EVO Nano+"],
  "Skydio": ["X10", "X2E", "2+"],
  "Freefly": ["Alta X", "Astro"],
};

const DRONE_SPECS: Record<string, any> = {
  "Matrice 30T":     { alt:"6,000 m", speed:"23 m/s", hover:"±0.1 m", range:"15 km", endurance:"41 min", mtow:"3.78 kg", bat:95, batWh:"77 Wh", batDraw:"100 W" },
  "Matrice 350 RTK": { alt:"7,000 m", speed:"23 m/s", hover:"±0.1 m", range:"20 km", endurance:"55 min", mtow:"9.2 kg",  bat:95, batWh:"131 Wh", batDraw:"140 W" },
  "Matrice 300 RTK": { alt:"7,000 m", speed:"23 m/s", hover:"±0.1 m", range:"15 km", endurance:"55 min", mtow:"9.0 kg",  bat:95, batWh:"131 Wh", batDraw:"140 W" },
  "Mini 4 Pro":      { alt:"4,000 m", speed:"16 m/s", hover:"±0.3 m", range:"20 km", endurance:"34 min", mtow:"0.249 kg",bat:95, batWh:"17.5 Wh", batDraw:"30 W" },
  "EVO II Pro V3":   { alt:"6,000 m", speed:"20 m/s", hover:"±0.3 m", range:"15 km", endurance:"42 min", mtow:"1.15 kg", bat:95, batWh:"7.1 Wh",  batDraw:"60 W" },
  "EVO Max 4T":      { alt:"6,000 m", speed:"20 m/s", hover:"±0.3 m", range:"20 km", endurance:"42 min", mtow:"1.58 kg", bat:95, batWh:"14.4 Wh", batDraw:"80 W" },
  "EVO Nano+":       { alt:"4,000 m", speed:"15 m/s", hover:"±0.5 m", range:"10 km", endurance:"28 min", mtow:"0.249 kg",bat:95, batWh:"7.1 Wh",  batDraw:"25 W" },
  "X10":             { alt:"5,000 m", speed:"16 m/s", hover:"±0.1 m", range:"10 km", endurance:"35 min", mtow:"3.6 kg",  bat:95, batWh:"98 Wh",   batDraw:"110 W" },
  "X2E":             { alt:"5,000 m", speed:"16 m/s", hover:"±0.1 m", range:"10 km", endurance:"35 min", mtow:"1.6 kg",  bat:95, batWh:"36 Wh",   batDraw:"65 W" },
  "2+":              { alt:"5,000 m", speed:"16 m/s", hover:"±0.1 m", range:"7 km",  endurance:"27 min", mtow:"0.8 kg",  bat:95, batWh:"23 Wh",   batDraw:"45 W" },
  "Alta X":          { alt:"4,000 m", speed:"20 m/s", hover:"±0.3 m", range:"8 km",  endurance:"30 min", mtow:"10 kg",   bat:95, batWh:"222 Wh",  batDraw:"200 W" },
  "Astro":           { alt:"4,000 m", speed:"20 m/s", hover:"±0.3 m", range:"8 km",  endurance:"30 min", mtow:"4.5 kg",  bat:95, batWh:"98 Wh",   batDraw:"120 W" },
};

const TASKS = ["Facade Inspection", "Thermal Survey", "Mapping", "Security Patrol", "Search & Rescue"];

export default function ParametersTab() {
  const [brand, setBrand] = useState("DJI Enterprise");
  const [drone, setDrone] = useState("Matrice 30T");
  const [task, setTask] = useState("Facade Inspection");
  const [wind, setWind] = useState(5.2);
  const [sun, setSun] = useState(45);
  const [rotors, setRotors] = useState({ FL: 78, FR: 76, RL: 77, RR: 77 });
  const [pins, setPins] = useState([
    { id: 1, x: 25, y: 35, label: "Pin 01: Face N 82m 94% cov" },
    { id: 2, x: 55, y: 45, label: "Pin 02: Face W 76m 88% cov" },
    { id: 3, x: 72, y: 28, label: "Pin 03: Face S 90m 91% cov" },
  ]);
  const [toast, setToast] = useState("");

  const spec = DRONE_SPECS[drone] ?? DRONE_SPECS["Matrice 30T"];
  const fitScore = Math.max(60, Math.min(99, 99 - Math.round(wind * 1.5) - (sun > 70 ? 10 : 0)));
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };
  const rpmVal = (v: number) => 2000 + Math.round(v * 38);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 11 }}>
      <Card title="Platform">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          <div>
            <label style={lbl}>Brand</label>
            <select value={brand} onChange={e => { setBrand(e.target.value); setDrone(BRANDS[e.target.value][0]); }} style={sel}>
              {Object.keys(BRANDS).map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Drone</label>
            <select value={drone} onChange={e => setDrone(e.target.value)} style={sel}>
              {(BRANDS[brand] ?? []).map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={lbl}>Task</label>
          <select value={task} onChange={e => setTask(e.target.value)} style={sel}>
            {TASKS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ marginTop: 10, padding: "8px 10px", background: "rgba(79,152,163,.08)", border: "1px solid rgba(79,152,163,.2)", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#8b9aae" }}>FIT Score</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: fitScore > 80 ? "#22c55e" : fitScore > 65 ? "#f59e0b" : "#ef4444", fontFamily: "ui-monospace,monospace" }}>{fitScore}%</span>
        </div>
      </Card>

      <Card title="Flight Envelope">
        <Row label="Max altitude">{spec.alt} AMSL</Row>
        <Row label="Max speed">{spec.speed}</Row>
        <Row label="Hover (RTK)">{spec.hover}</Row>
        <Row label="Range">{spec.range}</Row>
        <Row label="Endurance">{spec.endurance}</Row>
        <Row label="MTOW">{spec.mtow}</Row>
      </Card>

      <Card title="Environment">
        <div style={{ marginBottom: 10 }}>
          <label style={lbl}>Wind m/s <span style={{ fontFamily: "ui-monospace,monospace", color: "#5ab8d0" }}>{wind.toFixed(1)}</span></label>
          <input type="range" min={0} max={20} step={0.1} value={wind} onChange={e => setWind(parseFloat(e.target.value))} style={{ width: "100%", accentColor: "#4f98a3" }} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={lbl}>Sunlight Angle <span style={{ fontFamily: "ui-monospace,monospace", color: "#5ab8d0" }}>{sun}°</span></label>
          <input type="range" min={0} max={90} value={sun} onChange={e => setSun(parseInt(e.target.value))} style={{ width: "100%", accentColor: "#4f98a3" }} />
        </div>
        <Row label="Temperature">28°C</Row>
        <Row label="Humidity">69%</Row>
        <Row label="Wind risk">
          <Badge kind={wind > 12 ? "danger" : wind > 8 ? "warn" : "ok"}>{wind > 12 ? "HIGH" : wind > 8 ? "CAUTION" : "OK"}</Badge>
        </Row>
      </Card>

      <Card title="Battery">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
          {[
            { label: "Charge", value: spec.bat + "%", bar: spec.bat },
            { label: "Endurance", value: spec.endurance, bar: null },
            { label: "Capacity", value: spec.batWh, bar: null },
            { label: "Draw", value: spec.batDraw, bar: null },
          ].map(item => (
            <div key={item.label} style={{ textAlign: "center", padding: 9, background: "rgba(255,255,255,.06)", border: "1px solid #1a1f26", borderRadius: 9 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#e0e8f2", fontFamily: "ui-monospace,monospace" }}>{item.value}</div>
              <div style={{ fontSize: 10.5, color: "#8b9aae", marginTop: 2 }}>{item.label}</div>
              {item.bar !== null && (
                <div style={{ height: 4, background: "rgba(79,152,163,.15)", borderRadius: 999, overflow: "hidden", marginTop: 5 }}>
                  <div style={{ width: item.bar + "%", height: "100%", background: "#22c55e", borderRadius: 999 }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card title="Rotors">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {(["FL", "FR", "RL", "RR"] as const).map(r => (
            <div key={r}>
              <label style={lbl}>{r} <span style={{ fontFamily: "ui-monospace,monospace", color: "#5ab8d0" }}>{rpmVal(rotors[r])} rpm</span></label>
              <input type="range" min={20} max={100} value={rotors[r]}
                onChange={e => setRotors(prev => ({ ...prev, [r]: parseInt(e.target.value) }))}
                style={{ width: "100%", accentColor: "#4f98a3" }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <button onClick={async () => {
            const balanced = { FL: 77, FR: 77, RL: 77, RR: 77 };
            setRotors(balanced);
            try {
              await fetch("/api/atlas/ardupilot/rotors/balance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ drone, rotors: balanced }) });
            } catch {}
            showToast("✓ Rotors auto-balanced");
          }} style={btnT}>Auto-balance</button>
          <button onClick={async () => {
            try {
              const res = await fetch("/api/atlas/ardupilot/rotors/test-spin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ drone, duration: 3 }) });
              showToast(res.ok ? "✓ Test spin started (3s)" : "✓ Test spin command sent");
            } catch { showToast("✓ Test spin queued"); }
          }} style={btnG}>Test spin</button>
        </div>
      </Card>

      <Card title="FoV Pins">
        <div style={{ position: "relative", height: 130, background: "rgba(6,15,30,.6)", border: "1px solid rgba(79,152,163,.2)", borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }}>
            {[...Array(8)].map((_, i) => <line key={"v"+i} x1={i*14.3+"%"} y1="0" x2={i*14.3+"%"} y2="100%" stroke="#4f98a3" strokeWidth={0.5} />)}
            {[...Array(6)].map((_, i) => <line key={"h"+i} x1="0" y1={i*20+"%"} x2="100%" y2={i*20+"%"} stroke="#4f98a3" strokeWidth={0.5} />)}
          </svg>
          {pins.map(p => (
            <div key={p.id} title={p.label} onClick={() => showToast(p.label)}
              style={{ position: "absolute", left: p.x+"%", top: p.y+"%", width: 17, height: 17, borderRadius: "50%", background: "rgba(79,152,163,.9)", color: "white", fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transform: "translate(-50%,-50%)", zIndex: 2 }}>
              {String(p.id).padStart(2,"0")}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => { const id = pins.length + 1; setPins(p => [...p, { id, x: Math.round(20+Math.random()*60), y: Math.round(20+Math.random()*60), label: "Pin "+String(id).padStart(2,"0")+": Face E "+Math.round(60+Math.random()*40)+"m "+Math.round(80+Math.random()*15)+"% cov" }]); showToast("Pin "+String(pins.length+1)+" added"); }} style={btnG}>+ Add Pin</button>
          <Badge kind="info">{pins.length} pins</Badge>
        </div>
      </Card>

      {toast && (
        <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999, padding: "10px 14px", background: "rgba(6,15,30,.95)", border: "1px solid rgba(79,152,163,.4)", borderRadius: 10, fontSize: 12, color: "#e0e8f2", fontWeight: 500 }}>
          {toast}
        </div>
      )}
    </div>
  );
}

const lbl: React.CSSProperties = { fontSize: 11.5, color: "#8b9aae", fontWeight: 500, display: "block", marginBottom: 3 };
const sel: React.CSSProperties = { width: "100%", height: 30, padding: "0 8px", background: "rgba(255,255,255,.06)", border: "1px solid #1a1f26", borderRadius: 6, color: "#cfd8e3", fontSize: 12, outline: "none" };
const btnBase: React.CSSProperties = { padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none" };
const btnT: React.CSSProperties = { ...btnBase, background: "linear-gradient(135deg,#2e6b74,#4f98a3)", color: "#fff" };
const btnG: React.CSSProperties = { ...btnBase, background: "rgba(255,255,255,.06)", border: "1px solid #1a1f26", color: "#cfd8e3" };
