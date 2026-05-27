# NEPA Runtime — gRPC server (Jetson)

Real perception backend for AuraSense. Speaks the same `nepa.v1` proto
that the Next.js bridge expects, so flipping `NEPA_RUNTIME_MODE=grpc`
swaps the mock adapter for actual silicon with zero application changes.

## Quick start (Jetson Nano, JetPack 4.6+)

    cd ~/aurasense-playground/nepa_runtime
    make install       # pip install + proto-gen
    make run           # gRPC server on :50051

You should see:

    [NEPA] backend ready: jetson-nano-null
    [NEPA] gRPC listening on :50051 · workers=4 · pid=...

## Smoke test (separate terminal)

    make smoke

Expected: Health response + InferFrame result + 3 anomaly events.

## Wire to Next.js bridge

In `~/aurasense-playground/.env.local`:

    NEPA_RUNTIME_MODE=grpc
    NEPA_RUNTIME_GRPC=localhost:50051

Restart `pnpm dev`, then:

    curl -s http://localhost:3000/api/_status | jq '.runtime'

Should show:

    {
      "adapter": "grpc",
      "mode": "grpc",
      "grpc_addr": "localhost:50051",
      "health": { "ok": true, "runtime": "jetson-nano-null", ... }
    }

Now click any frame in the browser — inference goes through gRPC to this
process. Check this terminal's logs to see real requests landing.

## Switch backends

| Backend | How | Best for |
|---|---|---|
| `null`     | `NEPA_BACKEND=null` (default)            | Wiring tests, no model needed |
| `onnx`     | `NEPA_BACKEND=onnx` + ONNX file          | Cross-platform, easy iteration |
| `tensorrt` | `NEPA_BACKEND=tensorrt` + .engine file   | Jetson native, lowest latency |

Drop your model in `models/`, then:

    NEPA_BACKEND=onnx     NEPA_MODEL_PATH=models/nepa_frame.onnx     make run
    # or build a TRT engine first:
    /usr/src/tensorrt/bin/trtexec --onnx=models/nepa_frame.onnx \
      --saveEngine=models/nepa_frame.engine --fp16
    NEPA_BACKEND=tensorrt NEPA_MODEL_PATH=models/nepa_frame.engine make run

## Run as a service (survives reboot)

    make systemd
    make journal       # tail logs

## Privacy invariants

- No facial recognition, no biometric embeddings, no person re-identification
- `image_jpeg` payloads processed in-memory only — never persisted on the edge
- Audit + storage happen on the Next.js side (Supabase) — runtime stays stateless
- Anomaly stream emits prediction-error spikes only, never identity

## File layout

    nepa_runtime/
    ├── backend.py           # abstract Backend + NullBackend
    ├── onnx_backend.py      # OnnxBackend (CUDA → CPU fallback)
    ├── trt_backend.py       # TrtBackend (Jetson-native fastest path)
    ├── anomaly_queue.py     # per-user bounded anomaly queues
    ├── server.py            # gRPC service implementation
    ├── nepa_pb2.py          # generated
    └── nepa_pb2_grpc.py     # generated
    proto/nepa.proto         # mirror of ../src/proto/nepa.proto
    scripts/
    ├── install.sh           # pip + proto-gen
    ├── gen_proto.sh
    ├── run.sh
    ├── smoke.py             # gRPC smoke test
    ├── install-systemd.sh
    └── nepa-runtime.service
    tests/test_backend.py    # pytest sanity
    Makefile                 # install/run/smoke/test/systemd/journal/stop

## Make targets

    make install     # pip install + generate proto
    make run         # start gRPC server (foreground)
    make smoke       # run gRPC client smoke test
    make test        # pytest unit tests
    make systemd     # install systemd unit + start
    make journal     # tail systemd logs
    make stop        # stop systemd service
    make clean       # remove generated proto stubs + __pycache__

---

## Substrate HTTP Server (PR D-4)

The substrate is a sibling FastAPI service that exposes the three endpoints `SubstrateClient.ts` calls. It runs alongside the gRPC inference server.

### Run

```bash
# Install substrate deps (additive to existing requirements)
pip install -r requirements.txt

# Boot substrate on :8080
bash scripts/run_substrate.sh

# Or with hot-reload for dev
NEPA_SUBSTRATE_RELOAD=1 bash scripts/run_substrate.sh
```

### Endpoints

- `GET  /substrate/run_id` — returns the singleton run_id for this process
- `POST /substrate/priors` — load signature_map priors as channel initial state
- `POST /substrate/envelope` — submit a ShapeOfChangeEnvelope, receive action list
- `GET  /health` — substrate liveness + tick count + dopamine level
- `GET  /substrate/state` — full state dump (debug only)

### Environment

| Var | Default | Purpose |
|---|---|---|
| `NEPA_SUBSTRATE_PORT` | `8080` | HTTP port |
| `NEPA_SUBSTRATE_HOST` | `0.0.0.0` | Bind host |
| `NEPA_SUBSTRATE_RUN_ID` | UUID4 | Override singleton run_id (for tests) |
| `NEPA_SUBSTRATE_RELOAD` | unset | Enable uvicorn --reload |

### Systemd

```bash
sudo cp scripts/nepa-substrate.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable nepa-substrate
sudo systemctl start nepa-substrate
sudo systemctl status nepa-substrate
```
