export interface AgentRecommendation {
  id: string;
  intent: AgentIntent;
  confidence: number;
  rationale?: string;
  issuedAt: string;
}
