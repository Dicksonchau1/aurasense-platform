export type RuntimeMode = "live" | "replay" | "sim";

export interface RuntimeHealth {
  ok: boolean;
  runtime: string;
  ts?: number;
}

export interface Runtime {
  mode: RuntimeMode;
  health: () => Promise<RuntimeHealth>;
}

export function pickRuntime(): Runtime {
  const mode = (process.env.NEPA_RUNTIME_MODE as RuntimeMode) ?? "sim";
  return {
    mode,
    async health(): Promise<RuntimeHealth> {
      return { ok: true, runtime: mode, ts: Date.now() };
    },
  };
}

// ---- STDP frame ------------------------------------------------------------
export interface StdpFrame {
  neurons_active: number;
  spike_rate_hz: number;
  patterns_learned: number;
  stdp_window_ms: number;
  potentiation_count: number;
  depression_count: number;
  dopamine_level: number;
  weight_norm: number;
  council_agree_pct: number;
}

// ---- World model frame -----------------------------------------------------
export interface WorldModelFrame {
  envelope_voxels: number;
  prediction_error: number;
  replay_coverage_pct: number;
  divergences_24h: number;
  anomaly_flag: boolean;
  pose: { x: number; y: number; z: number; yaw: number };
  predicted_pose: { x: number; y: number; z: number; yaw: number };
  drift_score: number;
}

// ---- Inference frame envelope ---------------------------------------------
export interface InferenceFrame {
  ok: boolean;
  runtime: RuntimeMode;
  ts: number;
  latency_ms: number;
  stdp: StdpFrame;
  world_model: WorldModelFrame;
  error?: string;
}

function rng(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function makeStdp(): StdpFrame {
  return {
    neurons_active: 1800 + Math.floor(Math.random() * 250),
    spike_rate_hz: rng(11.5, 16.2),
    patterns_learned: 247 + Math.floor(Math.random() * 4),
    stdp_window_ms: 17,
    potentiation_count: Math.floor(rng(120, 180)),
    depression_count: Math.floor(rng(80, 140)),
    dopamine_level: rng(0.78, 0.92),
    weight_norm: rng(0.91, 0.98),
    council_agree_pct: rng(74, 88),
  };
}

function makeWorldModel(): WorldModelFrame {
  const anomaly = Math.random() < 0.15;
  const px = rng(-2, 2);
  const py = rng(-2, 2);
  const pz = rng(40, 90);
  return {
    envelope_voxels: 2700 + Math.floor(Math.random() * 280),
    prediction_error: rng(0.12, 0.34),
    replay_coverage_pct: rng(96, 99.4),
    divergences_24h: Math.floor(rng(0, 4)),
    anomaly_flag: anomaly,
    pose:           { x: px,                  y: py,                  z: pz,             yaw: rng(-Math.PI, Math.PI) },
    predicted_pose: { x: px + rng(-0.15, .15), y: py + rng(-0.15, .15), z: pz + rng(-1, 1), yaw: rng(-Math.PI, Math.PI) },
    drift_score: rng(0.02, 0.06),
  };
}

/**
 * inferFrameSafe — never throws, always returns a structured frame.
 * Signature matches the live route consumers: takes a raw input buffer + opts,
 * returns { ok, runtime, ts, latency_ms, stdp, world_model, error? }.
 *
 * STUB: returns synthetic but realistic NEPA telemetry. Wire to real backend later.
 */
export async function inferFrameSafe(
  _input: Buffer | Uint8Array | null,
  _opts?: { source?: string; region?: string }
): Promise<InferenceFrame> {
  const started = Date.now();
  try {
    const rt = pickRuntime();
    const h = await rt.health();
    if (!h.ok) {
      return {
        ok: false,
        runtime: rt.mode,
        ts: started,
        latency_ms: Date.now() - started,
        stdp: makeStdp(),
        world_model: makeWorldModel(),
        error: "runtime_unhealthy",
      };
    }
    return {
      ok: true,
      runtime: rt.mode,
      ts: started,
      latency_ms: Date.now() - started,
      stdp: makeStdp(),
      world_model: makeWorldModel(),
    };
  } catch (err: any) {
    return {
      ok: false,
      runtime: "sim",
      ts: started,
      latency_ms: Date.now() - started,
      stdp: makeStdp(),
      world_model: makeWorldModel(),
      error: String(err?.message ?? err).slice(0, 200),
    };
  }
}

export default { pickRuntime, inferFrameSafe };