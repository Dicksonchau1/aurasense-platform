// Mock data for /dashboard/robot-specs.

export interface SpecRow { label: string; value: string; badge?: "ok" | "warn" | "danger" | "info"; }

export const NEPA_ORCH: SpecRow[] = [
  { label: "Architecture",      value: "STDP v3.2" },
  { label: "Neurons",           value: "128K spiking" },
  { label: "Hardware",          value: "Jetson Orin 64GB" },
  { label: "Inference",         value: "45 fps" },
  { label: "Dopamine reward",   value: "Active", badge: "ok" },
  { label: "STDP learning",     value: "Active", badge: "ok" },
  { label: "Agent loops",       value: "Perception / Plan / Act" },
];

export const TENDON_ORCH: SpecRow[] = [
  { label: "DOF",          value: "6-DOF Tendon" },
  { label: "Payload",      value: "2.5 kg" },
  { label: "Reach",        value: "1.2 m" },
  { label: "Precision",    value: "0.5 mm" },
  { label: "Actuators",    value: "12 servo motors" },
  { label: "Control loop", value: "1 kHz" },
  { label: "Safety stop",  value: "Active", badge: "ok" },
];

export interface PipelineStage { label: string; active: boolean; }
export const PIPELINE: PipelineStage[] = [
  { label: "Perceive", active: true  },
  { label: "Plan",     active: true  },
  { label: "NEPA",     active: true  },
  { label: "STDP",     active: true  },
  { label: "Decide",   active: false },
  { label: "Act",      active: false },
  { label: "Feedback", active: false },
];

export interface OrchMetric { label: string; value: string; }
export const ORCH_METRICS: OrchMetric[] = [
  { label: "Cycles/s",  value: "4,200" },
  { label: "Latency",   value: "12 ms" },
  { label: "Reward",    value: "0.87" },
  { label: "Entropy",   value: "0.24" },
];

export const RADAR_CONFIG: SpecRow[] = [
  { label: "Type",       value: "Livox Mid-360" },
  { label: "Range",      value: "70 m" },
  { label: "FoV H/V",    value: "360 / 55" },
  { label: "Points/s",   value: "300K" },
  { label: "Frequency",  value: "10 Hz" },
  { label: "Status",     value: "Scanning", badge: "ok" },
];

export interface RadarObj { angle: number; range: number; label: string; }
export const RADAR_OBJS: RadarObj[] = [
  { angle: 0.8, range: 0.45, label: "Building A" },
  { angle: 2.1, range: 0.62, label: "Tower B" },
  { angle: 3.8, range: 0.30, label: "Obstacle" },
  { angle: 5.2, range: 0.55, label: "Structure" },
];

export const OBSTACLE_ZONES: SpecRow[] = [
  { label: "0-5m",   value: "DANGER",   badge: "danger" },
  { label: "5-15m",  value: "CAUTION",  badge: "warn"   },
  { label: "15-70m", value: "CLEAR",    badge: "ok"     },
];

export const WP_ENGINE_CFG: SpecRow[] = [
  { label: "Algorithm",     value: "A* + STDP" },
  { label: "Avoidance",     value: "Active", badge: "ok" },
  { label: "Wind comp.",    value: "Active", badge: "ok" },
  { label: "RTK precision", value: "0.08 m" },
];

export const VISION_STACK: SpecRow[] = [
  { label: "Camera",       value: "48MP + thermal" },
  { label: "Thermal",      value: "FLIR 640x512" },
  { label: "Object det.",  value: "YOLO v10" },
  { label: "SLAM",         value: "Active", badge: "ok" },
];

export const IMU_GNSS: SpecRow[] = [
  { label: "IMU",        value: "ICM-42688-P" },
  { label: "GNSS",       value: "GPS / GLO / BDS" },
  { label: "RTK",        value: "DJI D-RTK 2" },
  { label: "Accuracy",   value: "0.08 m" },
];

export const ENV_SENSORS: SpecRow[] = [
  { label: "Barometer",   value: "MS5611" },
  { label: "Humidity",    value: "SHT40" },
  { label: "Wind speed",  value: "Ultrasonic 3D" },
  { label: "AQI",         value: "PM2.5 OK", badge: "ok" },
];
