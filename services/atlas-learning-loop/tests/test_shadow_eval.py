import pytest
from atlas_learning.evaluation.shadow_eval import ShadowEvaluator

class DummyModel:
    def argmax_action(self, state):
        return 1, 10.0
class DummyPolicyGate:
    def evaluate(self, action, state):
        return {"allowed": False}

def test_shadow_eval_refuses_promotion_on_regression():
    candidate = DummyModel()
    production = DummyModel()
    policy_gate = DummyPolicyGate()
    eval = ShadowEvaluator(candidate, production, policy_gate)
    # Simulate 5000 shadow decisions, all violating policy
    for _ in range(5000):
        eval.results.append({"agrees": True, "regret": 0.5, "candidate_safe": False, "ts": 0})
    report = eval.promotion_report()
    assert report["promote"] is False
    assert "violation_rate" in report
