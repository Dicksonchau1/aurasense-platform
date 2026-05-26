"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface Building {
  id: string;
  name: string | null;
  lat: number | null;
  lng: number | null;
  height_m: number | null;
  floor_count: number | null;
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
          "fill-extrusion-color": "#3d5b80",
          "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 14, 0, 15.05, ["get", "height"]],
          "fill-extrusion-base": ["interpolate", ["linear"], ["zoom"], 14, 0, 15.05, ["get", "min_height"]],
          "fill-extrusion-opacity": 0.95,
        },
      } as any, beforeId);

      const lat = building.lat as number;
      const lng = building.lng as number;
      const d = 0.0004;
      map.addSource("focus-building", {
        type: "geojson",
        data: {
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
          properties: { height: building.height_m ?? 40 },
        } as any,
      });
      map.addLayer({
        id: "focus-building-extrusion",
        source: "focus-building",
        type: "fill-extrusion",
        paint: {
          "fill-extrusion-color": (building.risk_score ?? 0) > 60 ? "#ef4444" : "#22d3ee",
          "fill-extrusion-height": building.height_m ?? 40,
          "fill-extrusion-base": 0,
          "fill-extrusion-opacity": 0.85,
        },
      } as any);

      // Floor bands - thin dark rings at every floor level
      const floorCount = (building as any).floor_count ?? Math.floor((building.height_m ?? 40) / 3.5);
      const bandFeatures: any[] = [];
      const floorHeight = (building.height_m ?? 40) / Math.max(1, floorCount);
      for (let i = 1; i < floorCount; i++) {
        bandFeatures.push({
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
          properties: { base: i * floorHeight - 0.3, top: i * floorHeight + 0.1 },
        });
      }
      if (bandFeatures.length > 0) {
        map.addSource("focus-floor-bands", { type: "geojson", data: { type: "FeatureCollection", features: bandFeatures } as any });
        map.addLayer({
          id: "focus-floor-bands-extrusion",
          source: "focus-floor-bands",
          type: "fill-extrusion",
          paint: {
            "fill-extrusion-color": "#0a131f",
            "fill-extrusion-height": ["get", "top"],
            "fill-extrusion-base": ["get", "base"],
            "fill-extrusion-opacity": 0.85,
          },
        } as any);
      }

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
          paint: {
            "line-color": "#34d399",
            "line-width": 3,
            "line-opacity": 0.9,
            "line-dasharray": [2, 2],
          },
        } as any);
        map.addLayer({
          id: "flight-paths-points",
          source: "flight-paths",
          type: "circle",
          paint: {
            "circle-radius": 5,
            "circle-color": "#34d399",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#0a131f",
          },
        } as any);
      }
    });

      // Floor bands - thin dark rings at every floor level
      const floorCount = building.floor_count ?? Math.floor((building.height_m ?? 40) / 3.5);
      const floorHeight = (building.height_m ?? 40) / Math.max(1, floorCount);
      const bandFeatures: any[] = [];
      for (let i = 1; i < floorCount; i++) {
        bandFeatures.push({
          type: "Feature",
          geometry: { type: "Polygon", coordinates: [[
            [lng - d, lat - d], [lng + d, lat - d], [lng + d, lat + d], [lng - d, lat + d], [lng - d, lat - d],
          ]] },
          properties: { base: i * floorHeight - 0.4, top: i * floorHeight + 0.2 },
        });
      }
      console.log("REHEARSE floor bands:", bandFeatures.length, "floors at", floorHeight.toFixed(1), "m each");
      if (bandFeatures.length > 0) {
        map.addSource("focus-floor-bands", { type: "geojson", data: { type: "FeatureCollection", features: bandFeatures } as any });
        map.addLayer({
          id: "focus-floor-bands-extrusion",
          source: "focus-floor-bands",
          type: "fill-extrusion",
          paint: {
            "fill-extrusion-color": "#020812",
            "fill-extrusion-height": ["get", "top"],
            "fill-extrusion-base": ["get", "base"],
            "fill-extrusion-opacity": 1.0,
          },
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