# ATLAS API integration notes

This integration pass maps the frontend to the provided AuraSense Rehearse-3D OpenAPI contract.

## Wired endpoints

- GET /buildings
- GET /buildings/{mbis_id}
- POST /missions
- POST /missions/validate
- GET /missions/{mission_id}
- GET /ai/model-info
- GET /weather/current

## Frontend mapping

- ATLAS “worlds” now map to MBIS buildings.
- World detail now maps to a building workspace.
- Trigger/run behavior is adapted into mission planning and mission creation.

## Environment

Set NEXT_PUBLIC_API_BASE_URL to one of:
- https://api.aurasensehk.com/v1
- https://staging.api.aurasensehk.com/v1
- http://localhost:8000/v1

## Important note

The current ATLAS v0 shell originally assumed generic worlds/agents/runs. This pass adapts it to the actual Rehearse-3D API contract instead of inventing endpoints.
