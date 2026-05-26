"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import {
  DEFAULT_CAMERA,
  VIEW_PRESETS,
  type CameraState,
  type DroneModel,
  type Mode,
} from "./projection";
import type { Waypoint } from "./wpEngine";
import { calcDist, optimise } from "./wpEngine";
import { NEPAR, type NepaMsg } from "./nepa";

export type ToastKind = "info" | "success" | "warn" | "danger";

export interface Toast {
  id: number;
  kind: ToastKind;
  msg: string;
}

export interface MissionConfig {
  name: string;
  drone: string;
  task: string;
  alt: number;
  spd: number;
  so: number;
}

export interface PhysicsState {
  wind: number;
  sun: number;
}

interface MissionStateShape {
  cam: CameraState;
  setCam: (c: CameraState) => void;

  mode: Mode;
  setMode: (m: Mode) => void;

  view: keyof typeof VIEW_PRESETS;
  setView: (v: keyof typeof VIEW_PRESETS) => void;

  drone: DroneModel;
  setDrone: (d: DroneModel) => void;

  showPhysics: boolean;
  togglePhysics: () => void;

  showDefects: boolean;
  toggleDefects: () => void;

  wps: Waypoint[];
  addWP: (x: number, y: number, z: number, type?: Waypoint["type"]) => void;
  removeWP: (i: number) => void;
  clearWPs: () => void;
  undoWP: () => void;
  selectedWP: number;
  selectWP: (i: number) => void;
  optimiseWPs: () => void;

  cfg: MissionConfig;
  setCfg: (c: Partial<MissionConfig>) => void;

  phy: PhysicsState;
  setPhy: (p: Partial<PhysicsState>) => void;

  sim: boolean;
  simT: number;
  startSim: () => void;
  stopSim: () => void;
  tickSim: (dt: number) => void;

  fit: number;

  nepa: NepaMsg[];
  pushNepa: (m: NepaMsg) => void;
  sendUserNepa: (text: string) => void;

  toasts: Toast[];
  toast: (msg: string, kind?: ToastKind) => void;
  dismissToast: (id: number) => void;
}

const MissionCtx = createContext<MissionStateShape | null>(null);

export function MissionProvider({ children }: { children: React.ReactNode }) {
  const [cam, setCam] = useState<CameraState>(DEFAULT_CAMERA);
  const [mode, setMode] = useState<Mode>("wp");
  const [view, setViewState] = useState<keyof typeof VIEW_PRESETS>("orbit");
  const [drone, setDrone] = useState<DroneModel>("m30t");
  const [showPhysics, setShowPhysics] = useState(true);
  const [showDefects, setShowDefects] = useState(true);

  const [wps, setWps] = useState<Waypoint[]>([]);
  const [selectedWP, setSelectedWP] = useState(-1);

  const [cfg, setCfgState] = useState<MissionConfig>({
    name: "Facade-B2",
    drone: "NERM-A1 (M30T) 87%",
    task: "Facade Inspection",
    alt: 80,
    spd: 4,
    so: 8,
  });

  const [phy, setPhyState] = useState<PhysicsState>({ wind: 5.2, sun: 45 });

  const [sim, setSim] = useState(false);
  const [simT, setSimT] = useState(0);

  const [fit] = useState(84);

  const [nepa, setNepa] = useState<NepaMsg[]>([
    {
      role: "ai",
      text:
        "NEPA v3.2 online. I will analyse route, physics risk, and suggest optimisations. Place waypoints on the 3D map and ask me anything.",
    },
  ]);
  const [nepaIdx, setNepaIdx] = useState(0);

  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((msg: string, kind: ToastKind = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, msg }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const pushNepa = useCallback((m: NepaMsg) => {
    setNepa((arr) => [...arr, m]);
  }, []);

  const sendUserNepa = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      pushNepa({ role: "user", text });
      const reply = NEPAR[nepaIdx % NEPAR.length];
      setNepaIdx((i) => i + 1);
      window.setTimeout(() => pushNepa({ role: "ai", text: reply }), 380);
    },
    [nepaIdx, pushNepa],
  );

  const addWP = useCallback(
    (x: number, y: number, z: number, type: Waypoint["type"] = "wp") => {
      setWps((arr) => {
        const next = [...arr, { x, y, z, type, id: arr.length }];
        if (next.length === 1) {
          toast("WP-01 placed", "info");
          pushNepa({
            role: "ai",
            text:
              "WP-01 placed at " +
              x.toFixed(0) +
              ", " +
              z.toFixed(0) +
              ". Flying " +
              cfg.alt +
              "m AGL, standoff " +
              cfg.so +
              "m. Add more to build the route.",
          });
        } else if (next.length === 3) {
          pushNepa({
            role: "ai",
            text:
              "3 WPs set - route " +
              Math.round(calcDist(next)) +
              "m. Wind " +
              phy.wind +
              "m/s adds 8% battery. Consider a home point for RTH.",
          });
        } else if (next.length === 6) {
          pushNepa({
            role: "ai",
            text:
              "Good facade coverage. Run NEPA Optimise to sort for min energy path. Est. battery " +
              Math.min(99, Math.round((calcDist(next) / 4 / 60) * (100 / 5))) +
              "%",
          });
        }
        return next;
      });
    },
    [cfg.alt, cfg.so, phy.wind, pushNepa, toast],
  );

  const removeWP = useCallback((i: number) => {
    setWps((arr) =>
      arr.filter((_, idx) => idx !== i).map((w, idx) => ({ ...w, id: idx })),
    );
  }, []);

  const clearWPs = useCallback(() => {
    setWps([]);
    setSelectedWP(-1);
    toast("All waypoints cleared", "warn");
  }, [toast]);

  const undoWP = useCallback(() => {
    setWps((arr) => {
      if (arr.length === 0) {
        toast("Nothing to undo", "warn");
        return arr;
      }
      toast("Last waypoint removed", "warn");
      return arr.slice(0, -1);
    });
  }, [toast]);

  const optimiseWPs = useCallback(() => {
    setWps((arr) => {
      const out = optimise(arr, cfg.alt);
      toast("NEPA route optimised", "success");
      pushNepa({
        role: "ai",
        text:
          "Optimised: WPs sorted by x-proximity (greedy NN). All elevated to " +
          cfg.alt +
          "m AGL. Route saved 11% battery.",
      });
      return out;
    });
  }, [cfg.alt, toast, pushNepa]);

  const setCfg = useCallback((c: Partial<MissionConfig>) => {
    setCfgState((prev) => ({ ...prev, ...c }));
  }, []);

  const setPhy = useCallback((p: Partial<PhysicsState>) => {
    setPhyState((prev) => ({ ...prev, ...p }));
  }, []);

  const setView = useCallback(
    (v: keyof typeof VIEW_PRESETS) => {
      setViewState(v);
      setCam(VIEW_PRESETS[v]);
      toast("View: " + v, "info");
    },
    [toast],
  );

  const togglePhysics = useCallback(() => {
    setShowPhysics((v) => {
      toast("Physics " + (!v ? "on" : "off"), "info");
      return !v;
    });
  }, [toast]);

  const toggleDefects = useCallback(() => {
    setShowDefects((v) => {
      toast("Defect markers " + (!v ? "on" : "off"), "info");
      return !v;
    });
  }, [toast]);

  const startSim = useCallback(() => {
    setWps((arr) => {
      if (arr.length === 0) {
        toast("Add waypoints first", "warn");
        return arr;
      }
      setSim(true);
      setSimT(0);
      toast("Sim started - drone tracking route", "success");
      return arr;
    });
  }, [toast]);

  const stopSim = useCallback(() => {
    setSim(false);
    setSimT(0);
  }, []);

  const tickSim = useCallback(
    (dt: number) => {
      setSimT((t) => {
        const next = t + dt * 0.55;
        if (next >= 100) {
          setSim(false);
          toast("Sim complete - Ready to deploy?", "success");
          pushNepa({
            role: "ai",
            text: "Simulation done. Route feasible. Ready to deploy to NERM-A1.",
          });
          return 0;
        }
        return next;
      });
    },
    [toast, pushNepa],
  );

  const value: MissionStateShape = {
    cam,
    setCam,
    mode,
    setMode,
    view,
    setView,
    drone,
    setDrone,
    showPhysics,
    togglePhysics,
    showDefects,
    toggleDefects,
    wps,
    addWP,
    removeWP,
    clearWPs,
    undoWP,
    selectedWP,
    selectWP: setSelectedWP,
    optimiseWPs,
    cfg,
    setCfg,
    phy,
    setPhy,
    sim,
    simT,
    startSim,
    stopSim,
    tickSim,
    fit,
    nepa,
    pushNepa,
    sendUserNepa,
    toasts,
    toast,
        dismissToast,
  };

  return <MissionCtx.Provider value={value}>{children}</MissionCtx.Provider>;
}

export function useMission(): MissionStateShape {
  const ctx = useContext(MissionCtx);
  if (!ctx) throw new Error("useMission must be used inside MissionProvider");
  return ctx;
}
