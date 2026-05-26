// Stub hooks so the atlas/nepa page compiles. Replace with real implementations.

export function useArduPilotLink() {
  return { connected: false, latencyMs: 0, mode: "UNKNOWN" as const };
}

export function useArduPilotModes() {
  return {
    modeData: { current_mode: "STABILIZE", available_modes: ["STABILIZE", "LOITER", "RTL"] },
    setMode: async (_m: string) => {},
  };
}

export function useArduPilotCalibration() {
  return {
    status: "idle" as const,
    calibrating: false,
    calibrate: async (_target: string) => {},
  };
}
