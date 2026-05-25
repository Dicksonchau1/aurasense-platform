import json, os
from threading import Lock

class TelemetryWriter:
    def __init__(self, out_path, run_id, path_label, schema_version="1.0"):
        self.out_path = out_path
        self.run_id = run_id
        self.path_label = path_label
        self.schema_version = schema_version
        self._lock = Lock()
        self._file = open(out_path, "a", buffering=1)
        self._minute_idx = 0
    def write(self, metrics: dict):
        record = {
            "schema_version": self.schema_version,
            "run_id": self.run_id,
            "minute_idx": self._minute_idx,
            "metrics": metrics,
            "path": self.path_label
        }
        with self._lock:
            self._file.write(json.dumps(record) + "\n")
            self._file.flush()
            os.fsync(self._file.fileno())
            self._minute_idx += 1
    def close(self):
        with self._lock:
            self._file.close()
