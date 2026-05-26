"use client";

import React from "react";
import { useMyPlan, startCheckout, openCustomerPortal } from "@/lib/hooks/useBilling";
import type { PlanKey } from "@/lib/types/atlas";

// TODO: VERIFY plan list matches src/lib/billing/plans.ts PLANS constant.
// You probably want to import from there instead of redefining here.
const PLANS: Array<{
  key: PlanKey;
  label: string;
  price_monthly: string;
  features: string[];
  cta: string;
}> = [
  {
    key: "starter",
    label: "Starter",
    price_monthly: "Free",
    features: ["1 drone slot", "Mock telemetry", "Public dashboard"],
    cta: "Get started",
  },
  {
    key: "pro",
    label: "Pro",
    price_monthly: "HK$ 1,800 / mo",
    features: ["10 drones", "Live STDP", "Audit chain export", "Email alerts"],
    cta: "Upgrade to Pro",
  },
  {
    key: "enterprise",
    label: "Enterprise",
    price_monthly: "Talk to sales",
    features: ["Unlimited fleet", "Jetson on-prem", "SLA + onboarding", "ATTAS modules"],
    cta: "Contact sales",
  },
];

export default function BillingPage() {
  const { plan, isLoading, error } = useMyPlan();
  const [checkingOut, setCheckingOut] = React.useState<PlanKey | null>(null);

  async function handleCTA(card: typeof PLANS[number]) {
    if (card.key === "starter") {
      window.location.href = "/register";
      return;
    }
    if (card.key === "enterprise") {
      window.location.href = "mailto:sales@aurasensehk.com";
      return;
    }
    if (plan?.plan === card.key) {
      // Already on this plan — open customer portal instead
      await openCustomerPortal();
      return;
    }
    setCheckingOut(card.key);
    try {
      await startCheckout(card.key, false);
    } finally {
      setCheckingOut(null);
    }
  }

  return (
    <div style={{ padding: 24, color: "#e0e8f2" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Billing & Plans</h1>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>
        {isLoading
          ? "Loading current plan…"
          : error
          ? `Plan info unavailable: ${error.message ?? "unknown"}`
          : plan
          ? `You are on the ${plan.plan.toUpperCase()} plan · status: ${plan.status}`
          : "Sign in to see your current plan."}
      </p>

      {plan?.status === "active" && (
        <button
          onClick={() => openCustomerPortal()}
          style={{
            padding: "8px 16px", marginBottom: 24, borderRadius: 6,
            background: "rgba(34,211,238,0.12)", color: "#22d3ee",
            border: "1px solid rgba(34,211,238,0.3)", fontSize: 12, fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Manage subscription
        </button>
      )}

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {PLANS.map(card => {
          const isCurrent = plan?.plan === card.key;
          const isLoading = checkingOut === card.key;
          return (
            <article
              key={card.key}
              style={{
                background: isCurrent ? "rgba(34,211,238,0.06)" : "#0f172a",
                border: isCurrent ? "1px solid rgba(34,211,238,0.4)" : "1px solid #1f2937",
                borderRadius: 12, padding: 20,
              }}
            >
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>{card.label}</h2>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#22d3ee", margin: "8px 0 16px" }}>
                {card.price_monthly}
              </p>
              <ul style={{ listStyle: "none", padding: 0, fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.8 }}>
                {card.features.map(f => >· {f}</li>)}
              </ul>
              <button
                onClick={() => handleCTA(card)}
                disabled={isLoading}
                style={{
                  marginTop: 16, width: "100%", padding: "10px 16px",
                  background: isCurrent ? "transparent" : "#22d3ee",
                  color: isCurrent ? "#22d3ee" : "#0a0e15",
                  border: isCurrent ? "1px solid #22d3ee" : "none",
                  borderRadius: 6, fontSize: 13, fontWeight: 600,
                  cursor: isLoading ? "wait" : "pointer",
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                {isLoading ? "Loading…" : isCurrent ? "Manage" : card.cta}
              </button>
            </article>
          );
        })}
      </section>
    </div>
  );
}