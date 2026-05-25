import numpy as np
from . import substrate_io

# M1: substrate_io.reflex_latency_p99_ms
# M2: substrate_io.current_layer_admission
# M3: substrate_io.weight_delta_magnitude
# M4: discrete mutual information over envelope_action_pairs
# M5: AuditChainLogger.verify_coverage().coverage_fraction

def compute_metrics(substrate, audit_logger, envelope_action_pairs):
    m1 = substrate_io.reflex_latency_p99_ms([] if substrate is None else substrate)
    m2 = substrate_io.current_layer_admission({} if substrate is None else substrate)
    m3 = substrate_io.weight_delta_magnitude([0], [0]) if substrate is None else substrate_io.weight_delta_magnitude(substrate)
    m4 = mutual_information(envelope_action_pairs or [(0,0)])
    m5 = 1.0 if audit_logger is None else audit_logger.verify_coverage(0, 1e12)["coverage_fraction"]
    return {"m1": m1, "m2": m2, "m3": m3, "m4": m4, "m5": m5}

def mutual_information(pairs):
    if not pairs:
        return 0.0
    env, act = zip(*pairs)
    h, _, _ = np.histogram2d(env, act, bins=20)
    pxy = h / np.sum(h)
    px = np.sum(pxy, axis=1)
    py = np.sum(pxy, axis=0)
    px_py = px[:, None] * py[None, :]
    nz = pxy > 0
    mi = np.sum(pxy[nz] * np.log(pxy[nz] / px_py[nz]))
    return float(mi)
