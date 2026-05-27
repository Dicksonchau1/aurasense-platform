import asyncio
import json
from pathlib import Path

class ModelPromotion:
    """Atomic model swap with audit emission and instant rollback path.
    The version manifest is the single source of truth for which
    model weights the FleetOptimizer is currently using."""

    def __init__(self, manifest_path: Path, audit_emitter, optimizer_client):
        self.manifest_path = manifest_path
        self.audit = audit_emitter
        self.optimizer = optimizer_client

    async def promote(self, candidate_version: str,
                      shadow_report: dict, safety_gate_result: dict) -> dict:
        if not safety_gate_result["allow_promotion"]:
            await self.audit.emit({
                "sourceModule": "atlas-learning-loop",
                "eventType": "MODEL_PROMOTION_DENIED",
                "payload": {"version": candidate_version,
                            "reason": safety_gate_result["reason"]},
            })
            return {"promoted": False}

        prev = self._read_manifest()
        new_manifest = {
            "active_version": candidate_version,
            "previous_version": prev["active_version"],
            "promoted_at": asyncio.get_event_loop().time(),
            "shadow_report": shadow_report,
        }
        await self.audit.emit({
            "sourceModule": "atlas-learning-loop",
            "eventType": "MODEL_PROMOTION_APPROVED",
            "payload": {
                "from_version": prev["active_version"],
                "to_version": candidate_version,
                "shadow_report": shadow_report,
            },
        })
        self._write_manifest(new_manifest)
        await self.optimizer.reload_model(candidate_version)
        await self.audit.emit({
            "sourceModule": "atlas-learning-loop",
            "eventType": "MODEL_PROMOTION_COMPLETED",
            "payload": {"active_version": candidate_version},
        })
        return {"promoted": True, "manifest": new_manifest}

    async def rollback(self, reason: str) -> dict:
        m = self._read_manifest()
        prev = m["previous_version"]
        if prev is None:
            return {"rolled_back": False, "reason": "no_previous_version"}
        await self.audit.emit({
            "sourceModule": "atlas-learning-loop",
            "eventType": "MODEL_ROLLBACK",
            "payload": {"from": m["active_version"], "to": prev,
                        "reason": reason},
        })
        new_manifest = {
            "active_version": prev,
            "previous_version": m["active_version"],
            "rolled_back_at": asyncio.get_event_loop().time(),
            "rollback_reason": reason,
        }
        self._write_manifest(new_manifest)
        await self.optimizer.reload_model(prev)
        return {"rolled_back": True, "active_version": prev}

    def _read_manifest(self) -> dict:
        if not self.manifest_path.exists():
            return {"active_version": None, "previous_version": None}
        return json.loads(self.manifest_path.read_text())

    def _write_manifest(self, m: dict) -> None:
        tmp = self.manifest_path.with_suffix(".tmp")
        tmp.write_text(json.dumps(m, indent=2))
        tmp.replace(self.manifest_path)
