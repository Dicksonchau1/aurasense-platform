-- ATLAS Flight Stack Database Schema
-- Initialize all tables for drone management, telemetry, and calibration

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- Organizations (Multi-tenancy)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  owner_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT org_name_not_empty CHECK (name != '')
);

-- Users (Authentication & Profile)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'operator',
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_role CHECK (role IN ('admin', 'operator', 'viewer'))
);

-- Drones (Registry)
CREATE TABLE IF NOT EXISTS drones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  model VARCHAR(100),
  serial_number VARCHAR(255) UNIQUE,
  firmware_version VARCHAR(50),
  status VARCHAR(50) DEFAULT 'idle',
  battery_voltage FLOAT DEFAULT 0,
  battery_percentage INT DEFAULT 0,
  gps_status VARCHAR(50) DEFAULT 'no_fix',
  location_lat FLOAT DEFAULT 0,
  location_lon FLOAT DEFAULT 0,
  altitude_m FLOAT DEFAULT 0,
  heading_deg FLOAT DEFAULT 0,
  last_heartbeat TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('idle', 'armed', 'flying', 'error'))
);

-- Sensors (ArduPilot Sensors)
CREATE TABLE IF NOT EXISTS sensors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drone_id UUID REFERENCES drones(id) NOT NULL,
  sensor_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'idle',
  confidence FLOAT DEFAULT 0.0,
  last_calibrated TIMESTAMP,
  calibration_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_sensor_status CHECK (status IN ('idle', 'calibrating', 'calibrated', 'error')),
  CONSTRAINT confidence_range CHECK (confidence >= 0 AND confidence <= 1)
);

-- Sensor Calibration States
CREATE TABLE IF NOT EXISTS calibration_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id UUID REFERENCES sensors(id) NOT NULL,
  step VARCHAR(100),
  step_index INT DEFAULT 0,
  total_steps INT DEFAULT 0,
  progress_percent INT DEFAULT 0,
  temperature_c FLOAT,
  offsets_x FLOAT,
  offsets_y FLOAT,
  offsets_z FLOAT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT progress_range CHECK (progress_percent >= 0 AND progress_percent <= 100)
);

-- Telemetry (Real-time Flight Data)
CREATE TABLE IF NOT EXISTS telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drone_id UUID REFERENCES drones(id) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  latitude FLOAT,
  longitude FLOAT,
  altitude_m FLOAT,
  roll_deg FLOAT,
  pitch_deg FLOAT,
  yaw_deg FLOAT,
  velocity_x FLOAT,
  velocity_y FLOAT,
  velocity_z FLOAT,
  battery_voltage FLOAT,
  battery_current FLOAT,
  battery_percentage INT,
  gps_satellites INT,
  gps_hdop FLOAT,
  accel_x FLOAT,
  accel_y FLOAT,
  accel_z FLOAT,
  gyro_x FLOAT,
  gyro_y FLOAT,
  gyro_z FLOAT,
  system_time_ms BIGINT,
  cpu_load INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Flight Modes
CREATE TABLE IF NOT EXISTS flight_modes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drone_id UUID REFERENCES drones(id) NOT NULL,
  mode_name VARCHAR(50),
  is_active BOOLEAN DEFAULT FALSE,
  armed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Missions
CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  drone_id UUID REFERENCES drones(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  waypoints JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  CONSTRAINT valid_mission_status CHECK (status IN ('draft', 'planned', 'executing', 'completed', 'aborted'))
);

-- Registry (Device & Service Registry)
CREATE TABLE IF NOT EXISTS registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  name VARCHAR(255),
  endpoint VARCHAR(500),
  status VARCHAR(50) DEFAULT 'offline',
  last_seen TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_registry_status CHECK (status IN ('online', 'offline', 'error'))
);

-- Audit Log (Compliance & Tracking)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  action VARCHAR(255),
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_drones_org ON drones(organization_id);
CREATE INDEX IF NOT EXISTS idx_drones_status ON drones(status);
CREATE INDEX IF NOT EXISTS idx_sensors_drone ON sensors(drone_id);
CREATE INDEX IF NOT EXISTS idx_sensors_status ON sensors(status);
CREATE INDEX IF NOT EXISTS idx_telemetry_drone_time ON telemetry(drone_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_calibration_sensor ON calibration_states(sensor_id);
CREATE INDEX IF NOT EXISTS idx_flight_modes_drone ON flight_modes(drone_id);
CREATE INDEX IF NOT EXISTS idx_missions_org ON missions(organization_id);
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_registry_org ON registry(organization_id);
CREATE INDEX IF NOT EXISTS idx_registry_type ON registry(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_org_time ON audit_log(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);

-- Insert Demo Data
INSERT INTO organizations (id, name, slug) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Demo Organization', 'demo-org')
ON CONFLICT DO NOTHING;

INSERT INTO users (id, email, name, role, organization_id) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'demo@atlas.local', 'Demo User', 'admin', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

INSERT INTO drones (id, organization_id, name, model, serial_number, firmware_version, status, battery_voltage, battery_percentage, gps_status, location_lat, location_lon, altitude_m, heading_deg) VALUES 
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'ATLAS-01', 'ArduCopter', 'SN-001', '4.5.0', 'idle', 14.8, 85, 'fix_3d', 22.3193, 114.1694, 0, 0),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'ATLAS-02', 'ArduPlane', 'SN-002', '4.5.0', 'idle', 14.8, 92, 'fix_3d', 22.3195, 114.1696, 0, 0)
ON CONFLICT DO NOTHING;

INSERT INTO sensors (id, drone_id, sensor_type, status, confidence) VALUES 
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000010', 'accelerometer', 'calibrated', 0.98),
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000010', 'gyroscope', 'calibrated', 0.97),
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000010', 'compass', 'calibrated', 0.95),
  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000010', 'barometer', 'calibrated', 0.99)
ON CONFLICT DO NOTHING;

INSERT INTO flight_modes (drone_id, mode_name, is_active, armed) VALUES 
  ('00000000-0000-0000-0000-000000000010', 'STABILIZE', true, false),
  ('00000000-0000-0000-0000-000000000010', 'ALT_HOLD', false, false),
  ('00000000-0000-0000-0000-000000000010', 'AUTO', false, false),
  ('00000000-0000-0000-0000-000000000010', 'RTH', false, false)
ON CONFLICT DO NOTHING;

INSERT INTO registry (organization_id, resource_type, resource_id, name, endpoint, status) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'drone', 'ATLAS-01', 'ATLAS Drone 01', '192.168.1.100:14550', 'offline'),
  ('00000000-0000-0000-0000-000000000001', 'gateway', 'GW-001', 'Ground Station Gateway', '192.168.1.50:5760', 'offline')
ON CONFLICT DO NOTHING;

-- Enable RLS (Row Level Security)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drones ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view their organization" ON users
  FOR SELECT USING (auth.uid()::text = id::text OR organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()::uuid
  ));

CREATE POLICY "Users can view drones in their organization" ON drones
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()::uuid
  ));

CREATE POLICY "Users can view sensors in their organization" ON sensors
  FOR SELECT USING (drone_id IN (
    SELECT id FROM drones WHERE organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()::uuid
    )
  ));

CREATE POLICY "Users can view telemetry in their organization" ON telemetry
  FOR SELECT USING (drone_id IN (
    SELECT id FROM drones WHERE organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()::uuid
    )
  ));

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
