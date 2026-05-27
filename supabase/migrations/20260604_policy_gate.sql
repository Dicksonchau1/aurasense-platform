-- Migration for policy_gate table
CREATE TABLE IF NOT EXISTS policy_gate (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id TEXT NOT NULL,
    correlation_id TEXT NOT NULL,
    agent JSONB NOT NULL,
    proposed_action JSONB NOT NULL,
    scene_context JSONB NOT NULL,
    outcome TEXT NOT NULL,
    conditions JSONB,
    triggered_rules JSONB,
    critic_score FLOAT,
    evidence_pack_uri TEXT,
    signature TEXT,
    chain_head TEXT,
    evaluated_at TIMESTAMP,
    latency_ms INTEGER
);
