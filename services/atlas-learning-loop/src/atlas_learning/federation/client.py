import torch
import httpx
from opacus.accountants.utils import get_noise_multiplier

class FederatedLearningClient:
    """Wraps the value head's training updates into DP-noised gradients
    submitted to the same nepa-federated aggregator service from prior
    specs. Allows cross-tenant scheduling improvement without raw
    audit-event egress."""

    def __init__(self, aggregator_url: str, tenant_id: str,
                 robot_cert: str, ca_cert: str,
                 epsilon: float = 1.0, delta: float = 1e-5,
                 max_grad_norm: float = 1.0):
        self.aggregator_url = aggregator_url
        self.tenant_id = tenant_id
        self.robot_cert = robot_cert
        self.ca_cert = ca_cert
        self.epsilon = epsilon
        self.delta = delta
        self.max_grad_norm = max_grad_norm

    async def submit_update(self, model: torch.nn.Module,
                            n_local_steps: int) -> dict:
        noise = get_noise_multiplier(
            target_epsilon=self.epsilon, target_delta=self.delta,
            sample_rate=1.0, steps=n_local_steps)
        update = {}
        for name, p in model.named_parameters():
            if p.grad is None:
                continue
            torch.nn.utils.clip_grad_norm_([p], self.max_grad_norm)
            n = torch.randn_like(p.grad) * noise * self.max_grad_norm
            update[name] = (p.grad + n).cpu()
        blob = self._serialize(update)
        async with httpx.AsyncClient(verify=self.ca_cert,
                                      cert=self.robot_cert) as http:
            r = await http.post(
                f"{self.aggregator_url}/v1/updates",
                headers={
                    "X-Tenant-Id": self.tenant_id,
                    "X-Robot-Id": "fleet-optimizer",
                    "X-Sample-Count": str(n_local_steps),
                    "X-Local-Loss": "0.0",
                },
                files={"blob": ("update.pt", blob,
                                "application/octet-stream")},
            )
            return r.json()

    @staticmethod
    def _serialize(update: dict) -> bytes:
        import io
        buf = io.BytesIO()
        torch.save(update, buf)
        return buf.getvalue()
