export interface OperatorDecision {
  decisionId: string;
  action: OperatorAction;
  decision: 'acknowledge' | 'correct' | 'override';
  rationale?: string;
  decidedAt: string;
}
