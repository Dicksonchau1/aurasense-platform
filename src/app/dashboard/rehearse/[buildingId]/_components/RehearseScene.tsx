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


      // Focus building pin
      const pinEl = document.createElement("div");
      pinEl.id = "rehearse-focus-pin";
      pinEl.style.cssText = "width:38px;height:54px;position:relative;cursor:pointer;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.5));";
      pinEl.innerHTML = '<svg viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg" width="38" height="54"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"/>ircle cx="12" cy="12" r="5" fill="#ffffff"/>ircle cx="12" cy="12" r="2.5" fill="#ef4444"/></svg>';
      const pinPopup = new mapboxgl.Popup({ offset: 28, closeButton: false }).setHTML(
        '<div style="font-family:ui-monospace,monospace;font-size:11px;color:#0a0a0a;padding:4px 8px;">' +
        '<div style="color:#ef4444;font-weight:700;text-transform:uppercase;letter-spacing:1px;font-size:10px;margin-bottom:2px;">Focus Target</div>' +
        '<div style="font-weight:700;color:#0a0a0a;">' + (building.name ?? "Unknown") + '</div>' +
        '<div style="color:#666;">' + (building.height_m ?? "?") + 'm</div>' +
        '</div>'
      );
      new mapboxgl.Marker({ element: pinEl, anchor: "bottom" })
        .setLngLat([building.lng as number, (building.lat as number) + 0.00005])
        .setPopup(pinPopup)
        .addTo(map);
      console.log("[Rehearse] MBIS layer added for tile", tileZ, tileX, tileY, "origin", originLat.toFixed(5), originLng.toFixed(5));

      // Hovering drone above this building's rooftop
      const droneAlt = (building.height_m ?? 80) + 20;
      // Route sources (E.3)
      if (!map.getSource("rehearse-route")) {
        map.addSource("rehearse-route", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addSource("rehearse-route-pts", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({
          id: "rehearse-route-line",
          source: "rehearse-route",
          type: "line",
          paint: { "line-color": "#facc15", "line-width": 2, "line-opacity": 0.4 },
        } as any);
        // Current-waypoint cyan halo pulse
        map.addLayer({
          id: "rehearse-route-pts-current",
          source: "rehearse-route-pts",
          type: "circle",
          filter: ["==", ["get", "current"], true],
          paint: {
            "circle-radius": 18,
            "circle-color": "rgba(34,211,238,0.0)",
            "circle-stroke-width": 3,
            "circle-stroke-color": "#22d3ee",
            "circle-stroke-opacity": 0.85,
          },
        } as any);
        map.addLayer({
          id: "rehearse-route-pts-label",
          source: "rehearse-route-pts",
          type: "symbol",
          layout: {
            "text-field": ["concat", "WP ", ["to-string", ["get", "seq"]]],
            "text-size": 11,
            "text-offset": [0, 1.5],
            "text-anchor": "top",
          },
          paint: { "text-color": "#facc15", "text-halo-color": "#0a0a0a", "text-halo-width": 1.5 },
        } as any);
      }
      if (!map.getSource("rehearse-route")) {
        map.addSource("rehearse-route", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addSource("rehearse-route-pts", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({
          id: "rehearse-route-line",
          source: "rehearse-route",
          type: "line",
          paint: { "line-color": "#facc15", "line-width": 2, "line-opacity": 0.4 },
        } as any);
        // Current-waypoint cyan halo pulse
        map.addLayer({
          id: "rehearse-route-pts-label",
          source: "rehearse-route-pts",
          type: "symbol",
          layout: {
            "text-field": ["concat", "WP ", ["to-string", ["get", "seq"]]],
            "text-size": 11,
            "text-offset": [0, 1.5],
            "text-anchor": "top",
          },
          paint: { "text-color": "#facc15", "text-halo-color": "#0a0a0a", "text-halo-width": 1.5 },
        } as any);
      }
      map.addLayer(new HoverDroneLayer({
        lat: building.lat as number,
        lng: building.lng as number,
        altitudeM: droneAlt,
        batterySoc: 0.95,
      }));

      // Map click -> dispatch floor click event for right rail to consume
      map.on("click", (ev: any) => {
        const e = new CustomEvent("rehearse-map-click", {
          detail: { lng: ev.lngLat.lng, lat: ev.lngLat.lat, building_id: building.id },
        });
        window.dispatchEvent(e);
      });

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
