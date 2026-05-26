export function useStdpSnapshot() {
  return { data: { weights: [], spikes: 0, lastUpdate: new Date().toISOString() }, loading: false, error: null as Error | null };
}
export function usePipelineStatus() {
  return { status: { stage: "idle", progress: 0, message: "pipeline offline" } as const, loading: false };
}
export function useWorldModelSnapshot() {
  return { snapshot: { entities: [], ticks: 0 }, loading: false };
}
export function useArduPilotLink() {
  return { connected: false, latencyMs: 0, mode: "UNKNOWN" as const };
}
export function useArduPilotModes() {
  return { modeData: { current_mode: "STABILIZE", available_modes: ["STABILIZE","LOITER","RTL"] }, setMode: async (_m: string) => {} };
}
export function useArduPilotCalibration() {
  return { status: "idle" as const, calibrating: false, calibrate: async (_t: string) => {} };
}
