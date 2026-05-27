-- Migration for training_runs table
CREATE TABLE IF NOT EXISTS training_runs (
    run_id UUID PRIMARY KEY,
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    dataset_id UUID,
    metrics JSONB
);
