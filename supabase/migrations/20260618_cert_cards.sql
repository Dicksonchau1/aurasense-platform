-- Migration for cert_cards table
CREATE TABLE IF NOT EXISTS cert_cards (
    cert_id TEXT PRIMARY KEY,
    skill_id TEXT,
    skill_version INT,
    embodiment_class TEXT,
    scope TEXT,
    site_id TEXT,
    metrics JSONB,
    evidence_pack_uris JSONB,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    revoked_at TIMESTAMP,
    revocation_reason TEXT,
    issuer TEXT,
    signature TEXT,
    chain_head TEXT
);
