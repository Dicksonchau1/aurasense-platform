export const WORLD_MODEL_CONFIG = {
  assets: {
    model: "/models/site-drone.glb",
    hdri: "/hdri/warehouse.hdr",
  },
  transport: {
    rehearsalWs:
      process.env.NEXT_PUBLIC_REHEARSE_WS_URL ?? "ws://127.0.0.1:3001/rehearse/drone",
    liveWs:
      process.env.NEXT_PUBLIC_NEPA_WS_URL ?? "ws://127.0.0.1:3001/live/drone",
  },
} as const;

export type WorldModelConfig = typeof WORLD_MODEL_CONFIG;
