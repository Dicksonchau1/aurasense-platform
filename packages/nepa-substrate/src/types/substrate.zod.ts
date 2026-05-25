import { z } from "zod";

export const SubstrateConfigSchema = z.record(z.any());
export const SubstrateStatusSchema = z.object({ status: z.string() });
export const LayerConfigSchema = z.record(z.any());
export const LayerDescriptorSchema = z.object({
  layer_id: z.string(),
  config: LayerConfigSchema,
});
export const ReflexSignalSchema = z.object({ signal: z.any() });
export const ReflexOutcomeSchema = z.object({ outcome: z.any() });
export const CouplingEventSchema = z.object({ event: z.string(), timestamp: z.number() });
export const AdaptationTraceSchema = z.object({ trace: z.array(z.number()) });
export const EnvelopeSchema = z.object({
  session_id: z.string(),
  timestamp: z.number(),
  payload: z.any(),
  trust_level: z.number(),
  policy_refs: z.array(z.string()),
});
export const AuditEventSchema = z.object({
  event_id: z.string(),
  session_id: z.string(),
  event_type: z.string(),
  channel: z.string(),
  payload: z.record(z.any()),
  timestamp: z.number(),
  agent_id: z.string(),
  operator_id: z.string().optional(),
});
