
import asyncio
from fastapi import FastAPI
from .cdc.postgres_cdc import AuditCDCStream
from .cdc.chain_verifier import ChainVerifier
from .tuples.assembler import TupleAssembler
from .tuples.reward_calculator import RewardCalculator
from .tuples.feature_extractor import FeatureExtractor
from .replay.prioritized_buffer import PrioritizedReplayBuffer
from .training.trainer import ContinuousLearner
from .evaluation.shadow_eval import ShadowEvaluator
from .evaluation.safety_gate import TrainingSafetyGate
from .deploy.promotion import ModelPromotion
from .observability.audit_back_emit import TrainingAuditBackEmitter
from .config import Settings


from fastapi import BackgroundTasks
from fastapi.responses import JSONResponse

app = FastAPI()

# Global state for admin endpoints (for demo; production should use a service class)
service_state = {
	"buffer": None,
	"trainer": None,
	"last_metrics": {},
	"promotion_result": None,
}

@app.get("/healthz")
def healthz():
	return {"status": "ok"}

@app.get("/buffer/status")
def buffer_status():
	buf = service_state["buffer"]
	if buf is None:
		return JSONResponse({"error": "not initialized"}, status_code=503)
	return {"size": buf.size, "capacity": buf.capacity}

@app.get("/training/metrics")
def training_metrics():
	return service_state["last_metrics"]

@app.post("/model/promote")
async def trigger_promotion():
	# Wire up real shadow eval, safety gate, and promotion logic
	trainer = service_state["trainer"]
	buffer = service_state["buffer"]
	# Dummy candidate/production models and policy gate for demonstration
	candidate_model = trainer.online
	production_model = trainer.target
	class DummyPolicyGate:
		def evaluate(self, action, state):
			return {"allowed": True}
	policy_gate = DummyPolicyGate()
	shadow_eval = ShadowEvaluator(candidate_model, production_model, policy_gate)
	# Simulate shadow evaluation on a batch from the buffer
	if buffer.size < 1000:
		return {"promoted": False, "reason": "not enough data for shadow eval"}
	tuples, _, _ = buffer.sample(min(5000, buffer.size))
	for t in tuples:
		# For demo, use action_features[0] as prod_action, value as prod_value
		state = type('State', (), {"timestamp": t.decision_ts, "__dict__": {}})()
		prod_action = t.action_features[0] if t.action_features else 0
		prod_value = t.reward
		await shadow_eval.evaluate_decision(state, prod_action, prod_value)
	report = shadow_eval.promotion_report()
	# Safety gate
	safety_gate = TrainingSafetyGate()
	safety_result = safety_gate.gate(report)
	# Promotion (dummy manifest path, audit emitter, optimizer client)
	from pathlib import Path
	class DummyAuditEmitter:
		async def emit(self, event):
			pass
	class DummyOptimizerClient:
		async def reload_model(self, version):
			pass
	promotion = ModelPromotion(Path("/tmp/model_manifest.json"), DummyAuditEmitter(), DummyOptimizerClient())
	result = await promotion.promote("candidate_version_1", report, safety_result)
	service_state["promotion_result"] = result
	return result

# Main service loop (to be run as a background task)
async def main():
	cfg = Settings()
	cdc = AuditCDCStream(cfg.postgres_dsn)
	verifier = ChainVerifier(cfg.audit_hmac_key.encode())
	features = FeatureExtractor(cfg.fleet_state_store_url)
	reward_calc = RewardCalculator()
	assembler = TupleAssembler(reward_calc, features)
	buffer = PrioritizedReplayBuffer(capacity=cfg.replay_capacity)
	trainer = ContinuousLearner(state_dim=cfg.state_dim, action_dim=cfg.action_dim)
	audit_back = TrainingAuditBackEmitter(audit_emitter=cfg.audit_client)
	service_state["buffer"] = buffer
	service_state["trainer"] = trainer

	async def ingest():
		async for tup in assembler.process(cdc.stream()):
			buffer.add(tup, td_error=1.0)

	async def train():
		while True:
			if buffer.size > 1000:
				metrics = trainer.train_step(buffer, batch_size=256)
				service_state["last_metrics"] = metrics
				await audit_back.emit_training_step(trainer.steps, metrics)
			await asyncio.sleep(0.05)

	async def evaluate_and_promote():
		while True:
			await asyncio.sleep(cfg.evaluation_interval_s)
			# … shadow eval, safety gate, promotion

	await asyncio.gather(ingest(), train(), evaluate_and_promote())

if __name__ == "__main__":
	asyncio.run(main())
