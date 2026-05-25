import hashlib, json, os
from threading import Lock

class AuditChainLogger:
    def __init__(self, out_path):
        self.out_path = out_path
        self._lock = Lock()
        self._file = open(out_path, "a", buffering=1)
        self._last_hash = None
        self._records = []
    def log(self, event: dict):
        record = json.dumps(event)
        h = hashlib.sha256((record + (self._last_hash or "")).encode()).hexdigest()
        chain_record = {"event": event, "hash": h}
        with self._lock:
            self._file.write(json.dumps(chain_record) + "\n")
            self._file.flush()
            os.fsync(self._file.fileno())
            self._last_hash = h
            self._records.append((event, h))
    def verify_coverage(self, start_ts, end_ts, max_gap_s=60.0):
        times = [e[0]["timestamp"] for e in self._records if "timestamp" in e[0]]
        if not times:
            return {"covered": False, "coverage_fraction": 0.0, "gap_count": 0, "gaps": []}
        times.sort()
        gaps = []
        for i in range(1, len(times)):
            gap = times[i] - times[i-1]
            if gap > max_gap_s:
                gaps.append((times[i-1], times[i]))
        covered = times[0] <= start_ts and times[-1] >= end_ts and not gaps
        coverage_fraction = (end_ts - start_ts - sum(g[1]-g[0] for g in gaps)) / (end_ts - start_ts)
        return {"covered": covered, "coverage_fraction": coverage_fraction, "gap_count": len(gaps), "gaps": gaps}
    def close(self):
        with self._lock:
            self._file.close()
