"use client";;
import { useState } from "react";
import Link from "next/link";

type PlanId = "starter" | "pro" | "enterprise";

interface Plan {
  id: PlanId;
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  features: string[];
  highlight?: boolean;
  cta: string;
}

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "HKD 399",
    cadence: "/ month",
    blurb: "Solo operators running occasional inspections.",
    features: [
      "1 drone seat",
      "1,000 inspection frames / month",
      "30-day audit retention",
      "Mission planner",
      "Email support",
    ],
    cta: "Current plan",
  },
  {
    id: "pro",
    name: "Team",
    price: "HKD 2,800",
    cadence: "/ month",
    blurb: "Small teams running scheduled inspections.",
    features: [
      "5 drone seats",
      "10,000 frames / month",
      "90-day audit retention",
      "NEPA learning loop",
      "Mission planner + world model",
      "Priority email support",
    ],
    highlight: true,
    cta: "Upgrade to Team",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    blurb: "Critical-infrastructure operators with SLAs.",
    features: [
      "Unlimited seats",
      "Unlimited frames",
      "7-year audit retention",
      "Fleet deconfliction",
      "Humanoid + tendon orchestration",
      "Dedicated NEPA tenant",
      "24x7 phone support",
      "Custom compliance reports",
    ],
    cta: "Contact sales",
  },
];

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: "paid" | "open" | "void";
}

const INVOICES: Invoice[] = [
  { id: "INV-2026-0521", date: "2026-05-01", amount: "HKD 4,800.00", status: "paid" },
  { id: "INV-2026-0489", date: "2026-04-01", amount: "HKD 4,800.00", status: "paid" },
  { id: "INV-2026-0451", date: "2026-03-01", amount: "HKD 4,800.00", status: "paid" },
  { id: "INV-2026-0414", date: "2026-02-01", amount: "HKD 4,800.00", status: "paid" },
  { id: "INV-2026-0381", date: "2026-01-01", amount: "HKD 4,800.00", status: "paid" },
];

interface Usage {
  label: string;
  used: number;
  cap: number;
  unit: string;
}

const USAGE: Usage[] = [
  { label: "Frames captured",       used: 6420, cap: 10000, unit: "frames" },
  { label: "Drone seats",           used: 3,    cap: 5,     unit: "seats" },
  { label: "NEPA inference hours",  used: 142,  cap: 250,   unit: "hours" },
  { label: "Audit storage",         used: 18.4, cap: 50,    unit: "GB" },
];

function StatusPill({ s }: { s: Invoice["status"] }) {
  const color = s === "paid" ? "#22c55e" : s === "open" ? "#f59e0b" : "#6b7280";
  return (
    <span
      style={{
        fontSize: 11,
        padding: "2px 8px",
        borderRadius: 999,
        background: "#1a1f26",
        color,
        border: "1px solid " + color + "33",
        textTransform: "uppercase",
        letterSpacing: ".08em",
      }}
    >
      {s}
    </span>
  );
}

function UsageBar({ u }: { u: Usage }) {
  const pct = Math.max(0, Math.min(100, (u.used / u.cap) * 100));
  const color = pct > 90 ? "#ef4444" : pct > 70 ? "#f59e0b" : "#22d3ee";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
        <span style={{ opacity: 0.85 }}>{u.label}</span>
        <span style={{ fontFamily: "monospace", opacity: 0.8 }}>
          {u.used} / {u.cap} {u.unit}
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: "#1a1f26", overflow: "hidden" }}>
        <div style={{ width: pct + "%", height: "100%", background: color, transition: "width .25s ease" }} />
      </div>
    </div>
  );
}

const PlanCard = (
  { plan, current, onPick }: { plan: Plan; current: PlanId; onPick: (id: PlanId) => void }
): import("react/jsx-runtime").JSX.Element => {
  const isCurrent = plan.id === current;
  return (
    <div
      style={{
        position: "relative",
        padding: 18,
        border: plan.highlight ? "1px solid #22d3ee" : "1px solid #1a1f26",
        borderRadius: 10,
        background: plan.highlight ? "linear-gradient(180deg,#0e1c25,#0b141a)" : "#0e1217",
      }}
    >
      {plan.highlight && (
        <div
          style={{
            position: "absolute",
            top: -10,
            right: 14,
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: 999,
            background: "#22d3ee",
            color: "#0b0d10",
            fontWeight: 700,
            letterSpacing: ".08em",
          }}
        >
          POPULAR
        </div>
      )}
      <div style={{ fontSize: 12, opacity: 0.7, letterSpacing: ".1em", textTransform: "uppercase" }}>{plan.name}</div>
      <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", gap: 4 }}>
        <div style={{ fontSize: 28, fontWeight: 800 }}>{plan.price}</div>
        <div style={{ opacity: 0.6, fontSize: 13 }}>{plan.cadence}</div>
      </div>
      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>{plan.blurb}</div>
      <ul style={{ listStyle: "none", padding: 0, margin: "12px 0", display: "grid", gap: 6 }}>
        {plan.features.map((f) => (
          <li key={f} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "#22c55e" }}>{String.fromCharCode(10003)}</span>
            <span style={{ opacity: 0.9 }}>{f}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={() => onPick(plan.id)}
        disabled={isCurrent}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          background: isCurrent ? "#1a1f26" : plan.highlight ? "#22d3ee" : "#11151a",
          color: isCurrent ? "#9ca3af" : plan.highlight ? "#0b0d10" : "#e7ecf3",
          border: plan.highlight ? "none" : "1px solid #1a1f26",
          fontWeight: 700,
          fontSize: 13,
          cursor: isCurrent ? "default" : "pointer",
        }}
      >
        {isCurrent ? "Current plan" : plan.cta}
      </button>
    </div>
  );
};

export default function BillingPage() {
  const [current, setCurrent] = useState<PlanId>("pro");

  return (
    <main style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <header>
        <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>
          <Link href="/dashboard" style={{ color: "#22d3ee", textDecoration: "none" }}>
            Dashboard
          </Link>
          <span style={{ margin: "0 8px", opacity: 0.4 }}>/</span>
          <span>Billing</span>
        </div>
        <h1 style={{ fontSize: 22, margin: 0 }}>Billing &amp; Plans</h1>
        <p style={{ opacity: 0.6, margin: "4px 0 0", fontSize: 13 }}>
          Manage your subscription, payment method, usage, and invoice history.
        </p>
      </header>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
        {PLANS.map((p) => (
          <PlanCard key={p.id} plan={p} current={current} onPick={setCurrent} />
        ))}
      </section>
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ padding: 14, border: "1px solid #1a1f26", borderRadius: 8, background: "#0e1217" }}>
          <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 10, textTransform: "uppercase", letterSpacing: ".08em" }}>
            Payment method
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 28,
                borderRadius: 4,
                background: "linear-gradient(135deg,#1e3a8a,#0ea5e9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: ".08em",
              }}
            >
              VISA
            </div>
            <div>
              <div style={{ fontFamily: "monospace" }}>{"\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 6411"}</div>
              <div style={{ fontSize: 11, opacity: 0.6 }}>Expires 09/28 - Dickson Chau</div>
            </div>
            <button
              style={{
                marginLeft: "auto",
                padding: "6px 10px",
                borderRadius: 6,
                background: "#11151a",
                border: "1px solid #1a1f26",
                color: "#e7ecf3",
                fontSize: 12,
                cursor: "pointer",
                            }}
            >
              Update
            </button>
          </div>
        </div>

        <div style={{ padding: 14, border: "1px solid #1a1f26", borderRadius: 8, background: "#0e1217" }}>
          <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 10, textTransform: "uppercase", letterSpacing: ".08em" }}>
            Usage this period
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {USAGE.map((u) => (
              <UsageBar key={u.label} u={u} />
            ))}
          </div>
        </div>
      </section>
      <section style={{ border: "1px solid #1a1f26", borderRadius: 8, overflow: "hidden", background: "#0e1217" }}>
        <div
          style={{
            padding: "10px 14px",
            borderBottom: "1px solid #1a1f26",
            fontSize: 12,
            opacity: 0.7,
            textTransform: "uppercase",
            letterSpacing: ".08em",
          }}
        >
          Invoice history
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ background: "#11151a", textAlign: "left" }}>
            <tr>
              <th style={{ padding: "8px 12px" }}>Invoice</th>
              <th style={{ padding: "8px 12px" }}>Date</th>
              <th style={{ padding: "8px 12px" }}>Amount</th>
              <th style={{ padding: "8px 12px" }}>Status</th>
              <th style={{ padding: "8px 12px" }} />
            </tr>
          </thead>
          <tbody>
            {INVOICES.map((inv) => (
              <tr key={inv.id} style={{ borderTop: "1px solid #1a1f26" }}>
                <td style={{ padding: "8px 12px", fontFamily: "monospace" }}>{inv.id}</td>
                <td style={{ padding: "8px 12px", opacity: 0.8 }}>{inv.date}</td>
                <td style={{ padding: "8px 12px", fontFamily: "monospace" }}>{inv.amount}</td>
                <td style={{ padding: "8px 12px" }}>
                  <StatusPill s={inv.status} />
                </td>
                <td className="invoice-download-cell">
                  <a href="#" style={{ color: "#22d3ee", textDecoration: "none", fontSize: 12 }}>
                    Download PDF
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

