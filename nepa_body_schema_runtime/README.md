# NEPA Body-Schema Norse/snnTorch Runtime

Python FastAPI microservice for LIF + reservoir + reward-modulated STDP using Norse/snnTorch.

## Endpoints
- `POST /ingest` — Ingest a telemetry frame
- `GET /embedding` — Get current embedding vector

## Install
```
pip install -r requirements.txt
```

## Run
```
uvicorn api:app --reload
```
