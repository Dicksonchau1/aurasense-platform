"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MbisGlbLayer } from "./MbisGlbLayer";
import { HoverDroneLayer } from "./HoverDroneLayer";
import { WaypointDronesLayer } from "./WaypointDronesLayer";
import { PhysicsVizLayer } from "./PhysicsVizLayer";
import { WaypointEditor, type Waypoint } from "./WaypointEditor";

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
  const [editingWaypoints, setEditingWaypoints] = useState(false);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);

  const handleWaypointsChange = useCallback((wps: Waypoint[]) => {
    setWaypoints(wps);
    const map = mapRef.current;
    if (!map || !map.getSource("rehearse-route")) return;
    const lineCoords = wps.map(w => [w.lng, w.lat]);
    const lineFc: any = { type: "FeatureCollection", features: lineCoords.length >= 2 ? [{ type: "Feature", geometry: { type: "LineString", coordinates: lineCoords }, properties: {} }] : [] };
    const ptFc: any = { type: "FeatureCollection", features: wps.map(w => ({ type: "Feature", geometry: { type: "Point", coordinates: [w.lng, w.lat] }, properties: { seq: w.seq, alt: w.alt_m } })) };
    (map.getSource("rehearse-route") as mapboxgl.GeoJSONSource).setData(lineFc);
    (map.getSource("rehearse-route-pts") as mapboxgl.GeoJSONSource).setData(ptFc);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !TOKEN || building.lat == null || building.lng == null) return;
    mapboxgl.accessToken = TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [building.lng, building.lat],
      zoom: 17.5,
      pitch: 75,
      bearing: 42,
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

      map.addLayer(new MbisGlbLayer({ z: tileZ, x: tileX, y: tileY, originLat, originLng }) as any);
      map.addLayer(new WaypointDronesLayer() as any);
      map.addLayer(new PhysicsVizLayer({
        buildingLat: building.lat as number,
        buildingLng: building.lng as number,
        buildingHeightM: building.height_m ?? 80,
        windSpeedMs: 5.2,
        windDirDeg: 220,
      }) as any);

      const pinEl = document.createElement("div");
      pinEl.id = "rehearse-focus-pin";
      pinEl.style.cssText = "width:38px;height:54px;position:relative;cursor:pointer;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.5));";
      pinEl.innerHTML = '<svg viewBox="0 0 24 36" width="38" height="54"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" fill="#ef4444" stroke="#fff" stroke-width="1.5"/>ircle cx="12" cy="12" r="5" fill="#fff"/>ircle cx="12" cy="12" r="2.5" fill="#ef4444"/></svg>';
      new mapboxgl.Marker({ element: pinEl, anchor: "bottom" })
        .setLngLat([building.lng as number, (building.lat as number) + 0.00005])
        .addTo(map);

      const droneAlt = (building.height_m ?? 80) + 20;
      map.addLayer(new HoverDroneLayer({
        lat: building.lat as number,
        lng: building.lng as number,
        altitudeM: droneAlt,
        batterySoc: 0.95,
      }) as any);

      if (!map.getSource("rehearse-route")) {
        map.addSource("rehearse-route", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addSource("rehearse-route-pts", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addSource("drone-trail", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({ id: "rehearse-route-line", source: "rehearse-route", type: "line", paint: { "line-color": "#facc15", "line-width": 2, "line-opacity": 0.4 } } as any);
        map.addLayer({ id: "drone-trail-line", source: "drone-trail", type: "line", paint: { "line-color": "#22d3ee", "line-width": 6, "line-opacity": 0.95 } } as any);
        map.addLayer({ id: "rehearse-route-pts-label", source: "rehearse-route-pts", type: "symbol", layout: { "text-field": ["concat", "WP ", ["to-string", ["get", "seq"]]], "text-size": 11, "text-offset": [0, 1.5], "text-anchor": "top" }, paint: { "text-color": "#facc15", "text-halo-color": "#0a0a0a", "text-halo-width": 1.5 } } as any);
      }

      map.on("click", (ev: any) => {
        window.dispatchEvent(new CustomEvent("rehearse-map-click", { detail: { lng: ev.lngLat.lng, lat: ev.lngLat.lat, building_id: building.id } }));
      });
    });

    const trailCoords: Array<[number, number]> = [];
    const trailHandler = (ev: any) => {
      const d = ev?.detail;
      if (!d) return;
      trailCoords.push([d.lng, d.lat]);
      if (trailCoords.length > 600) trailCoords.shift();
      const src = map.getSource("drone-trail") as mapboxgl.GeoJSONSource | undefined;
      if (src) {
        src.setData({ type: "FeatureCollection", features: trailCoords.length >= 2 ? [{ type: "Feature", geometry: { type: "LineString", coordinates: trailCoords }, properties: {} }] : [] } as any);
      }
    };
    const resetHandler = () => { trailCoords.length = 0; const src = map.getSource("drone-trail") as mapboxgl.GeoJSONSource | undefined; if (src) src.setData({ type: "FeatureCollection", features: [] } as any); };
    window.addEventListener("rehearse-drone-position", trailHandler);
    window.addEventListener("rehearse-trail-reset", resetHandler);

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(new mapboxgl.ScaleControl({ unit: "metric" }), "bottom-left");

    return () => {
      window.removeEventListener("rehearse-drone-position", trailHandler);
      window.removeEventListener("rehearse-trail-reset", resetHandler);
      mapRef.current = null;
      map.remove();
    };
  }, [building, plans]);

  return (
    <>
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />
      <button
        onClick={() => setEditingWaypoints((v) => !v)}
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 6,
          padding: "6px 12px",
          background: editingWaypoints ? "#facc15" : "rgba(6,12,24,0.92)",
          color: editingWaypoints ? "#0a0a0a" : "#facc15",
          border: "1px solid rgba(250,204,21,0.5)",
          borderRadius: 5,
          fontFamily: "ui-monospace,monospace",
          fontSize: 11,
          fontWeight: 700,
          cursor: "pointer",
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {editingWaypoints ? "Editing Route" : "Plan Route"}
      </button>
      <WaypointEditor
        map={mapRef.current}
        buildingId={building.id}
        defaultAltitudeM={(building.height_m ?? 80) + 10}
        active={editingWaypoints}
        onChange={handleWaypointsChange}
      />
    </>
  );
}