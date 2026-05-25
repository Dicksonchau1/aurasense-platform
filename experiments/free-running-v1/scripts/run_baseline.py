import argparse
from lib.input_source import make_source
from lib.telemetry import TelemetryWriter
from lib.snapshot import WeightSnapshotter
from lib.metrics import compute_metrics
from lib.synthetic_stream import synthetic_envelope_stream
import os, time

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--path', choices=['a', 'b'], required=True)
    parser.add_argument('--world-id', default=None)
    parser.add_argument('--output-dir', default=None)
    args = parser.parse_args()
    out_dir = args.output_dir or f"baseline/{int(time.time())}"
    os.makedirs(out_dir, exist_ok=True)
    source = make_source(args.path, world_id=args.world_id) if args.path == 'b' else make_source(args.path)
    telemetry = TelemetryWriter(os.path.join(out_dir, 'telemetry.jsonl'), run_id=out_dir, path_label=args.path.upper())
    snapshotter = WeightSnapshotter(out_dir, substrate=None)  # substrate to be loaded as needed
    # B1: synthetic stream through frozen substrate
    for env in synthetic_envelope_stream():
        # ...process env through substrate, collect metrics...
        pass
    # B3: 30 min frozen-weights operation, 1 telemetry record per minute
    for minute in range(30):
        metrics = compute_metrics(None, None, [])  # real substrate, audit_logger, pairs
        telemetry.write(metrics)
        time.sleep(60)
    snapshotter.force_snapshot("baseline")
    telemetry.close()
    source.close()
if __name__ == "__main__":
    main()
