"use client";

import { useState } from "react";
import Link from "next/link";

type TabId = "general" | "nepa" | "integrations" | "notifications" | "apikeys" | "documents";

const TABS: { id: TabId; label: string }[] = [
  { id: "general",       label: "General" },
  { id: "nepa",          label: "NEPA Engine" },
  { id: "integrations",  label: "Integrations" },
  { id: "notifications", label: "Notifications" },
  { id: "apikeys",       label: "API Keys" },
  { id: "documents",     label: "Documents" },
];

interface Integration {
  key: string;
  name: string;
  blurb: string;
  connected: boolean;
}

const INITIAL_INTEGRATIONS: Integration[] = [
  { key: "supabase", name: "Supabase",  blurb: "Postgres + Storage + Auth backbone.",        connected: true  },
  { key: "aws",      name: "AWS",       blurb: "S3 archive, Lambda inference workers.",      connected: true  },
  { key: "mapbox",   name: "Mapbox",    blurb: "Map tiles + geocoding for mission planner.", connected: true  },
  { key: "slack",    name: "Slack",     blurb: "Alerts + audit-anchor mirror.",              connected: false },
  { key: "stripe",   name: "Stripe",    blurb: "Subscription billing + invoice PDFs.",       connected: true  },
  { key: "hkcad",    name: "HKCAD",     blurb: "Airspace authorisation handshake.",          connected: false },
];

interface ApiKey {
  id: string;
  label: string;
  scope: "world-model" | "nepa" | "ingest" | "readonly";
  createdAt: string;
  lastUsed: string;
  preview: string; // last 4 chars
}

const INITIAL_KEYS: ApiKey[] = [
  { id: "k_01", label: "World Model — prod",        scope: "world-model", createdAt: "2026-04-12", lastUsed: "2m ago",  preview: "9f3a" },
  { id: "k_02", label: "NEPA inference — staging",  scope: "nepa",        createdAt: "2026-05-02", lastUsed: "1h ago",  preview: "be21" },
  { id: "k_03", label: "Ingest — drone-fleet",       scope: "ingest",     createdAt: "2026-05-18", lastUsed: "12m ago", preview: "447c" },
];

interface DocItem {
  id: string;
  title: string;
  kind: "policy" | "permit" | "insurance" | "manual" | "audit";
  size: string;
  updatedAt: string;
}

const INITIAL_DOCS: DocItem[] = [
  { id: "d_01", title: "HKCAD Type-B Operator Permit",       kind: "permit",    size: "412 KB", updatedAt: "2026-05-01" },
  { id: "d_02", title: "AXA Drone Liability Policy",          kind: "insurance", size: "1.2 MB", updatedAt: "2026-04-22" },
  { id: "d_03", title: "ATLAS OS Flight Operations Manual",  kind: "manual",    size: "3.8 MB", updatedAt: "2026-05-19" },
  { id: "d_04", title: "ISO 27001 SoA",                       kind: "policy",   size: "260 KB", updatedAt: "2026-03-30" },
  { id: "d_05", title: "Audit anchor — May 2026 Merkle root",kind: "audit",     size: "8 KB",   updatedAt: "2026-05-26" },
];

function Card({
  title,
  children,
  style,
}: {
  title?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <section
      style={{
        border: "1px solid #1a1f26",
        borderRadius: 8,
        background: "#0e1217",
        padding: 16,
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            fontSize: 12,
            opacity: 0.6,
            marginBottom: 12,
            textTransform: "uppercase",
            letterSpacing: ".08em",
          }}
        >
          {title}
        </div>
      )}
      {children}
    </section>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.5fr",
        gap: 14,
        alignItems: "center",
        padding: "10px 0",
        borderTop: "1px solid #1a1f26",
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
        {hint && <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Slider({
  value,
  onChange,
  min,
  max,
  step,
  unit,
}: {
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ flex: 1, accentColor: "#22d3ee" }}
      />
      <span style={{ fontFamily: "monospace", minWidth: 64, textAlign: "right" }}>
        {value}
        {unit ?? ""}
      </span>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 38,
        height: 22,
        borderRadius: 999,
        border: "1px solid #1a1f26",
        background: on ? "#22d3ee" : "#11151a",
        position: "relative",
        cursor: "pointer",
      }}
      aria-pressed={on}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: on ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#0b0d10",
          transition: "left .15s",
        }}
      />
    </button>
  );
}

function Btn({
  children,
  onClick,
  variant = "default",
  style,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "danger";
  style?: React.CSSProperties;
}) {
  const palette =
    variant === "primary"
      ? { bg: "#22d3ee", fg: "#0b0d10", bd: "#22d3ee" }
      : variant === "danger"
      ? { bg: "#1a0f0f", fg: "#fca5a5", bd: "#3a1f1f" }
      : { bg: "#11151a", fg: "#e7ecf3", bd: "#1a1f26" };
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 12px",
        borderRadius: 6,
        background: palette.bg,
        color: palette.fg,
        border: `1px solid ${palette.bd}`,
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<TabId>("general");

  // General
  const [orgName, setOrgName] = useState("AuraSense Robotics");
  const [region, setRegion] = useState("hk-1");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // NEPA STDP
  const [tauPlus, setTauPlus]   = useState(20);     // ms
  const [tauMinus, setTauMinus] = useState(20);     // ms
  const [aPlus, setAPlus]       = useState(0.01);
  const [aMinus, setAMinus]     = useState(0.012);
  const [dopamine, setDopamine] = useState(0.5);

  // Integrations
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS);
  const setConnected = (key: string, on: boolean) =>
    setIntegrations((xs) => xs.map((x) => (x.key === key ? { ...x, connected: on } : x)));

  // Notifications
  const [notif, setNotif] = useState({
    alertsEmail: true,
    alertsSlack: false,
    digestDaily: true,
    digestWeekly: false,
    auditAnchor: true,
  });

  // API Keys
  const [worldModelUrl, setWorldModelUrl] = useState("https://worldmodel.aurasense.dev");
  const [worldModelKey, setWorldModelKey] = useState("");
  const [worldModelKeySaved, setWorldModelKeySaved] = useState(false);
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [newKeyScope, setNewKeyScope] = useState<ApiKey["scope"]>("world-model");

  const createKey = () => {
    if (!newKeyLabel.trim()) return;
    const id = "k_" + Math.random().toString(16).slice(2, 6);
    const preview = Math.random().toString(16).slice(2, 6);
    setKeys((xs) => [
      {
        id,
        label: newKeyLabel.trim(),
        scope: newKeyScope,
        createdAt: new Date().toISOString().slice(0, 10),
        lastUsed: "never",
        preview,
      },
      ...xs,
    ]);
    setNewKeyLabel("");
  };
  const revokeKey = (id: string) => setKeys((xs) => xs.filter((k) => k.id !== id));

  // Documents
  const [docs, setDocs] = useState<DocItem[]>(INITIAL_DOCS);
  const removeDoc = (id: string) => setDocs((xs) => xs.filter((d) => d.id !== id));

  return (
    <main style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <header>
                <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>
          <Link href="/dashboard" style={{ color: "#22d3ee", textDecoration: "none" }}>
            Dashboard
          </Link>
          <span style={{ margin: "0 8px", opacity: 0.4 }}>/</span>
          <span>Settings</span>
        </div>
        <h1 style={{ fontSize: 22, margin: 0 }}>Settings</h1>
        <p style={{ opacity: 0.6, margin: "4px 0 0", fontSize: 13 }}>
          Organisation, NEPA tuning, integrations, notifications, API keys, and documents.
        </p>
      </header>

      <nav
        style={{
          display: "flex",
          gap: 4,
          borderBottom: "1px solid #1a1f26",
          flexWrap: "wrap",
        }}
      >
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "8px 14px",
                background: "transparent",
                border: "none",
                borderBottom: active ? "2px solid #22d3ee" : "2px solid transparent",
                color: active ? "#e7ecf3" : "#9ca3af",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: active ? 700 : 500,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      {/* ----------------- GENERAL ----------------- */}
      {tab === "general" && (
        <Card title="General">
          <Row label="Organisation name">
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                background: "#11151a",
                border: "1px solid #1a1f26",
                borderRadius: 6,
                color: "#e7ecf3",
                fontSize: 13,
              }}
            />
          </Row>
          <Row label="Region" hint="Where audit + Supabase data lives.">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              style={{
                padding: "8px 10px",
                background: "#11151a",
                border: "1px solid #1a1f26",
                borderRadius: 6,
                color: "#e7ecf3",
                fontSize: 13,
              }}
            >
              <option value="hk-1">Hong Kong (hk-1)</option>
              <option value="ap-southeast-1">Singapore (ap-southeast-1)</option>
              <option value="ap-northeast-1">Tokyo (ap-northeast-1)</option>
              <option value="eu-west-1">Ireland (eu-west-1)</option>
            </select>
          </Row>
          <Row label="Theme">
            <div style={{ display: "flex", gap: 8 }}>
              {(["dark", "light"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    background: theme === t ? "#22d3ee" : "#11151a",
                    color: theme === t ? "#0b0d10" : "#e7ecf3",
                    border: "1px solid #1a1f26",
                    cursor: "pointer",
                    fontSize: 12,
                    textTransform: "capitalize",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </Row>
          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 12 }}>
            <Btn variant="primary">Save changes</Btn>
          </div>
        </Card>
      )}

      {/* ----------------- NEPA ENGINE ----------------- */}
      {tab === "nepa" && (
        <Card title="NEPA Engine — STDP">
          <Row label="τ+ (LTP time constant)" hint="Pre-before-post window. Typical 15–30 ms.">
            <Slider value={tauPlus} onChange={setTauPlus} min={1} max={60} step={1} unit=" ms" />
          </Row>
          <Row label="τ− (LTD time constant)" hint="Post-before-pre window. Typical 15–40 ms.">
            <Slider value={tauMinus} onChange={setTauMinus} min={1} max={60} step={1} unit=" ms" />
          </Row>
          <Row label="A+ (LTP learning rate)" hint="Magnitude of potentiation per spike pair.">
            <Slider value={aPlus} onChange={setAPlus} min={0} max={0.05} step={0.001} />
          </Row>
          <Row label="A− (LTD learning rate)" hint="Magnitude of depression per spike pair.">
            <Slider value={aMinus} onChange={setAMinus} min={0} max={0.05} step={0.001} />
          </Row>
          <Row label="Dopamine gate" hint="Reward modulation in [0, 1]. 0 = unsupervised STDP.">
            <Slider value={dopamine} onChange={setDopamine} min={0} max={1} step={0.01} />
          </Row>
          <div
            style={{
              marginTop: 12,
              padding: 10,
              borderRadius: 6,
              background: "#0a1015",
              border: "1px solid #1a1f26",
              fontFamily: "monospace",
              fontSize: 12,
              opacity: 0.9,
            }}
          >
            Δw = A+ · exp(−Δt/τ+) · dopamine when Δt &gt; 0
            <br />
            Δw = −A− · exp(Δt/τ−) when Δt ≤ 0
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12 }}>
            <Btn
              onClick={() => {
                setTauPlus(20);
                setTauMinus(20);
                setAPlus(0.01);
                setAMinus(0.012);
                setDopamine(0.5);
              }}
            >
              Reset to defaults
            </Btn>
            <Btn variant="primary">Apply to live engine</Btn>
          </div>
        </Card>
      )}

      {/* ----------------- INTEGRATIONS ----------------- */}
      {tab === "integrations" && (
        <Card title="Integrations">
          <div style={{ display: "grid", gap: 10 }}>
            {integrations.map((i) => (
              <div
                key={i.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  border: "1px solid #1a1f26",
                  borderRadius: 8,
                  background: "#0a0e15",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 6,
                    background: "#11151a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 12,
                    color: "#22d3ee",
                  }}
                >
                  {i.name.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{i.name}</div>
                  <div style={{ fontSize: 11, opacity: 0.6 }}>{i.blurb}</div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "#1a1f26",
                    color: i.connected ? "#22c55e" : "#9ca3af",
                  }}
                >
                  {i.connected ? "connected" : "disconnected"}
                </span>
                <Toggle on={i.connected} onChange={(on) => setConnected(i.key, on)} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ----------------- NOTIFICATIONS ----------------- */}
      {tab === "notifications" && (
        <Card title="Notifications">
          <Row label="Alerts via email" hint="Critical anomalies, RTH events, no-go decisions.">
            <Toggle on={notif.alertsEmail} onChange={(v) => setNotif({ ...notif, alertsEmail: v })} />
          </Row>
          <Row label="Alerts via Slack" hint="Requires Slack integration in the Integrations tab.">
            <Toggle on={notif.alertsSlack} onChange={(v) => setNotif({ ...notif, alertsSlack: v })} />
          </Row>
          <Row label="Daily digest" hint="Sent 07:00 HKT.">
            <Toggle on={notif.digestDaily} onChange={(v) => setNotif({ ...notif, digestDaily: v })} />
          </Row>
          <Row label="Weekly digest" hint="Sent Mondays 09:00 HKT.">
            <Toggle on={notif.digestWeekly} onChange={(v) => setNotif({ ...notif, digestWeekly: v })} />
          </Row>
          <Row label="Audit anchor confirmations" hint="Notify when Merkle root is mirrored to alerts service.">
            <Toggle on={notif.auditAnchor} onChange={(v) => setNotif({ ...notif, auditAnchor: v })} />
          </Row>
        </Card>
      )}

      {/* ----------------- API KEYS ----------------- */}
      {tab === "apikeys" && (
        <>
          <Card title="World Model API">
            <Row
              label="Endpoint URL"
              hint="Your World Model service (NEPA polygon engine + spatial sense). Used by /dashboard/world-model."
            >
              <input
                value={worldModelUrl}
                onChange={(e) => setWorldModelUrl(e.target.value)}
                placeholder="https://worldmodel.example.com"
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  background: "#11151a",
                  border: "1px solid #1a1f26",
                  borderRadius: 6,
                  color: "#e7ecf3",
                  fontSize: 13,
                  fontFamily: "monospace",
                }}
              />
            </Row>
            <Row
              label="API key"
              hint="Paste your own World Model API key. Stored encrypted; only the last 4 chars are shown after save."
            >
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={worldModelKey}
                  onChange={(e) => {
                    setWorldModelKey(e.target.value);
                    setWorldModelKeySaved(false);
                  }}
                  type="password"
                  placeholder="wm_live_•••••••••••••••••"
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    background: "#11151a",
                    border: "1px solid #1a1f26",
                    borderRadius: 6,
                    color: "#e7ecf3",
                    fontSize: 13,
                    fontFamily: "monospace",
                  }}
                />
                                <Btn
                  variant="primary"
                  onClick={() => {
                    if (!worldModelKey) return;
                    setWorldModelKeySaved(true);
                  }}
                >
                  Save
                </Btn>
              </div>
            </Row>
            {worldModelKeySaved && (
              <div
                style={{
                  marginTop: 10,
                  padding: "8px 10px",
                  borderRadius: 6,
                  background: "#0d1512",
                  border: "1px solid #1f3a2a",
                  color: "#a7f3d0",
                  fontSize: 12,
                }}
              >
                Saved. Only the last 4 characters will be shown next session:{" "}
                <span style={{ fontFamily: "monospace" }}>
                  ••••{worldModelKey.slice(-4)}
                </span>
              </div>
            )}
            <div
              style={{
                marginTop: 12,
                padding: 10,
                borderRadius: 6,
                background: "#0a1015",
                border: "1px solid #1a1f26",
                fontFamily: "monospace",
                fontSize: 11,
                opacity: 0.85,
              }}
            >
              curl -H &quot;Authorization: Bearer $WORLDMODEL_API_KEY&quot; \<br />
              &nbsp;&nbsp;&nbsp;&nbsp;{worldModelUrl || "https://your-endpoint"}/v1/ping
            </div>
          </Card>

          <Card title="Platform API keys" style={{ marginTop: 12 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 220px 120px",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <input
                value={newKeyLabel}
                onChange={(e) => setNewKeyLabel(e.target.value)}
                placeholder="Label, e.g. fleet-prod-01"
                style={{
                  padding: "8px 10px",
                  background: "#11151a",
                  border: "1px solid #1a1f26",
                  borderRadius: 6,
                  color: "#e7ecf3",
                  fontSize: 13,
                }}
              />
              <select
                value={newKeyScope}
                onChange={(e) => setNewKeyScope(e.target.value as ApiKey["scope"])}
                style={{
                  padding: "8px 10px",
                  background: "#11151a",
                  border: "1px solid #1a1f26",
                  borderRadius: 6,
                  color: "#e7ecf3",
                  fontSize: 13,
                }}
              >
                <option value="world-model">scope: world-model</option>
                <option value="nepa">scope: nepa</option>
                <option value="ingest">scope: ingest</option>
                <option value="readonly">scope: readonly</option>
              </select>
              <Btn variant="primary" onClick={createKey}>
                Create key
              </Btn>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead style={{ background: "#11151a", textAlign: "left" }}>
                <tr>
                  <th style={{ padding: "8px 10px" }}>Label</th>
                  <th style={{ padding: "8px 10px" }}>Scope</th>
                  <th style={{ padding: "8px 10px" }}>Key</th>
                  <th style={{ padding: "8px 10px" }}>Created</th>
                  <th style={{ padding: "8px 10px" }}>Last used</th>
                  <th style={{ padding: "8px 10px" }} />
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} style={{ borderTop: "1px solid #1a1f26" }}>
                    <td style={{ padding: "8px 10px", fontWeight: 600 }}>{k.label}</td>
                    <td style={{ padding: "8px 10px", fontFamily: "monospace" }}>{k.scope}</td>
                    <td style={{ padding: "8px 10px", fontFamily: "monospace" }}>
                      atlas_••••_{k.preview}
                    </td>
                    <td style={{ padding: "8px 10px", opacity: 0.7 }}>{k.createdAt}</td>
                    <td style={{ padding: "8px 10px", opacity: 0.7 }}>{k.lastUsed}</td>
                    <td style={{ padding: "8px 10px", textAlign: "right" }}>
                      <Btn variant="danger" onClick={() => revokeKey(k.id)}>
                        Revoke
                      </Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {/* ----------------- DOCUMENTS ----------------- */}
      {tab === "documents" && (
        <Card title="Documents">
          <div
            style={{
              padding: 14,
              border: "1px dashed #1a1f26",
              borderRadius: 8,
              background: "#0a0e15",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 13, marginBottom: 4 }}>Drop files here to upload</div>
            <div style={{ fontSize: 11, opacity: 0.6 }}>
              PDF, DOCX, PNG, JPG · max 10 MB · stored in Supabase &lt;tenant&gt;/docs
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead style={{ background: "#11151a", textAlign: "left" }}>
              <tr>
                <th style={{ padding: "8px 10px" }}>Title</th>
                <th style={{ padding: "8px 10px" }}>Kind</th>
                <th style={{ padding: "8px 10px" }}>Size</th>
                <th style={{ padding: "8px 10px" }}>Updated</th>
                <th style={{ padding: "8px 10px" }} />
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} style={{ borderTop: "1px solid #1a1f26" }}>
                  <td style={{ padding: "8px 10px", fontWeight: 600 }}>{d.title}</td>
                  <td style={{ padding: "8px 10px", textTransform: "capitalize", opacity: 0.85 }}>
                    {d.kind}
                  </td>
                  <td style={{ padding: "8px 10px", fontFamily: "monospace" }}>{d.size}</td>
                  <td style={{ padding: "8px 10px", opacity: 0.7 }}>{d.updatedAt}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right" }}>
                    <a
                      href="#"
                      style={{ color: "#22d3ee", textDecoration: "none", marginRight: 12, fontSize: 12 }}
                    >
                      Download
                    </a>
                    <Btn variant="danger" onClick={() => removeDoc(d.id)}>
                      Remove
                    </Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* ----------------- DANGER ZONE (footer on every tab) ----------------- */}
      <Card
        title="Danger zone"
        style={{ borderColor: "#3a1f1f", background: "#140a0a" }}
      >
        <Row label="Export all data" hint="One-time ZIP archive (Supabase + audit + telemetry).">
          <Btn>Export</Btn>
        </Row>
        <Row
          label="Rotate signing key"
          hint="Forces all clients to re-authenticate. Audit anchors re-sealed."
        >
          <Btn>Rotate</Btn>
        </Row>
        <Row
          label="Delete organisation"
          hint="Permanently deletes all data after 30-day grace. Cannot be undone."
        >
          <Btn variant="danger">Delete…</Btn>
        </Row>
      </Card>
    </main>
  );
}