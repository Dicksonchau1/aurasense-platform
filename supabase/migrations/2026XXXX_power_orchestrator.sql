-- Migration for power orchestrator tables
CREATE TABLE IF NOT EXISTS batteries (
  id UUID PRIMARY KEY,
  soc FLOAT NOT NULL,
  voltage FLOAT NOT NULL,
  location TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS charging_bays (
  id UUID PRIMARY KEY,
  occupied BOOLEAN NOT NULL,
  reserved_by UUID,
  last_swap_time TIMESTAMP
);

CREATE TABLE IF NOT EXISTS swap_events (
  id UUID PRIMARY KEY,
  robot_id UUID NOT NULL,
  battery_id UUID NOT NULL,
  bay_id UUID NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  event_type TEXT,
  details TEXT
);
