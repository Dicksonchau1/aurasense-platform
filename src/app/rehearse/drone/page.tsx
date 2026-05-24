'use client';
// src/app/rehearse/drone/page.tsx
// Drone-inspection rehearse page — 3D scene + substrate-driven orchestration
// Architectural Lock #4 (2026-05-22) — PR C

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// R3F requires client-side only — dynamic import with ssr: false
const DroneInspectionScene = dynamic(
  () => import('@/components/rehearse/DroneInspectionScene').then((m) => m.DroneInspectionScene),
  { ssr: false }
);

export default function DroneRehearsePage() {
  const wsUrl = process.env.NEXT_PUBLIC_ORCHESTRATOR_WS_URL ?? undefined;

  return (
    <main className="flex flex-col h-screen bg-[#0a0a12] text-white">
      <header className="flex items-center gap-3 px-6 py-3 border-b border-white/10">
        <span className="text-xs font-mono text-[#4488ff] uppercase tracking-widest">ATLAS</span>
        <span className="text-sm font-semibold">Drone Inspection Rehearse</span>
        <span className="ml-auto text-xs text-white/40 font-mono">Polygon-Engine Orchestrator · Lock #4</span>
      </header>

      <div className="flex-1 relative">
        <Suspense fallback={
          <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm">
            Loading 3D scene…
          </div>
        }>
          <DroneInspectionScene wsUrl={wsUrl} />
        </Suspense>
      </div>

      <footer className="px-6 py-2 border-t border-white/10 flex items-center gap-4">
        <span className="text-xs text-white/30 font-mono">
          3D rehearse environment · signature_map priors loaded on session start
        </span>
        <span className="ml-auto text-xs text-white/20 font-mono">
          © AuraSense 2026
        </span>
      </footer>
    </main>
  );
}
