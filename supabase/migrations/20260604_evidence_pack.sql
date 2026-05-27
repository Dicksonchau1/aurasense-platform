-- Migration for evidence_packs table
CREATE TABLE IF NOT EXISTS evidence_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id TEXT NOT NULL,
    correlation_id TEXT NOT NULL,
    chain_head TEXT NOT NULL,
    inputs JSONB NOT NULL,
    rule_hits JSONB,
    critic_trace JSONB,
    outcome TEXT NOT NULL,
    conditions JSONB,
    model_cards JSONB,
    body_schema_version TEXT,
    firmware_version TEXT,
    signatures JSONB,
    created_at TIMESTAMP DEFAULT now()
);
