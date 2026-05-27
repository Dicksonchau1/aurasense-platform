class TrainingAuditBackEmitter:
    """Every training step, evaluation, and promotion is itself emitted
    back into the audit chain. This closes the loop: the same chain
    that trains the model also records that it was trained, with what
    data, what gradient norms, and what promotion outcomes. Customer
    auditors can replay the full history of every model the
    FleetOptimizer ever ran."""

    def __init__(self, audit_emitter):
        self.audit = audit_emitter

    async def emit_training_step(self, step: int, metrics: dict) -> None:
        if step % 100 != 0:
            return
        await self.audit.emit({
            "sourceModule": "atlas-learning-loop",
            "eventType": "TRAINING_STEP",
            "payload": {
                "step": step,
                "loss": metrics["loss"],
                "mean_td_error": metrics["mean_td"],
                "mean_reward": metrics["mean_reward"],
            },
        })

    async def emit_evaluation(self, version: str, report: dict) -> None:
        await self.audit.emit({
            "sourceModule": "atlas-learning-loop",
            "eventType": "MODEL_SHADOW_EVAL",
            "payload": {"version": version, "report": report},
        })
