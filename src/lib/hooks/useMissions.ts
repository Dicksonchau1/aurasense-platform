"use client";

import useSWR from "swr";
import { fetcher, postJson, swrLiveConfig } from "@/lib/api/swr";
import type { MissionSummary } from "@/lib/types/atlas";

export function useActiveMissions() {
  // Uses existing /api/nepa/missions/active route
  // TODO: VERIFY return shape — existing route may return MissionSummary[] directly
  const { data, error, isLoading, mutate } = useSWR<{ data: MissionSummary[] }>(
    "/api/nepa/missions/active",
    fetcher,
    swrLiveConfig,
  );
  return { missions: data?.data ?? [], error, isLoading, mutate };
}

export async function sendMissionCommand(
  missionId: string,
  command: "pause" | "resume" | "abort" | "rtb",
): Promise<void> {
  // Uses existing /api/missions/[id]/command route
  // TODO: VERIFY existing route accepts POST with { command } body
  await postJson(`/api/missions/${missionId}/command`, { command });
}