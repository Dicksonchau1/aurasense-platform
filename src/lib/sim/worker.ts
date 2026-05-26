// 30 Hz physics worker. Receives init+update messages, runs RK4 in browser,
// posts tick state back to main thread for smooth UI animation.

import { AIRFRAMES, hoverThrottle } from "../physics/airframes";
import { rk4Step } from "../physics/integrator";
import { ISA_SEA_LEVEL } from "../physics/types";
import type { Control, DroneState, Environment } from "../physics/types";

interface DroneInit {
  droneId: string;
  airframeId: string;
  batterySoc: number;
}

interface InitMessage {
  type: "init";
  drones: DroneInit[];
  env: Partial<Environment>;
  controlBias: number;
}

interface UpdateMessage {
  type: "update";
  env?: Partial<Environment>;
  drones?: DroneInit[];
}

interface StopMessage { type: "stop"; }

type InMessage = InitMessage | UpdateMessage | StopMessage;

interface TickOut {
  type: "tick";
  ts: number;
  drones: Array<{
    droneId: string;
    airframeId: string;
    throttle: number[];
    batterySoc: number;
    batteryVoltage: number;
    altitudeM: number;
    speedMs: number;
  }>;
}

const DT = 1 / 30;
let env: Environment = ISA_SEA_LEVEL;
let controlBias = 1.05;
let states = new Map<string, { airframeId: string; state: DroneState }>();
let intervalId: ReturnType<typeof setInterval> | null = null;

function makeInitialState(socPct: number): DroneState {
  return {
    t: 0,
    position: [0, 0, -50],
    velocity: [3, 0, 0],
    attitude: [1, 0, 0, 0],
    angularVelocity: [0, 0, 0],
    batterySoc: socPct,
    batteryVoltage: 25.2,
  };
}

function applyGust(base: Environment): Environment {
  const speed = Math.sqrt(base.wind[0] * base.wind[0] + base.wind[1] * base.wind[1]);
  const gust = 1 + (Math.random() - 0.5) * 0.3;
  const swirl = (Math.random() - 0.5) * 0.5;
  return {
    ...base,
    wind: [base.wind[0] * gust + swirl, base.wind[1] * gust - swirl, base.wind[2]] as [number, number, number],
  };
}

function tick() {
  const ts = Date.now();
  const out: TickOut = { type: "tick", ts, drones: [] };
  for (const [droneId, entry] of states) {
    const spec = AIRFRAMES[entry.airframeId];
    if (!spec) continue;
    const hover = hoverThrottle(spec);
    const control: Control = { throttle: Array(spec.motorCount).fill(Math.min(0.95, hover * controlBias)) };
    const gustEnv = applyGust(env);
    try {
      const step = rk4Step(spec, entry.state, control, gustEnv, DT);
      entry.state = step.after;
      const speed = Math.sqrt(
        step.after.velocity[0] ** 2 + step.after.velocity[1] ** 2 + step.after.velocity[2] ** 2,
      );
      out.drones.push({
        droneId,
        airframeId: entry.airframeId,
        throttle: control.throttle,
        batterySoc: step.after.batterySoc,
        batteryVoltage: step.after.batteryVoltage,
        altitudeM: -step.after.position[2],
        speedMs: speed,
      });
    } catch {
      // skip bad step
    }
  }
  (self as unknown as Worker).postMessage(out);
}

function startLoop() {
  if (intervalId !== null) clearInterval(intervalId);
  intervalId = setInterval(tick, Math.round(DT * 1000));
}

(self as unknown as Worker).addEventListener("message", (ev: MessageEvent<InMessage>) => {
  const msg = ev.data;
  if (msg.type === "init") {
    env = { ...ISA_SEA_LEVEL, ...msg.env } as Environment;
    controlBias = msg.controlBias ?? 1.05;
    states = new Map();
    for (const d of msg.drones) {
      if (!AIRFRAMES[d.airframeId]) continue;
      states.set(d.droneId, { airframeId: d.airframeId, state: makeInitialState(d.batterySoc) });
    }
    startLoop();
  } else if (msg.type === "update") {
    if (msg.env) env = { ...env, ...msg.env } as Environment;
    if (msg.drones) {
      for (const d of msg.drones) {
        if (!AIRFRAMES[d.airframeId]) continue;
        const existing = states.get(d.droneId);
        if (existing) {
          existing.airframeId = d.airframeId;
          existing.state = { ...existing.state, batterySoc: d.batterySoc };
        } else {
          states.set(d.droneId, { airframeId: d.airframeId, state: makeInitialState(d.batterySoc) });
        }
      }
    }
  } else if (msg.type === "stop") {
    if (intervalId !== null) { clearInterval(intervalId); intervalId = null; }
  }
});

export {};