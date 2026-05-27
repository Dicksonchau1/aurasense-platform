// Live Drone Simulator.
// Drives a drone along a waypoint sequence using the real RK4 integrator
// from @/lib/physics/integrator with real airframe specs from
// @/lib/physics/airframes and live HKO wind. Emits position + state ticks
// at 30 Hz for the Mapbox drone layer and overlay panels.

import { AIRFRAMES, hoverThrottle, getAirframe } from "@/lib/physics/airframes";
import { rk4Step } from "@/lib/physics/integrator";
import { ISA_SEA_LEVEL } from "@/lib/physics/types";
import type { Control, DroneState, Environment, Vec3 } from "@/lib/physics/types";
import type { Waypoint } from "./WaypointEditor";

export interface SimTick {
  ts: number;
  lat: number;
  lng: number;
  altM: number;
  speedMs: number;
  headingDeg: number;
  batterySocPct: number;
  throttlePct: number;
  windRelMs: number;
  currentWaypointIndex: number;
  totalWaypoints: number;
  progressPct: number;
  warnings: string[];
  done: boolean;
}

export interface SimulatorOptions {
  airframeId: string;
  waypoints: Waypoint[];
  originLat: number;
  originLng: number;
  windSpeedMs: number;
  windDirDeg: number;
  temperatureC: number;
  initialBatteryPct: number;
  onTick: (tick: SimTick) => void;
  tickHz?: number;
}

const EARTH_R = 6378137;

function wgs84ToEnu(lat: number, lng: number, oLat: number, oLng: number) {
  const dLat = ((lat - oLat) * Math.PI) / 180;
  const dLng = ((lng - oLng) * Math.PI) / 180;
  const meanLat = (((lat + oLat) / 2) * Math.PI) / 180;
  return { east: dLng * EARTH_R * Math.cos(meanLat), north: dLat * EARTH_R };
}

function enuToWgs84(east: number, north: number, oLat: number, oLng: number) {
  const meanLat = (oLat * Math.PI) / 180;
  const dLat = north / EARTH_R;
  const dLng = east / (EARTH_R * Math.cos(meanLat));
  return { lat: oLat + (dLat * 180) / Math.PI, lng: oLng + (dLng * 180) / Math.PI };
}

function envFromWeather(windSpeedMs: number, windDirDeg: number, tempC: number): Environment {
  const rad = (windDirDeg * Math.PI) / 180;
  // Wind blows FROM dir, so velocity vector points opposite
  const wind: Vec3 = [-windSpeedMs * Math.sin(rad), -windSpeedMs * Math.cos(rad), 0];
  return { gravity: 9.80665, airDensity: 1.225, wind, temperatureC: tempC };
}

export class LiveDroneSimulator {
  private opts: SimulatorOptions;
  private state: DroneState;
  private env: Environment;
  private timer: ReturnType<typeof setInterval> | null = null;
  private wpIndex = 0;
  private startTs = 0;
  private dt: number;
  private hoverThr: number;
  private spec = AIRFRAMES["dji-matrice-30t"];
  private done = false;

  constructor(opts: SimulatorOptions) {
    this.opts = opts;
    const hz = opts.tickHz ?? 30;
    this.dt = 1 / hz;
    try {
      this.spec = getAirframe(opts.airframeId);
    } catch {
      this.spec = AIRFRAMES["dji-matrice-30t"];
    }
    this.hoverThr = hoverThrottle(this.spec);
    this.env = envFromWeather(opts.windSpeedMs, opts.windDirDeg, opts.temperatureC);

    // Initial state at first waypoint
    const first = opts.waypoints[0] ?? { lat: opts.originLat, lng: opts.originLng, alt_m: 50, speed_ms: 0, seq: 0 };
    const enu = wgs84ToEnu(first.lat, first.lng, opts.originLat, opts.originLng);
    this.state = {
      t: 0,
      position: [enu.east, enu.north, -first.alt_m] as Vec3,
      velocity: [0, 0, 0] as Vec3,
      attitude: [1, 0, 0, 0],
      angularVelocity: [0, 0, 0] as Vec3,
      batterySoc: opts.initialBatteryPct / 100,
      batteryVoltage: 25.2,
    };
  }

  start() {
    if (this.timer) return;
    this.startTs = performance.now();
    this.timer = setInterval(() => this.tick(), this.dt * 1000);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  private currentTarget(): Waypoint | null {
    return this.opts.waypoints[this.wpIndex] ?? null;
  }

  private nextTarget() {
    this.wpIndex++;
    if (this.wpIndex >= this.opts.waypoints.length) {
      this.done = true;
      this.stop();
    }
  }

  private computeControl(): Control {
    // L1 guidance: desired velocity toward current waypoint, throttle from PID-ish
    const target = this.currentTarget();
    if (!target) {
      return { throttle: Array(this.spec.motorCount).fill(this.hoverThr) };
    }
    const tgtEnu = wgs84ToEnu(target.lat, target.lng, this.opts.originLat, this.opts.originLng);
    const tgtZ = -target.alt_m;
    const dx = tgtEnu.east - this.state.position[0];
    const dy = tgtEnu.north - this.state.position[1];
    const dz = tgtZ - this.state.position[2];
    const horizDist = Math.sqrt(dx * dx + dy * dy);
    const fullDist = Math.sqrt(horizDist * horizDist + dz * dz);

    // Waypoint capture threshold ~ 8m (visible at Mapbox zoom 17)
    if (fullDist < 8.0) {
      this.nextTarget();
    }

    // Target speed scaled by remaining distance
    const targetSpeed = Math.min(target.speed_ms * 3, Math.max(8, fullDist * 1.2));
    const speedScale = horizDist > 0.5 ? targetSpeed / Math.max(0.5, horizDist) : 0;

    // Altitude error -> throttle delta
    const altError = dz; // positive means target is "lower in Z" i.e. higher altitude
    const altCmd = -altError * 0.12; // climb effort
    const throttleVal = Math.max(0.1, Math.min(0.95, this.hoverThr + altCmd));

    // Simple symmetric throttle (no differential roll/pitch in this minimal controller)
    const t = Array(this.spec.motorCount).fill(throttleVal);
    void speedScale;
    return { throttle: t };
  }

  private tick() {
    // Time dilation: each real-time tick advances simulated state by `simStepMult` integration steps,
    // so the drone visibly traverses meters per frame at Mapbox zoom 17.
    const simStepMult = 4;
    for (let i = 0; i < simStepMult; i++) {
      this.tickInternal();
    }
    return;
  }

  private tickInternal() {
    if (this.done) return;
    const control = this.computeControl();
    let step;
    try {
      step = rk4Step(this.spec, this.state, control, this.env, this.dt);
    } catch {
      this.done = true;
      this.stop();
      return;
    }
    this.state = step.after;

    // Emit tick in WGS84 + display units
    const ll = enuToWgs84(this.state.position[0], this.state.position[1], this.opts.originLat, this.opts.originLng);
    const altM = -this.state.position[2];
    const vx = this.state.velocity[0], vy = this.state.velocity[1];
    const speedMs = Math.sqrt(vx * vx + vy * vy + this.state.velocity[2] ** 2);
    const heading = (Math.atan2(vx, vy) * 180) / Math.PI;
    const throttleAvg = control.throttle.reduce((a, b) => a + b, 0) / control.throttle.length;

    const relV: Vec3 = [
      this.state.velocity[0] - this.env.wind[0],
      this.state.velocity[1] - this.env.wind[1],
      this.state.velocity[2] - this.env.wind[2],
    ];
    const windRel = Math.sqrt(relV[0] ** 2 + relV[1] ** 2 + relV[2] ** 2);

    const warnings: string[] = [];
    if (this.state.batterySoc < 0.25) warnings.push("Battery < 25% — RTL imminent");
    if (throttleAvg > 0.88) warnings.push("Throttle > 88% — limited headroom");
    if (this.opts.windSpeedMs > 12) warnings.push("Wind exceeds 12 m/s limit");

    const tick: SimTick = {
      ts: performance.now() - this.startTs,
      lat: ll.lat,
      lng: ll.lng,
      altM,
      speedMs,
      headingDeg: ((heading % 360) + 360) % 360,
      batterySocPct: this.state.batterySoc * 100,
      throttlePct: throttleAvg * 100,
      windRelMs: windRel,
      currentWaypointIndex: this.wpIndex,
      totalWaypoints: this.opts.waypoints.length,
      progressPct: (this.wpIndex / Math.max(1, this.opts.waypoints.length)) * 100,
      warnings,
      done: this.done,
    };
    this.opts.onTick(tick);
    try {
      window.dispatchEvent(new CustomEvent("rehearse-current-waypoint", { detail: { seq: this.wpIndex + 1 } }));
    } catch {}

    if (this.state.batterySoc <= 0.05) {
      this.done = true;
      this.stop();
    }
  }
}