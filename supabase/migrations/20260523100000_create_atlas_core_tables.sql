-- Migration: Create ATLAS core tables

CREATE TABLE organisations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text,
  organisation_id uuid REFERENCES organisations(id),
  role text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE operator_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  display_name text,
  credentials jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE drones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  oem text NOT NULL,
  model text NOT NULL,
  capability_class text NOT NULL,
  domain text NOT NULL,
  status text NOT NULL,
  battery_pct numeric,
  lat numeric,
  lng numeric,
  altitude_m numeric,
  speed_mps numeric,
  heading_deg numeric,
  mission_id uuid REFERENCES missions(id),
  mission_name text,
  last_heartbeat timestamptz,
  signal_strength integer,
  firmware_version text,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE drone_status_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drone_id uuid REFERENCES drones(id),
  status text NOT NULL,
  battery_pct numeric,
  lat numeric,
  lng numeric,
  altitude_m numeric,
  speed_mps numeric,
  heading_deg numeric,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid REFERENCES organisations(id),
  name text NOT NULL,
  status text NOT NULL,
  config jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE mission_waypoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id),
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  altitude_m numeric,
  order_index integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE mission_exclusion_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id),
  polygon jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE mission_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id),
  result jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE anomalies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id),
  description text,
  detected_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE world_layers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE buildings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  geometry jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id),
  event_type text NOT NULL,
  event_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE compliance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id),
  status text NOT NULL,
  checklist jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE permits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid REFERENCES organisations(id),
  permit_type text NOT NULL,
  valid_from timestamptz,
  valid_to timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE insurance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid REFERENCES organisations(id),
  policy_number text NOT NULL,
  valid_from timestamptz,
  valid_to timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE billing_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid REFERENCES organisations(id),
  plan text NOT NULL,
  status text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);

CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid REFERENCES organisations(id),
  amount numeric NOT NULL,
  status text NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);

CREATE TABLE usage_counters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid REFERENCES organisations(id),
  counter_type text NOT NULL,
  value numeric NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid REFERENCES organisations(id),
  key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid REFERENCES organisations(id),
  integration_type text NOT NULL,
  config jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  preferences jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE agent_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  message text NOT NULL,
  context jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
