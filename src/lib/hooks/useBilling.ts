"use client";

import useSWR from "swr";
import { fetcher, postJson, swrDefaultConfig } from "@/lib/api/swr";
import type { MyPlan, PlanKey } from "@/lib/types/atlas";

export function useMyPlan() {
  // Uses existing /api/billing/me route
  // TODO: VERIFY return shape — current route may return { plan, status } directly without nesting
  const { data, error, isLoading, mutate } = useSWR<MyPlan>(
    "/api/billing/me",
    fetcher,
    swrDefaultConfig,
  );
  return { plan: data, error, isLoading, mutate };
}

export async function startCheckout(plan: PlanKey, annual = false): Promise<void> {
  // Uses existing /api/billing/checkout route
  // TODO: VERIFY request body shape — existing route may expect { priceId } instead of { plan, annual }
  const result = await postJson<{ url?: string; error?: string }>(
    "/api/billing/checkout",
    { plan, annual },
  );
  if (result?.url) {
    window.location.href = result.url;
  } else if (result?.error === "stripe_not_configured") {
    alert("DEMO MODE — Stripe not configured. In production this would redirect to Stripe Checkout.");
  } else {
    alert(result?.error ?? "Checkout failed");
  }
}

export async function openCustomerPortal(): Promise<void> {
  // Uses existing /api/billing/portal route
  // TODO: VERIFY existing route accepts POST with no body
  const result = await postJson<{ url?: string; error?: string }>("/api/billing/portal", {});
  if (result?.url) {
    window.location.href = result.url;
  } else {
    alert(result?.error ?? "Portal unavailable");
  }
}