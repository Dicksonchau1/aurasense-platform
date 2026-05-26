"use client";

import useSWR from "swr";
import { fetcher, swrDefaultConfig, swrLiveConfig } from "@/lib/api/swr";
import type { FleetItem, AlertItem, ActivityItem } from "@/lib/types/atlas";

export function useFleet() {
  // TODO: VERIFY route — create src/app/api/atlas/fleet/route.ts (File 7 below)
  const { data, error, isLoading, mutate } = useSWR<{ data: FleetItem[] }>(
    "/api/atlas/fleet",
    fetcher,
    swrLiveConfig,
  );
  return { fleet: data?.data ?? [], error, isLoading, mutate };
}

export function useAlerts() {
  // Uses existing /api/nepa/anomalies/live route
  // TODO: VERIFY the existing route returns { data: AlertItem[] } shape
  const { data, error, isLoading, mutate } = useSWR<{ data: AlertItem[] }>(
    "/api/nepa/anomalies/live",
    fetcher,
    swrLiveConfig,
  );
  return { alerts: data?.data ?? [], error, isLoading, mutate };
}

export function useActivity() {
  // TODO: VERIFY route — create src/app/api/atlas/activity/route.ts (File 8 below)
  const { data, error, isLoading, mutate } = useSWR<{ data: ActivityItem[] }>(
    "/api/atlas/activity",
    fetcher,
    swrDefaultConfig,
  );
  return { activity: data?.data ?? [], error, isLoading, mutate };
}