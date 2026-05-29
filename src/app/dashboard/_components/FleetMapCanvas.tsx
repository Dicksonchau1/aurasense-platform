"use client";
import { useEffect, useRef } from "react";

type DroneStatus = "active" | "rth" | "warn" | "offline" | "standby";
interface FleetEntry {
  id: string;
  status: DroneStatus;
  bat: number;
  lat?: number;
  lng?: number;
  mission?: string;
}

const STATUS_COLOR: Record<DroneStatus, string> = {
  active: "#22c55e",
  rth: "#3b82f6",
  warn: "#f59e0b",
  offline: "#ef4444",
  standby: "#8b9aae",
};

// HK bounding box for map projection
const HK_BOUNDS = { minLat: 22.19, maxLat: 22.57, minLng: 113.83, maxLng: 114.44 };

function latLngToXY(lat: number, lng: number, W: number, H: number): [number, number] {
  const x = ((lng - HK_BOUNDS.minLng) / (HK_BOUNDS.maxLng - HK_BOUNDS.minLng)) * W;
  const y = H - ((lat - HK_BOUNDS.minLat) / (HK_BOUNDS.maxLat - HK_BOUNDS.minLat)) * H;
  return [x, y];
}

interface Props {
  fleet: FleetEntry[];
}

export default function FleetMapCanvas({ fleet }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const pulseRef = useRef(0);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const W = cv.width;
      const H = cv.height;
      pulseRef.current += 0.05;

      // Background — stylized HK map
      ctx.fillStyle = "#060f1e";
      ctx.fillRect(0, 0, W, H);

      // Water gradient
      const waterGrad = ctx.createLinearGradient(0, 0, W, H);
      waterGrad.addColorStop(0, "rgba(4,20,50,.8)");
      waterGrad.addColorStop(1, "rgba(8,30,70,.6)");
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = "rgba(79,152,163,.08)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < W; i += W / 8) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
      }
      for (let i = 0; i < H; i += H / 6) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke();
      }

      // Kowloon peninsula outline (simplified)
      ctx.beginPath();
      ctx.fillStyle = "rgba(20,40,70,.6)";
      const kowloon: [number, number][] = [
        [22.30, 114.15], [22.32, 114.12], [22.35, 114.11], [22.38, 114.13],
        [22.40, 114.17], [22.38, 114.20], [22.35, 114.22], [22.32, 114.20],
      ];
      kowloon.forEach(([lat, lng], i) => {
        const [x, y] = latLngToXY(lat, lng, W, H);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fill();

      // HK Island outline (simplified)
      ctx.beginPath();
      ctx.fillStyle = "rgba(15,35,60,.6)";
      const hkisland: [number, number][] = [
        [22.20, 114.10], [22.22, 114.07], [22.25, 114.08], [22.28, 114.12],
        [22.28, 114.18], [22.26, 114.22], [22.23, 114.22], [22.20, 114.18],
      ];
      hkisland.forEach(([lat, lng], i) => {
        const [x, y] = latLngToXY(lat, lng, W, H);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fill();

      // Victoria Harbour label
      ctx.fillStyle = "rgba(79,152,163,.35)";
      ctx.font = "bold 8px ui-monospace, monospace";
      ctx.fillText("VICTORIA HARBOUR", W * 0.35, H * 0.55);

      // Draw drones with live positions
      const drones = fleet.filter(d => d.lat !== undefined && d.lng !== undefined);
      drones.forEach((d) => {
        const [x, y] = latLngToXY(d.lat!, d.lng!, W, H);
        const color = STATUS_COLOR[d.status];
        const pulse = Math.sin(pulseRef.current + drones.indexOf(d)) * 0.5 + 0.5;

        // Pulse ring for active drones
        if (d.status === "active" || d.status === "warn") {
          ctx.beginPath();
          ctx.arc(x, y, 10 + pulse * 6, 0, Math.PI * 2);
          ctx.strokeStyle = color + "44";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Drone dot
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label
        ctx.fillStyle = "#e0e8f2";
        ctx.font = "bold 9px ui-monospace, monospace";
        ctx.fillText(d.id, x + 8, y - 4);

        // Battery indicator
        const batColor = d.bat > 50 ? "#22c55e" : d.bat > 20 ? "#f59e0b" : "#ef4444";
        ctx.fillStyle = "rgba(0,0,0,.6)";
        ctx.fillRect(x + 8, y + 2, 22, 4);
        ctx.fillStyle = batColor;
        ctx.fillRect(x + 8, y + 2, 22 * (d.bat / 100), 4);
      });

      // Compass rose
      ctx.save();
      ctx.translate(W - 22, 22);
      ctx.fillStyle = "rgba(79,152,163,.7)";
      ctx.font = "bold 9px ui-monospace, monospace";
      ctx.fillText("N", -3, -10);
      ctx.fillStyle = "rgba(79,152,163,.4)";
      ctx.beginPath();
      ctx.moveTo(0, -8); ctx.lineTo(3, 0); ctx.lineTo(0, 3); ctx.lineTo(-3, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Scale bar
      ctx.fillStyle = "rgba(79,152,163,.5)";
      ctx.fillRect(10, H - 14, 40, 2);
      ctx.font = "8px ui-monospace, monospace";
      ctx.fillStyle = "rgba(79,152,163,.6)";
      ctx.fillText("~5 km", 10, H - 4);

      animRef.current = requestAnimationFrame(draw);
    };

    cv.width = cv.offsetWidth || 340;
    cv.height = cv.offsetHeight || 220;
    draw();

    const ro = new ResizeObserver(() => {
      cv.width = cv.offsetWidth || 340;
      cv.height = cv.offsetHeight || 220;
    });
    ro.observe(cv);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [fleet]);

  return (
    <div style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: 220, borderRadius: 8, background: "#060f1e" }}
      />
      <div style={{ position: "absolute", bottom: 6, right: 8, fontSize: 9, fontFamily: "ui-monospace, monospace", color: "rgba(79,152,163,.6)" }}>
        LIVE · {fleet.filter(d => d.lat !== undefined).length} drones tracked
      </div>
    </div>
  );
}
