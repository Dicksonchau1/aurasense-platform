// Skills Library — capability registry for drone + humanoid agents.
// Plain server component (no client interactivity yet); pages can be made
// interactive later by adding "use client" + a client child.

type SkillStatus = "ready" | "training" | "deprecated";
type SkillTier = "core" | "pro" | "enterprise";

interface Skill {
  id: string;
  name: string;
  domain: "drone" | "humanoid" | "perception" | "planning";
  status: SkillStatus;
  tier: SkillTier;
  version: string;
  successRate: number; // 0..1
  lastTrained: string; // ISO date
  description: string;
}

const SKILLS: Skill[] = [
  {
    id: "sk.fly.waypoint",
    name: "Waypoint Navigation",
    domain: "drone",
    status: "ready",
    tier: "core",
    version: "1.4.2",
    successRate: 0.982,
    lastTrained: "2026-05-21",
    description: "GPS + visual-inertial waypoint following with wind correction.",
  },
  {
    id: "sk.fly.return-home",
    name: "Return-to-Home",
    domain: "drone",
    status: "ready",
    tier: "core",
    version: "1.2.0",
    successRate: 0.998,
    lastTrained: "2026-05-19",
    description: "Auto-RTH on link loss, low battery, or geofence breach.",
  },
  {
    id: "sk.perc.lidar-scan",
    name: "LiDAR Volumetric Scan",
    domain: "perception",
    status: "ready",
    tier: "pro",
    version: "0.9.7",
    successRate: 0.94,
    lastTrained: "2026-05-23",
    description: "Sub-cm structural scan with mesh-from-point-cloud reconstruction.",
  },
  {
    id: "sk.perc.crack-detect",
    name: "Crack Detection",
    domain: "perception",
    status: "training",
    tier: "pro",
    version: "0.6.1",
    successRate: 0.87,
    lastTrained: "2026-05-25",
    description: "CV model for concrete crack classification with severity grading.",
  },
  {
    id: "sk.plan.coverage",
    name: "Coverage Planning",
    domain: "planning",
    status: "ready",
    tier: "pro",
    version: "1.1.0",
    successRate: 0.96,
    lastTrained: "2026-05-18",
    description: "Optimal sweep paths for inspection of irregular structures.",
  },
  {
    id: "sk.hum.tendon-grasp",
    name: "Tendon-Driven Grasp",
    domain: "humanoid",
    status: "training",
    tier: "enterprise",
    version: "0.3.2",
    successRate: 0.71,
    lastTrained: "2026-05-26",
    description: "Compliant grasp via cable-tendon actuation with force feedback.",
  },
  {
    id: "sk.hum.handover",
    name: "Bimanual Handover",
    domain: "humanoid",
    status: "training",
    tier: "enterprise",
    version: "0.2.0",
    successRate: 0.64,
    lastTrained: "2026-05-26",
    description: "Object handover between hands with online contact-force planning.",
  },
  {
    id: "sk.plan.deconflict",
    name: "Fleet Deconfliction",
    domain: "planning",
    status: "ready",
    tier: "enterprise",
    version: "1.0.4",
    successRate: 0.989,
    lastTrained: "2026-05-15",
    description: "Multi-agent collision-free trajectory negotiation in shared airspace.",
  },
];

function pct(x: number) {
  return `${(x * 100).toFixed(1)}%`;
}

function StatusBadge({ s }: { s: SkillStatus }) {
  const color =
    s === "ready" ? "#22c55e" : s === "training" ? "#f59e0b" : "#6b7280";
  return (
    <span
      style={{
        fontSize: 11,
        padding: "2px 8px",
        borderRadius: 999,
        background: "#1a1f26",
        color,
        border: `1px solid ${color}33`,
      }}
    >
      {s}
    </span>
  );
}

export default function SkillsPage() {
  const total = SKILLS.length;
  const ready = SKILLS.filter((s) => s.status === "ready").length;
  const training = SKILLS.filter((s) => s.status === "training").length;
  const avg =
    SKILLS.reduce((sum, s) => sum + s.successRate, 0) / Math.max(1, SKILLS.length);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <header>
        <h1 style={{ fontSize: 22, margin: 0 }}>Skills Library</h1>
        <p style={{ opacity: 0.6, margin: "4px 0 0", fontSize: 13 }}>
          Capability registry for drone, humanoid, perception, and planning agents.
        </p>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        {[
          { k: "Total skills", v: total },
          { k: "Ready", v: ready },
          { k: "In training", v: training },
          { k: "Avg success", v: pct(avg) },
        ].map((c) => (
          <div
            key={c.k}
            style={{
              padding: 12,
              border: "1px solid #1a1f26",
              borderRadius: 8,
              background: "#0e1217",
            }}
          >
            <div style={{ fontSize: 11, opacity: 0.6 }}>{c.k}</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{c.v}</div>
          </div>
        ))}
      </section>

      <section
        style={{
          border: "1px solid #1a1f26",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ background: "#11151a", textAlign: "left" }}>
            <tr>
              <th style={{ padding: "8px 12px" }}>Skill</th>
              <th style={{ padding: "8px 12px" }}>Domain</th>
              <th style={{ padding: "8px 12px" }}>Tier</th>
              <th style={{ padding: "8px 12px" }}>Status</th>
              <th style={{ padding: "8px 12px" }}>Version</th>
              <th style={{ padding: "8px 12px" }}>Success</th>
              <th style={{ padding: "8px 12px" }}>Last trained</th>
            </tr>
          </thead>
          <tbody>
            {SKILLS.map((s) => (
              <tr key={s.id} style={{ borderTop: "1px solid #1a1f26" }}>
                <td style={{ padding: "8px 12px" }}>
                  <div style={{ fontWeight: 600 }}>{s.name}</div>
                  <div style={{ opacity: 0.5, fontSize: 11 }}>{s.id}</div>
                  <div style={{ opacity: 0.7, fontSize: 12, marginTop: 4 }}>
                    {s.description}
                  </div>
                </td>
                <td style={{ padding: "8px 12px", textTransform: "capitalize" }}>
                  {s.domain}
                </td>
                <td style={{ padding: "8px 12px", textTransform: "capitalize" }}>
                  {s.tier}
                </td>
                <td style={{ padding: "8px 12px" }}>
                  <StatusBadge s={s.status} />
                </td>
                <td style={{ padding: "8px 12px", fontFamily: "monospace" }}>
                  v{s.version}
                </td>
                <td style={{ padding: "8px 12px" }}>{pct(s.successRate)}</td>
                <td style={{ padding: "8px 12px", opacity: 0.7 }}>{s.lastTrained}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}