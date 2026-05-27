-- Migration for episodes table
CREATE TABLE IF NOT EXISTS episodes (
    episode_id UUID PRIMARY KEY,
    correlation_id TEXT,
    mission_id UUID,
    agent_id TEXT,
    embodiment_class TEXT,
    skill_invocations JSONB,
    skill_results JSONB,
    telemetry_uri TEXT,
    scene_snapshots_uri TEXT,
    body_schema_trace_uri TEXT,
    policy_decisions UUID[],
    outcome TEXT,
    reward FLOAT,
    human_interventions INT,
    golden_hash TEXT,
    consent_flags JSONB,
    captured_at TIMESTAMP
);
