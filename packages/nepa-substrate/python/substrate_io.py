"""
substrate_io: I/O helpers for substrate lifecycle and envelope streaming.
"""
from typing import Callable
from substrate import Substrate, SubstrateConfig
from envelope import Envelope
import json

def load_substrate(config_path: str) -> Substrate:
    with open(config_path, 'r') as f:
        config_data = json.load(f)
    config = SubstrateConfig(**config_data)
    return Substrate(config)

def save_snapshot(substrate: Substrate, snapshot_path: str) -> None:
    # Save weights and layer state
    substrate.export_weights(snapshot_path + ".weights.npy")
    # Could extend to save more state

def load_snapshot(substrate: Substrate, snapshot_path: str) -> None:
    substrate.import_weights(snapshot_path + ".weights.npy")

def stream_envelopes(substrate: Substrate, handler: Callable) -> None:
    # Example: subscribe to envelope stream
    stream = EnvelopeStream()
    stream.subscribe(handler)
