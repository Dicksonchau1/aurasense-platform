-- Migration for service bay tables
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY,
  robot_id UUID NOT NULL,
  module TEXT NOT NULL,
  severity TEXT,
  predicted_failure_in_hours INT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS technicians (
  id UUID PRIMARY KEY,
  name TEXT,
  certifications TEXT[]
);

CREATE TABLE IF NOT EXISTS parts (
  sku TEXT PRIMARY KEY,
  quantity INT,
  site TEXT
);

CREATE TABLE IF NOT EXISTS service_events (
  id UUID PRIMARY KEY,
  request_id UUID NOT NULL,
  state TEXT,
  timestamp TIMESTAMP,
  technician_id UUID,
  photo_hash TEXT
);
