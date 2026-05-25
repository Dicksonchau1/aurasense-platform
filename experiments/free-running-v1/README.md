# NEPA Free-Running Learning Loop v1

## Overview
This package implements dual-path free-running learning experiments for NEPA:
- **Path A:** Jetson + camera/microphone in a real Kowloon room
- **Path B:** NEPA ↔ ATLAS virtual-world deployment

Both paths share telemetry, audit, snapshot, metrics, and analysis code, producing identically-shaped outputs for direct comparison.

## Usage

### Path A (Jetson + camera, Kowloon room)
```sh
python scripts/run_baseline.py --path a
python scripts/run_window.py --path a --baseline-dir baseline/<ts>/
python scripts/run_measurement.py --path a --baseline-dir baseline/<ts>/ --window-dir window/<ts>/
python scripts/analyse.py --baseline-dir … --window-dir … --measurement-dir …
```

### Path B (ATLAS virtual world)
```sh
python scripts/run_baseline.py --path b --world-id quiet_room_v1
python scripts/run_window.py --path b --baseline-dir baseline/<ts>/ --world-id quiet_room_v1
python scripts/run_measurement.py --path b --baseline-dir … --window-dir … --world-id quiet_room_v1
python scripts/analyse.py --baseline-dir … --window-dir … --measurement-dir …
```

## Path Selection
- **Path A:** Most honest real-world test (Jetson hardware, real sensors)
- **Path B:** Controlled experimental isolation (ATLAS rehearse world, for simulation and repeatability)

Choose Path A for real-world deployment and Path B for controlled experiments once ATLAS integration is available.
