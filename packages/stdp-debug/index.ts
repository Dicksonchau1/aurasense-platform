import { Envelope, AuditEvent, AdaptationTrace, SubstrateClient } from 'nepa-substrate';

const substrate = new SubstrateClient({});

export function getStdpDebugger() {
  return {
    connect: async () => substrate.connect(),
    disconnect: async () => substrate.disconnect(),

    // Fetch a trace by ID from backend
    inspectTrace: async (traceId: string): Promise<AdaptationTrace> => {
      return await substrate.getTrace(traceId);
    },

    // Fetch all envelopes from backend
    getEnvelopes: async (): Promise<Envelope[]> => {
      return await substrate.getEnvelopes();
    },

    // Fetch all audit events from backend
    getAuditEvents: async (): Promise<AuditEvent[]> => {
      return await substrate.getAuditEvents();
    },
  };
}
