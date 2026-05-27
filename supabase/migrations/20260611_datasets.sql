-- Migration for datasets table
CREATE TABLE IF NOT EXISTS datasets (
    dataset_id UUID PRIMARY KEY,
    name TEXT,
    description TEXT,
    created_at TIMESTAMP,
    episode_ids UUID[]
);
