
# Substrate IO: Canonical implementation using nepa_substrate
import numpy as np
import io
from nepa_substrate import Substrate, PlasticityController, Envelope

def load_substrate(config_path=None):
    # Use canonical substrate loader (config_path optional for now)
    substrate = Substrate(config={})
    substrate.connect()
    return substrate

def freeze_plasticity(substrate):
    # Reset plasticity weights (simulate freezing)
    substrate.get_plasticity_controller().reset()
    return substrate

def enable_plasticity(substrate):
    # No-op: plasticity is enabled by default
    return substrate

def get_weights_blob(substrate):
    # Serialize weights to a blob
    buf = io.BytesIO()
    np.save(buf, substrate.get_plasticity_controller()._weights)
    return buf.getvalue()

def restore_weights_blob(substrate, blob):
    # Restore weights from a blob
    buf = io.BytesIO(blob)
    weights = np.load(buf)
    substrate.get_plasticity_controller()._weights = weights
    return substrate

def reflex_latency_p99_ms(logs):
    # Compute 99th percentile latency from logs (ms)
    if logs is None or not hasattr(logs, '__iter__'):
        return 0.0
    latencies = [entry['latency_ms'] for entry in logs if isinstance(entry, dict) and 'latency_ms' in entry]
    if not latencies:
        return 0.0
    return float(np.percentile(latencies, 99))

def current_layer_admission(substrate):
    # Return current layer admission using canonical API
    return substrate.get_layer_manager().admitted_count

def weight_delta_magnitude(w1, w2):
    # Compute L2 norm between two weight arrays
    arr1 = np.array(w1)
    arr2 = np.array(w2)
    return float(np.linalg.norm(arr1 - arr2))

def envelope_action_pairs(envelopes):
    # Pair envelopes with actions (if Envelope has 'action' attribute)
    return [(env, getattr(env, 'action', None)) for env in envelopes]
