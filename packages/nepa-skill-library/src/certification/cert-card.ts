// Signed certification record
export interface CertCard {
  certId: string;
  skillId: string;
  skillVersion: number;
  embodimentClass: string;
  scope: 'SIM' | 'SHADOW' | 'CANARY' | 'SITE' | 'FLEET';
  siteId: string | null;
  metrics: {
    successRate: number;
    p95LatencyMs: number;
    humanInterventionRate: number;
    criticRiskMean: number;
    goldenReplayDivergence: number;
  };
  evidencePackUris: string[];
  validFrom: number;
  validUntil: number;
  revokedAt: number | null;
  revocationReason: string | null;
  issuer: string;
  signature: string;
  chainHead: string;
}
