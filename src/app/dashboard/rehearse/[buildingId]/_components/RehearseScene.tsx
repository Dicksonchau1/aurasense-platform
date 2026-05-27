"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MbisGlbLayer } from "./MbisGlbLayer";

interface Building {
  id: string;
  name: string | null;
  lat: number | null;
  lng: number | null;
  height_m: number | null;
  risk_score: number | null;
}

interface FlightPlan {
  id: string;
  waypoints: Array<{ lat: number; lng: number; alt_m?: number }> | null;
}

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export default function RehearseScene({ building, plans }: { building: Building; plans: FlightPlan[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || !TOKEN || building.lat == null || building.lng == null) return;
    mapboxgl.accessToken = TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [building.lng, building.lat],
      zoom: 17,
      pitch: 70,
      bearing: 30,
      antialias: true,
    });
    mapRef.current = map;

    map.on("load", () => {
      const layers = map.getStyle()?.layers ?? [];
      const labelLayer = layers.find((l: any) => l.type === "symbol" && l.layout && l.layout["text-field"]);
      const beforeId = labelLayer?.id;
      map.addLayer({
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 14,
        paint: {
          "fill-extrusion-color": "#1f3a52",
          "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 14, 0, 15.05, ["get", "height"]],
          "fill-extrusion-base": ["interpolate", ["linear"], ["zoom"], 14, 0, 15.05, ["get", "min_height"]],
          "fill-extrusion-opacity": 0.6,
        },
      } as any, beforeId);

      const tileZ = 16;
      const n = Math.pow(2, tileZ);
      const tileX = Math.floor(((building.lng as number) + 180) / 360 * n);
      const latRad = ((building.lat as number) * Math.PI) / 180;
      const tileY = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
      const tileWest = tileX / n * 360 - 180;
      const tileEast = (tileX + 1) / n * 360 - 180;
      const tileNorth = Math.atan(Math.sinh(Math.PI * (1 - 2 * tileY / n))) * 180 / Math.PI;
      const tileSouth = Math.atan(Math.sinh(Math.PI * (1 - 2 * (tileY + 1) / n))) * 180 / Math.PI;
      const originLat = (tileSouth + tileNorth) / 2;
      const originLng = (tileWest + tileEast) / 2;
      map.addLayer(new MbisGlbLayer({ z: tileZ, x: tileX, y: tileY, originLat, originLng }));

      const flightFeatures: any[] = [];
      for (const p of plans) {
        if (!p.waypoints || p.waypoints.length < 2) continue;
        flightFeatures.push({
          type: "Feature",
          geometry: { type: "LineString", coordinates: p.waypoints.map((w) => [w.lng, w.lat]) },
          properties: { id: p.id },
        });
      }
      if (flightFeatures.length > 0) {
        map.addSource("flight-paths", { type: "geojson", data: { type: "FeatureCollection", features: flightFeatures } as any });
        map.addLayer({
          id: "flight-paths-line",
          source: "flight-paths",
          type: "line",
          paint: { "line-color": "#34d399", "line-width": 3, "line-opacity": 0.9, "line-dasharray": [2, 2] },
        } as any);
        map.addLayer({
          id: "flight-paths-points",
          source: "flight-paths",
          type: "circle",
          paint: { "circle-radius": 5, "circle-color": "#34d399", "circle-stroke-width": 2, "circle-stroke-color": "#0a131f" },
        } as any);
      }
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(new mapboxgl.ScaleControl({ unit: "metric" }), "bottom-left");

    return () => {
      mapRef.current = null;
      map.remove();
    };
  }, [building, plans]);

  return <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />;
}