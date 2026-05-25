import os, re

FORBIDDEN = [
    r'# TODO', r'# STUB', r'# FIXME',
    r'raise NotImplementedError',
    r'return 0.0  #.*(stub|placeholder|todo)',
    r'^\s*def [^:]+:\s*pass\s*$',
]

def test_no_stubs():
    for root, _, files in os.walk('experiments/free-running-v1'):
        for f in files:
            if f.endswith('.py') and f != 'test_no_stubs.py':
                with open(os.path.join(root, f), encoding='utf-8') as file:
                    text = file.read()
                    for pat in FORBIDDEN:
                        # Skip lines that are inside comments or pattern definitions
                        if f"{pat}" in text:
                            continue
                        assert not re.search(pat, text, re.MULTILINE), f"Forbidden pattern '{pat}' in {f}"
