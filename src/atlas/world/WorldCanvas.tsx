"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Grid,
  OrbitControls,
  PerspectiveCamera,
  useGLTF,
} from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import * as THREE from "three";
import Card from "@/components/shell/Card";
import type { WorldAdapter } from "../WorldAdapter";
import type { DroneState } from "../types";
import { SceneGraph } from "./SceneGraph";
import { DroneRigidBody } from "./DroneRigidBody";
import { Sensors } from "./Sensors";

import { WORLD_MODEL_CONFIG } from "../config";
const WORLD_MODEL_ASSETS = WORLD_MODEL_CONFIG.assets;

type RuntimeSceneProps = {
  adapter: WorldAdapter;
  modelPath?: string;
  hdriPath?: string;
};

class SceneErrorBoundary extends React.Component<
  {
    fallback: React.ReactNode;
    children: React.ReactNode;
  },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("World model asset load failed:", error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function RuntimeScene({ adapter, modelPath, hdriPath }: RuntimeSceneProps) {
  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);
    adapter.tick(dt);
  });

  return (
    <>
      <color attach="background" args={["#07111a"]} />
      <fog attach="fog" args={["#07111a", 14, 48]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[8, 14, 6]} intensity={1.2} color="#d8f3ff" castShadow />
      <PerspectiveCamera makeDefault position={[10, 8, 12]} fov={42} />
      <OrbitControls enableDamping dampingFactor={0.08} />
      <Suspense fallback={null}>
        <SceneEnvironment hdriPath={hdriPath} />
      </Suspense>
      <Grid
        args={[60, 60]}
        cellSize={0.8}
        cellThickness={0.5}
        sectionSize={4}
        sectionThickness={1}
        sectionColor="#1dd3f8"
        cellColor="#17384f"
        fadeDistance={42}
        fadeStrength={1}
        infiniteGrid
      />
      <Physics gravity={[0, -9.81, 0]}>
        <SceneGraph />
        <Suspense fallback={null}>
          <ConfiguredModel modelPath={modelPath} />
        </Suspense>
        <DroneRigidBody adapter={adapter} />
      </Physics>
      <Sensors adapter={adapter} />
    </>
  );
}

function SceneEnvironment({ hdriPath }: { hdriPath?: string }) {
  if (!hdriPath) {
    return <Environment preset="city" />;
  }

  return <Environment files={hdriPath} background={false} />;
}

function ConfiguredModel({ modelPath }: { modelPath?: string }) {
  if (!modelPath) return null;
  return (
    <Suspense fallback={null}>
      <SafeGLTFModel path={modelPath} />
    </Suspense>
  );
}

function SafeGLTFModel({ path }: { path: string }) {
  let gltf: ReturnType<typeof useGLTF> | null = null;

  try {
    gltf = useGLTF(path);
  } catch (error) {
    console.warn(`Failed to load GLTF model at ${path}`, error);
    throw error;
  }

  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  useMemo(() => {
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => {
            m.needsUpdate = true;
          });
        } else if (obj.material) {
          obj.material.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  return (
    <primitive
      object={scene}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
      scale={1}
    />
  );
}

function SceneFallback() {
  return (
    <>
      <color attach="background" args={["#07111a"]} />
      <fog attach="fog" args={["#07111a", 14, 48]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[8, 14, 6]} intensity={1.2} color="#d8f3ff" castShadow />
      <PerspectiveCamera makeDefault position={[10, 8, 12]} fov={42} />
      <OrbitControls enableDamping dampingFactor={0.08} />
      <Environment preset="city" />
      <Grid
        args={[60, 60]}
        cellSize={0.8}
        cellThickness={0.5}
        sectionSize={4}
        sectionThickness={1}
        sectionColor="#1dd3f8"
        cellColor="#17384f"
        fadeDistance={42}
        fadeStrength={1}
        infiniteGrid
      />
      <Physics gravity={[0, -9.81, 0]}>
        <SceneGraph />
      </Physics>
    </>
  );
}

function HeadsUp({
  state,
  assetState,
}: {
  state: DroneState;
  assetState: { model: string; hdri: string };
}) {
  return (
    <div className="pointer-events-none absolute left-4 top-4 z-20 flex flex-wrap gap-2">
      {[
        ["POS", `${state.pose.x.toFixed(1)}, ${state.pose.y.toFixed(1)}, ${state.pose.z.toFixed(1)}`],
        ["VEL", `${state.vel.vx.toFixed(2)} / ${state.vel.vy.toFixed(2)} / ${state.vel.vz.toFixed(2)}`],
        ["BATT", `${Math.round(state.battery * 100)}%`],
        ["MODEL", assetState.model],
        ["HDRI", assetState.hdri],
      ].map(([k, v]) => (
        <div
          key={k}
          className="rounded-full border border-cyan-300/10 bg-black/45 px-3 py-2 text-xs text-cyan-50 shadow-lg backdrop-blur"
        >
          <span className="mr-2 text-cyan-200/60">{k}</span>
          <span className="font-mono">{v}</span>
        </div>
      ))}
    </div>
  );
}

export function WorldCanvas({ adapter }: { adapter: WorldAdapter }) {
  const [state, setState] = useState<DroneState>(() => adapter.getState());

  useEffect(() => {
    const id = window.setInterval(() => setState(adapter.getState()), 100);
    return () => window.clearInterval(id);
  }, [adapter]);

  const subtitle = useMemo(
    () =>
      adapter.mode === "live"
        ? "Live world model docked to NEPA edge telemetry."
        : "Rehearsal world model with in-browser dynamics and sealed publish guard.",
    [adapter.mode]
  );

  const assetState = {
    model: WORLD_MODEL_ASSETS.model ? "configured" : "fallback",
    hdri: WORLD_MODEL_ASSETS.hdri ? "configured" : "fallback",
  };

  return (
    <Card title="Shared scene graph">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="aura-sub">{subtitle}</span>
        <span className={`aura-badge ${adapter.mode === "live" ? "aura-badge-warn" : "aura-badge-success"}`}>
          {adapter.mode}
        </span>
      </div>

      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#050b12]">
        <HeadsUp state={state} assetState={assetState} />
        <div className="h-[620px] w-full">
          <SceneErrorBoundary fallback={<Canvas shadows dpr={[1, 1.75]}><SceneFallback /></Canvas>}>
            <Canvas shadows dpr={[1, 1.75]}>
              <RuntimeScene
                adapter={adapter}
                modelPath={WORLD_MODEL_ASSETS.model}
                hdriPath={WORLD_MODEL_ASSETS.hdri}
              />
            </Canvas>
          </SceneErrorBoundary>
        </div>
      </div>
    </Card>
  );
}

if (WORLD_MODEL_ASSETS.model) {
  useGLTF.preload(WORLD_MODEL_ASSETS.model);
}