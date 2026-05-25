import json, tempfile, os
from scripts.analyse import main as analyse_main

def test_analyse(tmp_path, monkeypatch):
    # Create fake telemetry logs
    for d in ['baseline', 'window', 'measurement']:
        dir_path = tmp_path / d
        os.makedirs(dir_path)
        with open(dir_path / 'telemetry.jsonl', 'w') as f:
            for i in range(5):
                f.write(json.dumps({"path": "A", "m1": 1, "m2": 2, "m3": 3, "m4": 4, "m5": 5}) + '\n')
    monkeypatch.chdir(tmp_path)
    monkeypatch.setattr('argparse.ArgumentParser.parse_args', lambda self: type('Args', (), {
        'baseline_dir': str(tmp_path / 'baseline'),
        'window_dir': str(tmp_path / 'window'),
        'measurement_dir': str(tmp_path / 'measurement')
    })())
    analyse_main()
    assert os.path.exists('analysis_result.json')
