class TrainingSafetyGate:
    """Defense in depth: even if the candidate passes shadow eval, the
    safety gate refuses to promote if the candidate makes ANY decision
    that the policy gate would deny. This is the last firewall before
    a model swap reaches production fleet."""

    def gate(self, shadow_results: dict) -> dict:
        if shadow_results["violation_rate"] > 0:
            return {"allow_promotion": False,
                    "reason": "candidate_violated_policy_gate_in_shadow"}
        if shadow_results["regret_p95"] > 1.5:
            return {"allow_promotion": False,
                    "reason": "regret_too_high"}
        return {"allow_promotion": True}
