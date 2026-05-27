-- Migration: Create body_schema_states table for NEPA body-schema
CREATE TABLE IF NOT EXISTS body_schema_states (
  robot_id TEXT NOT NULL,
  ts BIGINT NOT NULL,
  schema_version INTEGER NOT NULL,
  embedding BYTEA NOT NULL,
  recommended_action TEXT NOT NULL,
  per_joint JSONB NOT NULL,
  plasticity JSONB NOT NULL,
  PRIMARY KEY (robot_id, ts)
);

CREATE INDEX IF NOT EXISTS idx_body_schema_states_robot_id_ts_desc
  ON body_schema_states (robot_id, ts DESC);

CREATE INDEX IF NOT EXISTS idx_body_schema_states_action
  ON body_schema_states (recommended_action)
  WHERE recommended_action != 'NONE';
