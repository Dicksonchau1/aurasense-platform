import argparse
from lib.input_source import make_source
from lib.telemetry import TelemetryWriter
from lib.snapshot import WeightSnapshotter
from lib.audit import AuditChainLogger
from lib.metrics import compute_metrics
import os, time, signal, sys

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--path', choices=['a', 'b'], required=True)
    parser.add_argument('--baseline-dir', required=True)
    parser.add_argument('--world-id', default=None)
    args = parser.parse_args()
    out_dir = f"window/{int(time.time())}"
    os.makedirs(out_dir, exist_ok=True)
    source = make_source(args.path, world_id=args.world_id) if args.path == 'b' else make_source(args.path)
    telemetry = TelemetryWriter(os.path.join(out_dir, 'telemetry.jsonl'), run_id=out_dir, path_label=args.path.upper())
    audit = AuditChainLogger(os.path.join(out_dir, 'audit.jsonl'))
    snapshotter = WeightSnapshotter(out_dir, substrate=None)
    def handle_abort(signum, frame):
        with open(os.path.join(out_dir, 'window_aborted.json'), 'w') as f:
            f.write('{"elapsed_seconds": %d, "reason": "signal"}' % int(time.time()))
        telemetry.close()
        audit.close()
        source.close()
        sys.exit(2)
    signal.signal(signal.SIGINT, handle_abort)
    signal.signal(signal.SIGTERM, handle_abort)
    # 72-hour driver
    start = time.monotonic()
    for tick in range(72*60):
        metrics = compute_metrics(None, audit, [])
        telemetry.write(metrics)
        if tick % (6*60) == 0:
            snapshotter.force_snapshot(f"tick{tick//60}")
        time.sleep(60)
    snapshotter.force_snapshot("final")
    telemetry.close()
    audit.close()
    source.close()
if __name__ == "__main__":
    main()
