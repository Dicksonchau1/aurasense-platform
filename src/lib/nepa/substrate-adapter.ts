// ============================================================
// STUB - no-op session lifecycle. Wire to real NEPA substrate.
// Created during emergency recovery on 2026-05-26.
// ============================================================
export type SubstrateClient = {
  startSession: (ctx: any) => Promise<{ sessionId: string }>;
  endSession: (id: string) => Promise<void>;
  pushFrame: (id: string, frame: any) => Promise<void>;
};
export function getSubstrateClient(): SubstrateClient {
  return {
    async startSession(_ctx) { return { sessionId: 'stub-' + Date.now() }; },
    async endSession(_id) {},
    async pushFrame(_id, _frame) {},
  };
}
export default { getSubstrateClient };