"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import RehearseScene from "./_components/RehearseScene";
import RehearseControls from "./_components/RehearseControls";

interface Building {
  id: string;
  name: string | null;
  lat: number | null;
  lng: number | null;
  height_m: number | null;
  floor_count: number | null;
  risk_score: number | null;
  mbis_id: string | null;
}

interface FlightPlan {
  id: string;
  name: string;
  status: string;
  waypoints: Array<{ lat: number; lng: number; alt_m?: number }> | null;
  altitude_m: number | null;
  estimated_duration_min: number | null;
}

export default function RehearsePage(props: { params: Promise<{ buildingId: string }> }) {
  const { buildingId } = use(props.params);
  const [building, setBuilding] = useState<Building | null>(null);
  const [plans, setPlans] = useState<FlightPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/atlas/nepa/world-model/snapshot", { cache: "no-store" });
        if (!r.ok) return;
        const j = await r.json();
        if (!alive) return;
        const b = (j.data?.buildings ?? []).find((x: Building) => x.id === buildingId);
        setBuilding(b ?? null);
        const fp = await fetch("/api/atlas/rehearse/flight-plans?building_id=" + buildingId, { cache: "no-store" });
        if (fp.ok) {
          const fpj = await fp.json();
          if (alive) setPlans(fpj.data ?? []);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [buildingId]);

  if (loading) {
    return (
      <main style={{ padding: 40, color: "#cfd8e3", fontFamily: "system-ui" }}>
        <Link href="/dashboard/world-model" style={{ color: "#22d3ee", textDecoration: "none", fontSize: 13 }}>Back to World Model</Link>
        <p style={{ marginTop: 24, color: "#8b9aae" }}>Loading rehearsal environment...</p>
      </main>
    );
  }

  if (!building || building.lat == null || building.lng == null) {
    return (
      <main style={{ padding: 40, color: "#cfd8e3", fontFamily: "system-ui" }}>
        <Link href="/dashboard/world-model" style={{ color: "#22d3ee", textDecoration: "none", fontSize: 13 }}>Back to World Model</Link>
        <p style={{ marginTop: 24, color: "#fca5a5" }}>Building {buildingId} not found or has no coordinates.</p>
      </main>
    );
  }

  return (
    <main style={{ height: "calc(100vh - 60px)", display: "flex", flexDirection: "column", background: "#060f1e" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px", borderBottom: "1px solid #1a1f26", background: "rgba(6,15,30,0.85)" }}>
        <div>
          <Link href="/dashboard/world-model" style={{ color: "#22d3ee", textDecoration: "none", fontSize: 12 }}>Back to World Model</Link>
          <h1 style={{ fontSize: 20, margin: "4px 0 0", color: "#e0e8f2" }}>{building.name ?? buildingId}</h1>
          <div style={{ fontSize: 11, color: "#8b9aae", fontFamily: "monospace", marginTop: 2 }}>
            {building.lat.toFixed(5)} N · {building.lng.toFixed(5)} E · {building.height_m ?? "?"}m · {building.floor_count ?? "?"} floors
            {building.risk_score != null && <span style={{ marginLeft: 8, color: building.risk_score > 60 ? "#ef4444" : "#f59e0b" }}>· risk {building.risk_score}</span>}
          </div>
        </div>
        <div style={{ fontSize: 10, color: "rgba(34,211,238,0.7)", textTransform: "uppercase", letterSpacing: 2 }}>Rehearsal Environment</div>
      </header>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 340px", minHeight: 0 }}>
        <div style={{ position: "relative", borderRight: "1px solid #1a1f26" }}>
          <RehearseScene building={building} plans={plans} />
        </div>
        <aside style={{ padding: 16, overflowY: "auto", background: "#0a131f" }}>
          <RehearseControls building={building} plans={plans} />
        </aside>
      </div>
    </main>
  );
}