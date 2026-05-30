import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'operator' | 'viewer';
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface Drone {
  id: string;
  organization_id: string;
  name: string;
  model: string;
  serial_number: string;
  firmware_version: string;
  status: 'idle' | 'armed' | 'flying' | 'error';
  battery_voltage: number;
  battery_percentage: number;
  gps_status: string;
  location_lat: number;
  location_lon: number;
  altitude_m: number;
  heading_deg: number;
  last_heartbeat: string;
  created_at: string;
  updated_at: string;
}

export interface Sensor {
  id: string;
  drone_id: string;
  sensor_type: string;
  status: 'idle' | 'calibrating' | 'calibrated' | 'error';
  confidence: number;
  last_calibrated: string | null;
  calibration_count: number;
  created_at: string;
  updated_at: string;
}

export interface CalibrationState {
  id: string;
  sensor_id: string;
  step: string;
  step_index: number;
  total_steps: number;
  progress_percent: number;
  temperature_c: number;
  offsets_x: number;
  offsets_y: number;
  offsets_z: number;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

export interface Telemetry {
  id: string;
  drone_id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  altitude_m: number;
  roll_deg: number;
  pitch_deg: number;
  yaw_deg: number;
  velocity_x: number;
  velocity_y: number;
  velocity_z: number;
  battery_voltage: number;
  battery_current: number;
  battery_percentage: number;
  gps_satellites: number;
  gps_hdop: number;
  accel_x: number;
  accel_y: number;
  accel_z: number;
  gyro_x: number;
  gyro_y: number;
  gyro_z: number;
  system_time_ms: number;
  cpu_load: number;
  created_at: string;
}

export interface FlightMode {
  id: string;
  drone_id: string;
  mode_name: string;
  is_active: boolean;
  armed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Mission {
  id: string;
  organization_id: string;
  drone_id: string | null;
  name: string;
  description: string | null;
  status: 'draft' | 'planned' | 'executing' | 'completed' | 'aborted';
  waypoints: any[];
  created_by: string;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface RegistryEntry {
  id: string;
  organization_id: string;
  resource_type: string;
  resource_id: string;
  name: string;
  endpoint: string;
  status: 'online' | 'offline' | 'error';
  last_seen: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}
