import os
from lib.telemetry import TelemetryWriter

def test_telemetry(tmp_path):
    path = tmp_path / "telemetry.jsonl"
    writer = TelemetryWriter(str(path), run_id="test", path_label="A")
    for i in range(100):
        writer.write({"m": i})
    writer.close()
    with open(path) as f:
        lines = f.readlines()
    assert len(lines) == 100
