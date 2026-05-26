// Physics layer type contracts. All units SI unless suffix says otherwise.
// Coordinate convention: NED (North-East-Down) inertial, FRD (Forward-Right-Down) body.

export type Vec3 = readonly [number, number, number];
export type Quat = readonly [number, number, number, number]; // [w, x, y, z]

export interface AirframeSpec {
  readonly id: string;
  readonly model: string;
  readonly configuration: "quad" | "hex" | "octo";
  readonly motorCount: number;
  readonly massKg: number;
  readonly armLengthM: number;
  readonly propDiameterM: number;
  readonly propPitchM: number;
  readonly maxThrustPerMotorN: number; // Newtons at 100% throttle, sea level, full battery
  readonly motorKv: number;            // rpm/V
  readonly frontalAreaM2: number;
  readonly dragCoefficient: number;
  readonly inertia: Vec3;              // [Ixx, Iyy, Izz] kg*m^2 (principal axes)
  readonly batteryCellsSeries: number;
  readonly batteryCapacityAh: number;
  readonly hoverCurrentA: number;
  readonly specSource: string;         // "manufacturer" | "estimated" | "measured"
}

export interface DroneState {
  readonly t: number;                  // seconds since flight start
  readonly position: Vec3;             // NED meters from origin
  readonly velocity: Vec3;             // NED m/s
  readonly attitude: Quat;             // body→inertial quaternion
  readonly angularVelocity: Vec3;      // body frame rad/s
  readonly batterySoc: number;         // 0..1
  readonly batteryVoltage: number;     // V
}

export interface Control {
  // Normalized 0..1 throttle per motor, ordered by motor index.
  readonly throttle: readonly number[];
}

export interface Environment {
  readonly gravity: number;            // m/s^2, positive down
  readonly airDensity: number;         // kg/m^3
  readonly wind: Vec3;                 // NED m/s
  readonly temperatureC: number;
}

export interface Forces {
  readonly thrustBody: Vec3;           // total body-frame thrust
  readonly dragInertial: Vec3;         // inertial drag opposing relative wind
  readonly gravityInertial: Vec3;
  readonly momentBody: Vec3;           // total body-frame moment
}

export interface IntegratorStep {
  readonly dt: number;
  readonly before: DroneState;
  readonly after: DroneState;
  readonly forces: Forces;
  readonly energyJ: number;            // energy drawn this step
}

export const ISA_SEA_LEVEL: Environment = Object.freeze({
  gravity: 9.80665,
  airDensity: 1.225,
  wind: [0, 0, 0] as const,
  temperatureC: 15,
});
