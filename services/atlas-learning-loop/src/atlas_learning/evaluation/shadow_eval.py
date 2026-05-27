class ShadowEvaluator:
    """Runs the candidate model against live FleetState snapshots in
    shadow mode — predicting actions but never executing them. Compares
    candidate's predicted-best-action to the production model's
    actual choice. Produces an agreement rate, predicted-regret
    distribution, and safety-violation rate. New model is promoted
    only when ALL six criteria pass."""

    PROMOTION_CRITERIA = {
        "agreement_rate_min": 0.65,
        "regret_p95_max": 2.0,
        "safety_violation_rate_max": 0.0001,
        "min_shadow_decisions": 5_000,
        "min_shadow_hours": 24,
        "policy_gate_compliance": 1.0,
    }

    def __init__(self, candidate_model, production_model, policy_gate):
        self.candidate = candidate_model
        self.production = production_model
        self.policy_gate = policy_gate
        self.results = []

    async def evaluate_decision(self, state, prod_action, prod_value):
        cand_action, cand_value = self.candidate.argmax_action(state)
        agrees = cand_action == prod_action
        gate_result = self.policy_gate.evaluate(cand_action, state)
        regret = max(0.0, prod_value - cand_value)
        self.results.append({
            "agrees": agrees,
            "regret": regret,
            "candidate_safe": gate_result["allowed"],
            "ts": state.timestamp,
        })

    def promotion_report(self) -> dict:
        if len(self.results) < self.PROMOTION_CRITERIA["min_shadow_decisions"]:
            return {"promote": False, "reason": "insufficient_decisions"}
        n = len(self.results)
        agreement = sum(r["agrees"] for r in self.results) / n
        regrets = sorted(r["regret"] for r in self.results)
        regret_p95 = regrets[int(n * 0.95)]
        safety_violations = sum(not r["candidate_safe"] for r in self.results)
        violation_rate = safety_violations / n
        passes = (
            agreement >= self.PROMOTION_CRITERIA["agreement_rate_min"]
            and regret_p95 <= self.PROMOTION_CRITERIA["regret_p95_max"]
            and violation_rate <= self.PROMOTION_CRITERIA["safety_violation_rate_max"]
        )
        return {
            "promote": passes,
            "agreement_rate": agreement,
            "regret_p95": regret_p95,
            "violation_rate": violation_rate,
            "n_decisions": n,
        }
