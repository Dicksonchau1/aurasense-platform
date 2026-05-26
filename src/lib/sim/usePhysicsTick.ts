"use client";

import { useEffect, useRef, useState } from "react";

export interface PhysicsTickFrame {
  droneId: string;
  airframeId: string;
  throttle: number[];
  batterySoc: number;
  batteryVoltage: number;
  altitudeM: number;
  speedMs: number;
}

export interface PhysicsTickEnv {
  windSpeedMs: number;
  windDirDeg: number;
  temperatureC: number;
}

export interface DroneInitSpec {
  droneId: string;
  airframeId: string;
  batterySoc: number;
}

function envWindToVector(speedMs: number, dirDeg: number): [number, number, number] {
  const rad = (dirDeg * Math.PI) / 180;
  return [-speedMs * Math.cos(rad), -speedMs * Math.sin(rad), 0];
}

export function usePhysicsTick(drones: DroneInitSpec[], env: PhysicsTickEnv) {
  const [tickMap, setTickMap] = useState<Map<string, PhysicsTickFrame>>(new Map());
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const w = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
    workerRef.current = w;
    w.postMessage({
      type: "init",
      drones,
      env: {
        wind: envWindToVector(env.windSpeedMs, env.windDirDeg),
        temperatureC: env.temperatureC,
      },
      controlBias: 1.05,
    });
    w.addEventListener("message", (ev: MessageEvent) => {
      const msg = ev.data;
      if (msg?.type === "tick") {
        const m = new Map<string, PhysicsTickFrame>();
        for (const d of msg.drones) m.set(d.droneId, d);
        setTickMap(m);
      }
    });
    return () => {
      w.postMessage({ type: "stop" });
      w.terminate();
      workerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push updates when drones or env change without re-spawning the worker
  useEffect(() => {
    const w = workerRef.current;
    if (!w) return;
    w.postMessage({
      type: "update",
      drones,
      env: {
        wind: envWindToVector(env.windSpeedMs, env.windDirDeg),
        temperatureC: env.temperatureC,
      },
    });
  }, [JSON.stringify(drones), env.windSpeedMs, env.windDirDeg, env.temperatureC]);

  return tickMap;
}