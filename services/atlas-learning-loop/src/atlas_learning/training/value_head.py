import torch
import torch.nn as nn

class FleetValueHead(nn.Module):
    """Q(s, a) head consumed by the FleetOptimizer's MDP scheduler.
    Distributional output (C51-style) for better uncertainty handling
    on rare events like emergency stops and SLA breaches."""

    def __init__(self, state_dim: int, action_dim: int,
                 n_atoms: int = 51, v_min: float = -20.0, v_max: float = 20.0):
        super().__init__()
        self.n_atoms = n_atoms
        self.support = torch.linspace(v_min, v_max, n_atoms)
        self.delta_z = (v_max - v_min) / (n_atoms - 1)
        self.net = nn.Sequential(
            nn.Linear(state_dim + action_dim, 512), nn.GELU(), nn.LayerNorm(512),
            nn.Linear(512, 512), nn.GELU(), nn.LayerNorm(512),
            nn.Linear(512, 256), nn.GELU(),
            nn.Linear(256, n_atoms),
        )

    def forward(self, state: torch.Tensor, action: torch.Tensor) -> torch.Tensor:
        x = torch.cat([state, action], dim=-1)
        logits = self.net(x)
        return torch.softmax(logits, dim=-1)

    def expected_value(self, state: torch.Tensor, action: torch.Tensor) -> torch.Tensor:
        probs = self.forward(state, action)
        return (probs * self.support.to(probs.device)).sum(dim=-1)
