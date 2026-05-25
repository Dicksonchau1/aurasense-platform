export interface InterventionRequest {
  requestId: string;
  reason: string;
  requestedAt: string;
  resolved: boolean;
  resolvedAt?: string;
}
