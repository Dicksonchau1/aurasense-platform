export type RuntimeMode = 'live' | 'replay' | 'sim';
export interface RuntimeHealth { ok: boolean; runtime: string; ts?: number; }
export interface Runtime {
  mode: RuntimeMode;
  health: () => Promise<RuntimeHealth>;
}

export function pickRuntime(): Runtime {
  const mode = (process.env.NEPA_RUNTIME_MODE as RuntimeMode) ?? 'sim';
  return {
    mode,
    async health(): Promise<RuntimeHealth> {
      return { ok: true, runtime: mode, ts: Date.now() };
    },
  };
}

export default { pickRuntime };