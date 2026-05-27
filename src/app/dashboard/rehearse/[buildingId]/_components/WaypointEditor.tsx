"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

export interface Waypoint {
  seq: number;
  lat: number;
  lng: number;
  alt_m: number;
  speed_ms: number;
}

interface Props {
  map: mapboxgl.Map | null;
  buildingId: string;
  defaultAltitudeM: number;
  active: boolean;
  onChange: (wps: Waypoint[]) => void;
}

export function WaypointEditor({ map, buildingId, defaultAltitudeM, active, onChange }: Props) {
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const wpsRef = useRef<Waypoint[]>([]);
  const [, setRerender] = useState(0);

  const force = () => setRerender(n => n + 1);

  const renumber = () => {
    wpsRef.current.forEach((w, i) => { w.seq = i + 1; });
    markersRef.current.forEach((m, i) => {
      const el = m.getElement();
      const label = el.querySelector(".wp-num") as HTMLDivElement | null;
      if (label) label.textContent = String(i + 1);
    });
  };

  const emit = () => {
    onChange([...wpsRef.current]);
    window.dispatchEvent(new CustomEvent("rehearse-waypoints-set", { detail: { waypoints: wpsRef.current.map(w => ({ seq: w.seq, lat: w.lat, lng: w.lng, alt_m: w.alt_m })) } }));
    force();
  };

  const makeMarkerEl = (n: number) => {
    const root = document.createElement("div");
    root.className = "wp-marker"; root.style.display = "none";
    root.style.cssText = "width:26px;height:26px;display:flex;align-items:center;justify-content:center;cursor:grab;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));position:relative;";
    // Drone SVG: 4 rotor arms + central body
    root.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><g>ircle cx="4" cy="4" r="3" fill="#facc15" stroke="#0a0a0a" stroke-width="0.8"/>ircle cx="20" cy="4" r="3" fill="#facc15" stroke="#0a0a0a" stroke-width="0.8"/>ircle cx="4" cy="20" r="3" fill="#facc15" stroke="#0a0a0a" stroke-width="0.8"/>ircle cx="20" cy="20" r="3" fill="#facc15" stroke="#0a0a0a" stroke-width="0.8"/>e x1="6" y1="6" x2="18" y2="18" stroke="#0a0a0a" stroke-width="1.4"/>e x1="18" y1="6" x2="6" y2="18" stroke="#0a0a0a" stroke-width="1.4"/><rect x="9" y="9" width="6" height="6" rx="1" fill="#0a0a0a"/></g></svg>';
    const label = document.createElement("div");
    label.className = "wp-num";
    label.textContent = String(n);
    label.style.cssText = "position:absolute;top:-12px;right:-12px;background:#0a0a0a;color:#facc15;font-family:ui-monospace,monospace;font-size:9px;font-weight:700;border-radius:8px;min-width:14px;height:14px;padding:0 3px;display:flex;align-items:center;justify-content:center;border:1px solid #facc15;";
    root.appendChild(label);
    return root;
  };

  const addWaypointAt = (lng: number, lat: number) => {
    if (!map) return;
    const seq = wpsRef.current.length + 1;
    const wp: Waypoint = { seq, lat, lng, alt_m: defaultAltitudeM, speed_ms: 5 };
    wpsRef.current.push(wp);
    const el = makeMarkerEl(seq);
    const marker = new mapboxgl.Marker({ element: el, draggable: true })
      .setLngLat([lng, lat])
      .addTo(map);
    marker.on("dragend", () => {
      const idx = markersRef.current.indexOf(marker);
      if (idx >= 0) {
        const ll = marker.getLngLat();
        wpsRef.current[idx].lat = ll.lat;
        wpsRef.current[idx].lng = ll.lng;
        emit();
      }
    });
    el.addEventListener("contextmenu", (ev) => {
      ev.preventDefault();
      const idx = markersRef.current.indexOf(marker);
      if (idx >= 0) {
        marker.remove();
        markersRef.current.splice(idx, 1);
        wpsRef.current.splice(idx, 1);
        renumber();
        emit();
      }
    });
    markersRef.current.push(marker);
    emit();
  };

  const clearAll = () => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    wpsRef.current = [];
    emit();
  };

  useEffect(() => {
    if (!map) return;
    const handler = (ev: any) => {
      if (!active) return;
      addWaypointAt(ev.lngLat.lng, ev.lngLat.lat);
    };
    map.on("click", handler);
    return () => { map.off("click", handler); };
  }, [map, active, defaultAltitudeM]);

  // External listener: floor-card "Add inspection waypoint" button (E.4)
  useEffect(() => {
    const handler = (ev: any) => {
      const d = ev?.detail;
      if (!d || d.building_id !== buildingId) return;
      addWaypointAt(d.lng, d.lat);
      if (wpsRef.current.length > 0) {
        wpsRef.current[wpsRef.current.length - 1].alt_m = d.alt_m ?? defaultAltitudeM;
        emit();
      }
    };
    window.addEventListener("rehearse-add-waypoint", handler as EventListener);
    return () => window.removeEventListener("rehearse-add-waypoint", handler as EventListener);
  }, [buildingId, defaultAltitudeM, map]);

  if (!active) return null;
  return (
    <div style={{ position: "absolute", top: 64, left: 12, zIndex: 5, background: "rgba(6,12,24,0.92)", border: "1px solid rgba(34,211,238,0.4)", borderRadius: 6, padding: "8px 10px", fontFamily: "ui-monospace,monospace", color: "#cfd8e3", fontSize: 11, minWidth: 220 }}>
      <div style={{ fontSize: 10, color: "rgba(34,211,238,0.9)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Waypoint Editor</div>
      <div style={{ marginBottom: 6 }}>Click map to add. Drag to move. Right-click to delete.</div>
      <div style={{ marginBottom: 8 }}>{wpsRef.current.length} waypoint{wpsRef.current.length === 1 ? "" : "s"}</div>
      <button onClick={clearAll} style={{ width: "100%", padding: "5px 8px", background: "transparent", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 4, fontSize: 11, cursor: "pointer" }}>Clear all</button>
    </div>
  );
}