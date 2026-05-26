"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useRouter } from "next/navigation";

interface Building {
  id: string;
  name: string | null;
  lat: number | null;
  lng: number | null;
  height_m: number | null;
  floor_count: number | null;
  risk_score: number | null;
  mbis_id: string | null;
  source: string | null;
}

interface Drone {
  id: string;
  name: string | null;
  model: string | null;
  home_lat: number | null;
  home_lng: number | null;
  status: string | null;
  battery_pct: number | null;
}

interface Snapshot {
  data: { buildings?: Building[]; drones?: Drone[] };
}

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
const HK_CENTER: [number, number] = [114.182, 22.305];
const DEFAULT_ZOOM = 12.5;
const DEFAULT_PITCH = 60;
const DEFAULT_BEARING = -15;

export default function WorldScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const router = useRouter();

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const r = await fetch("/api/atlas/nepa/world-model/snapshot", { cache: "no-store" });
        if (!r.ok) return;
        const j = await r.json();
        if (alive) setSnap(j);
      } catch {}
    };
    tick();
    const id = setInterval(tick, 8000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!TOKEN) {
      console.error("[WorldScene] NEXT_PUBLIC_MAPBOX_TOKEN missing in .env.local");
      return;
    }
    mapboxgl.accessToken = TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: HK_CENTER,
      zoom: DEFAULT_ZOOM,
      pitch: DEFAULT_PITCH,
      bearing: DEFAULT_BEARING,
      antialias: true,
    });
    mapRef.current = map;

    map.on("load", () => {
      const layers = map.getStyle()?.layers ?? [];
      const labelLayer = layers.find((l: any) => l.type === "symbol" && l.layout && l.layout["text-field"]);
      const beforeId = labelLayer?.id;

      if (!map.getLayer("3d-buildings")) {
        map.addLayer({
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 12,
          paint: {
            "fill-extrusion-color": "#2a3a52",
            "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 12, 0, 15.05, ["get", "height"]],
            "fill-extrusion-base": ["interpolate", ["linear"], ["zoom"], 12, 0, 15.05, ["get", "min_height"]],
            "fill-extrusion-opacity": 0.7,
          },
        } as any, beforeId);
      }

      if (!map.getSource("mission-buildings")) {
        map.addSource("mission-buildings", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({
          id: "mission-buildings-extrusion",
          source: "mission-buildings",
          type: "fill-extrusion",
          paint: {
            "fill-extrusion-color": ["case",
              ["!=", ["get", "risk_score"], null],
              ["interpolate", ["linear"], ["get", "risk_score"], 0, "#4a90e2", 40, "#22d3ee", 60, "#f59e0b", 75, "#ef4444"],
              "#22d3ee",
            ],
            "fill-extrusion-height": ["coalesce", ["get", "height_m"], 40],
            "fill-extrusion-base": 0,
            "fill-extrusion-opacity": 0.9,
          },
        } as any);

        map.addLayer({
          id: "mission-buildings-click",
          source: "mission-buildings",
          type: "circle",
          paint: {
            "circle-radius": 22,
            "circle-color": "rgba(34,211,238,0.0)",
            "circle-stroke-width": 2,
            "circle-stroke-color": "rgba(34,211,238,0.6)",
          },
        });

        map.addSource("drones", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({
          id: "drones-marker",
          source: "drones",
          type: "circle",
          paint: {
            "circle-radius": 8,
            "circle-color": "#d0dce8",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#22d3ee",
          },
        });

        map.on("click", "mission-buildings-click", (ev: any) => {
          const f = ev.features?.[0];
          if (!f) return;
          const id = f.properties?.id;
          if (id) router.push("/dashboard/rehearse/" + id);
        });
        map.on("mouseenter", "mission-buildings-click", () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", "mission-buildings-click", () => { map.getCanvas().style.cursor = ""; });
      }
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(new mapboxgl.ScaleControl({ unit: "metric" }), "bottom-left");

    return () => {
      mapRef.current = null;
      map.remove();
    };
  }, [router]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !snap) return;
    if (!map.isStyleLoaded()) {
      map.once("idle", () => updateSources(map, snap));
      return;
    }
    updateSources(map, snap);
  }, [snap]);

  return <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />;
}

function updateSources(map: mapboxgl.Map, snap: Snapshot) {
  const buildings = snap.data?.buildings ?? [];
  const drones = snap.data?.drones ?? [];

  const buildingFeatures: any[] = [];
  for (const b of buildings) {
    if (b.lat == null || b.lng == null) continue;
    const lat = b.lat;
    const lng = b.lng;
    const d = 0.0004;
    buildingFeatures.push({
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [lng - d, lat - d],
          [lng + d, lat - d],
          [lng + d, lat + d],
          [lng - d, lat + d],
          [lng - d, lat - d],
        ]],
      },
      properties: {
        id: b.id,
        name: b.name,
        height_m: b.height_m,
        floor_count: b.floor_count,
        risk_score: b.risk_score,
        mbis_id: b.mbis_id,
      },
    });
  }

  const droneFeatures: any[] = [];
  for (const d of drones) {
    if (d.home_lat == null || d.home_lng == null) continue;
    droneFeatures.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [d.home_lng, d.home_lat] },
      properties: {
        id: d.id,
        name: d.name,
        model: d.model,
        status: d.status,
        battery_pct: d.battery_pct,
      },
    });
  }

  const mbSrc = map.getSource("mission-buildings") as mapboxgl.GeoJSONSource | undefined;
  if (mbSrc) {
    mbSrc.setData({ type: "FeatureCollection", features: buildingFeatures } as any);
  }
  const drSrc = map.getSource("drones") as mapboxgl.GeoJSONSource | undefined;
  if (drSrc) {
    drSrc.setData({ type: "FeatureCollection", features: droneFeatures } as any);
  }
}