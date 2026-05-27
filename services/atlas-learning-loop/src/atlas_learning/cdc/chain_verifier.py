from typing import Iterable
import hashlib
import hmac

class ChainVerifier:
    """Refuses to forward events into the training pipeline if the
    audit chain is broken. This is the integrity gate that keeps
    poisoned data out of model training — critical defense against
    a tamper attempt that targets the learning loop."""

    def __init__(self, hmac_key: bytes):
        self.hmac_key = hmac_key

    def verify_batch(self, events: Iterable[dict], expected_prev_hash: str) -> dict:
        prev = expected_prev_hash
        for i, e in enumerate(events):
            if e["prev_chain_hash"] != prev:
                return {"valid": False, "break_index": i,
                        "reason": "prev_hash_mismatch"}
            recomputed = self._hash(prev, e)
            if recomputed != e["chain_hash"]:
                return {"valid": False, "break_index": i,
                        "reason": "chain_hash_recompute_mismatch"}
            prev = e["chain_hash"]
        return {"valid": True, "last_hash": prev}

    def _hash(self, prev_hash: str, event: dict) -> str:
        body = (prev_hash + event["event_id"] + event["event_type"]
                + str(event["payload"])).encode()
        return hmac.new(self.hmac_key, body, hashlib.sha256).hexdigest()
