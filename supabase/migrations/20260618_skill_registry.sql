-- Migration for skill_registry table
CREATE TABLE IF NOT EXISTS skill_registry (
    skill_id TEXT PRIMARY KEY,
    version INT,
    semver TEXT,
    parent_version INT,
    author_tenant_id TEXT,
    capabilities JSONB,
    supported_embodiments JSONB,
    constraints JSONB,
    model_artifacts JSONB,
    retargeting_profile JSONB,
    training_provenance JSONB,
    certifications JSONB,
    signature TEXT,
    chain_head TEXT,
    published_at TIMESTAMP
);
