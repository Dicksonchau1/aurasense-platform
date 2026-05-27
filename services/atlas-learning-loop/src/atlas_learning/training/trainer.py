import torch
import torch.nn.functional as F
from .value_head import FleetValueHead
from ..replay.prioritized_buffer import PrioritizedReplayBuffer

class ContinuousLearner:
    """Off-policy distributional Q-learning trainer. Pulls from the
    replay buffer, updates priorities by TD error, and emits
    checkpoints for shadow evaluation before any production swap."""

    def __init__(self, state_dim: int, action_dim: int, device: str = "cuda"):
        self.online = FleetValueHead(state_dim, action_dim).to(device)
        self.target = FleetValueHead(state_dim, action_dim).to(device)
        self.target.load_state_dict(self.online.state_dict())
        self.opt = torch.optim.AdamW(self.online.parameters(), lr=3e-4)
        self.gamma = 0.99
        self.device = device
        self.steps = 0

    def train_step(self, buffer: PrioritizedReplayBuffer, batch_size: int = 256) -> dict:
        tuples, idx, is_weights = buffer.sample(batch_size)

        s  = torch.tensor([t.state_features      for t in tuples],
                          dtype=torch.float32, device=self.device)
        a  = torch.tensor([t.action_features     for t in tuples],
                          dtype=torch.float32, device=self.device)
        r  = torch.tensor([t.reward              for t in tuples],
                          dtype=torch.float32, device=self.device)
        s2 = torch.tensor([t.next_state_features for t in tuples],
                          dtype=torch.float32, device=self.device)
        done = torch.tensor([float(t.is_terminal) for t in tuples],
                            dtype=torch.float32, device=self.device)
        w  = torch.tensor(is_weights, dtype=torch.float32, device=self.device)

        with torch.no_grad():
            next_v = self.target.expected_value(s2, a)
            target_value = r + self.gamma * (1 - done) * next_v

        pred_dist = self.online(s, a)
        pred_value = (pred_dist * self.online.support.to(self.device)).sum(dim=-1)
        td = target_value - pred_value
        loss = (w * F.smooth_l1_loss(pred_value, target_value, reduction='none')).mean()

        self.opt.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(self.online.parameters(), 5.0)
        self.opt.step()

        buffer.update_priorities(idx, td.abs().detach().cpu().numpy())

        self.steps += 1
        if self.steps % 1000 == 0:
            self._soft_update_target(tau=0.005)

        return {
            "loss": loss.item(),
            "mean_td": td.abs().mean().item(),
            "mean_reward": r.mean().item(),
        }

    def _soft_update_target(self, tau: float) -> None:
        for tp, op in zip(self.target.parameters(), self.online.parameters()):
            tp.data.mul_(1 - tau).add_(op.data, alpha=tau)
