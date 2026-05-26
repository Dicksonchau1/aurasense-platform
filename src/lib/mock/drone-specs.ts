// Mock data for /dashboard/drone-specs. Replace with Supabase queries later.

export type SeverityKind = "ok" | "warn" | "danger" | "info";

export interface PlatformSpec { label: string; value: string; }

export const DRONE_PLATFORM: PlatformSpec[] = [
  { label: "Brand",          value: "DJI Enterprise" },
  { label: "Model",          value: "Matrice 30T" },
  { label: "Task",           value: "Facade Inspection" },
];

export const FLIGHT_ENVELOPE: PlatformSpec[] = [
  { label: "Max altitude",   value: "6,000 m AMSL" },
  { label: "Max speed",      value: "23 m/s" },
  { label: "Hover (RTK)",    value: "+/- 0.1 m" },
  { label: "Range",          value: "15 km" },
  { label: "Endurance",      value: "41 min" },
  { label: "MTOW",           value: "3.78 kg" },
];

export const ENVIRONMENT: PlatformSpec[] = [
  { label: "Wind speed",     value: "5.2 m/s" },
  { label: "Sun angle",      value: "45 deg" },
  { label: "Temperature",    value: "28 C" },
  { label: "Humidity",       value: "69%" },
];

export const BATTERY = {
  charge:    95,
  endurance: "41 min",
  capacity:  "77 Wh",
  draw:      "100 W",
};

export const ROTORS = [
  { id: "FL", rpm: 4820 },
  { id: "FR", rpm: 4750 },
  { id: "RL", rpm: 4800 },
  { id: "RR", rpm: 4780 },
];

export interface FovPin { id: string; face: string; alt: number; coverage: number; }
export const FOV_PINS: FovPin[] = [
  { id: "01", face: "N", alt: 82, coverage: 94 },
  { id: "02", face: "W", alt: 76, coverage: 88 },
  { id: "03", face: "S", alt: 90, coverage: 91 },
];

export interface RegistryField { label: string; value: string; }
export const REGISTRY: RegistryField[] = [
  { label: "Drone ID",          value: "NERM-A1" },
  { label: "Serial Number",     value: "M30T-202503-00142" },
  { label: "Model",             value: "DJI Matrice 30T" },
  { label: "Operator",          value: "AuraSense Ltd." },
  { label: "RPL Number",        value: "HK-RPL-2025-4421" },
  { label: "HKCAD Permit",      value: "HKCAD-2026-B-04892" },
  { label: "Registration Date", value: "2025-01-14" },
  { label: "Last Inspection",   value: "2026-04-10" },
  { label: "Next Service",      value: "2026-07-10" },
  { label: "Flight Hours",      value: "412" },
  { label: "Home Base",         value: "West Kowloon Hub, HK" },
  { label: "Insurance",         value: "AXA-HK-2026-D-00892" },
];

export interface SupervisedAction {
  id: string;
  name: string;
  detail: string;
  status: "running" | "approved" | "pending";
}
export const SUPERVISED: SupervisedAction[] = [
  { id: "SA-001", name: "Facade-B2 dispatch",       detail: "Awaiting operator approval", status: "pending"  },
  { id: "SA-002", name: "Thermal sweep Tower-C",    detail: "Approved by D.Chau 04:12 HKT",status: "approved" },
  { id: "SA-003", name: "Return-to-home NERM-A2",   detail: "Battery 18% trigger",         status: "running"  },
];

export interface CalibrationStep { title: string; detail: string; ok: boolean; }
export const CALIBRATION: CalibrationStep[] = [
  { title: "IMU calibration",        detail: "6-axis gyro + accel offsets",          ok: true  },
  { title: "Compass calibration",    detail: "Magnetic declination 4.6 deg E",       ok: true  },
  { title: "RTK base check",         detail: "HDOP 0.6, 24 sats locked",             ok: true  },
  { title: "Gimbal home position",   detail: "Pitch -45 / yaw 0 / roll 0",           ok: true  },
  { title: "Rotor balance",          detail: "Vibration RMS 0.04 m/s2",              ok: false },
  { title: "Sensor zeroing",         detail: "Barometer + ultrasonic ground level", ok: true  },
];

export const SWEEP_PARAMS: PlatformSpec[] = [
  { label: "Pattern",         value: "Boustrophedon" },
  { label: "Overlap (front/side)", value: "80% / 75%" },
  { label: "GSD target",      value: "0.8 cm/px" },
  { label: "Altitude AGL",    value: "82 m" },
  { label: "Standoff dist.",  value: "8.4 m" },
  { label: "Est. images",     value: "1,247" },
  { label: "Coverage time",   value: "14 min" },
  { label: "NERM zone",       value: "SCAN-ACTIVE" },
];

export interface LiveTelemetry { label: string; value: string; }
export const LIVE_TELEMETRY: LiveTelemetry[] = [
  { label: "Lat",         value: "22.3284N" },
  { label: "Lng",         value: "114.1675E" },
  { label: "Altitude",    value: "82 m AGL" },
  { label: "Speed",       value: "2.3 m/s" },
  { label: "Heading",     value: "012 (N)" },
  { label: "Battery",     value: "87%" },
  { label: "Sats",        value: "24 (HDOP 0.6)" },
];
