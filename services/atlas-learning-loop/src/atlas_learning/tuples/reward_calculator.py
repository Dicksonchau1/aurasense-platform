from .tuple_schema import RawAuditEvent

class RewardCalculator:
    """Computes the scalar reward for a (decision, outcome) pair.
    The components dict makes the reward decomposition explicit and
    auditable — critical for explaining why the model learned what
    it learned."""

    def __init__(
        self,
        throughput_weight: float = 1.0,
        sla_weight: float = 5.0,
        downtime_weight: float = 0.5,
        risk_weight: float = 2.0,
        human_intervention_weight: float = 3.0,
        battery_efficiency_weight: float = 0.3,
        skill_propagation_weight: float = 0.4,
    ):
        self.w = {
            "throughput": throughput_weight,
            "sla": sla_weight,
            "downtime": downtime_weight,
            "risk": risk_weight,
            "human": human_intervention_weight,
            "battery": battery_efficiency_weight,
            "skill": skill_propagation_weight,
        }

    def compute(self, decision: RawAuditEvent,
                outcome: RawAuditEvent) -> tuple[float, dict]:
        components: dict[str, float] = {}

        if outcome.event_type == "MISSION_COMPLETED":
            components["throughput"] = self.w["throughput"]
        elif outcome.event_type == "MISSION_FAILED":
            components["throughput"] = -self.w["throughput"]

        if outcome.event_type == "SLA_BREACHED":
            components["sla"] = -self.w["sla"]
        elif outcome.payload.get("slaMargin"):
            margin = outcome.payload["slaMargin"]
            components["sla"] = self.w["sla"] * min(1.0, margin / 60.0)

        downtime_s = outcome.payload.get("downtimeSeconds", 0)
        if downtime_s > 0:
            components["downtime"] = -self.w["downtime"] * (downtime_s / 60.0)

        if outcome.payload.get("riskExceeded"):
            components["risk"] = -self.w["risk"]

        if outcome.payload.get("humanInterventionTriggered"):
            components["human"] = -self.w["human"]

        if outcome.event_type == "POST_SWAP_VERIFIED":
            wasted = outcome.payload.get("wastedCapacityWh", 0)
            components["battery"] = -self.w["battery"] * (wasted / 100.0)

        if outcome.event_type == "SKILL_DEPLOYED":
            n_robots = outcome.payload.get("targetRobotCount", 1)
            components["skill"] = self.w["skill"] * (n_robots / 30.0)

        if outcome.event_type == "EMERGENCY_STOP_FIRED":
            components["emergency"] = -10.0

        total = sum(components.values())
        return total, components
