"use client";

import { useEffect, useRef } from "react";
import { Card, Row, Badge } from "../../_components/SpecCard";
import { RADAR_CONFIG, RADAR_OBJS, OBSTACLE_ZONES } from "@/lib/mock/robot-specs";

export default function RadarTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let ang = 0;
    let raf = 0;

    const draw = () => {
      const W = cv.width;
      const H = cv.height;
      const cx = W / 2;
      const cy = H / 2;
      const R = Math.min(W, H) / 2 - 20;

      // Background
      ctx.fillStyle = "#040d1a";
      ctx.fillRect(0, 0, W, H);

      // Range rings
      [0.25, 0.5, 0.75, 1].forEach((r) => {
        ctx.beginPath();
        ctx.arc(cx, cy, R * r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(79,152,163,.18)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "rgba(79,152,163,.45)";
        ctx.font = "9px ui-monospace, monospace";
        ctx.fillText(Math.round(r * 70) + "m", cx + R * r + 3, cy - 2);
      });

      // Cross axes
      ctx.strokeStyle = "rgba(79,152,163,.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R);
      ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy);
      ctx.stroke();

      // Cardinal labels
      ctx.fillStyle = "rgba(79,152,163,.55)";
      ctx.font = "bold 10px ui-monospace, monospace";
      ctx.fillText("N", cx - 4, cy - R - 6);
      ctx.fillText("S", cx - 4, cy + R + 14);
      ctx.fillText("E", cx + R + 6, cy + 4);
      ctx.fillText("W", cx - R - 14, cy + 4);

      // Sweep cone trailing behind ang
      ctx.save();
      ctx.translate(cx, cy);
      for (let da = 0; da < Math.PI / 3; da += 0.015) {
        const a = ang - da;
        const alpha = (0.35 - (da / (Math.PI / 3)) * 0.32);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, R, a, a + 0.018);
        ctx.closePath();
        ctx.fillStyle = "rgba(79,152,163," + alpha + ")";
        ctx.fill();
      }
      // Leading edge line
      ctx.strokeStyle = "rgba(110,192,207,.95)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(ang) * R, Math.sin(ang) * R);
      ctx.stroke();
      ctx.restore();
      ang += 0.035;

      // Objects
      RADAR_OBJS.forEach((o) => {
        const ox = cx + Math.cos(o.angle) * R * o.range;
        const oy = cy + Math.sin(o.angle) * R * o.range;
        const diff = Math.abs(((ang - o.angle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2));
        const bright = diff < 0.3 ? 1 - diff / 1.5 : 0.12;
        ctx.beginPath();
        ctx.arc(ox, oy, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(110,192,207," + bright + ")";
        ctx.fill();
        if (bright > 0.3) {
          ctx.fillStyle = "rgba(110,192,207," + bright * 0.85 + ")";
          ctx.font = "9px ui-monospace, monospace";
          ctx.fillText(o.label, ox + 7, oy - 4);
        }
      });

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(110,192,207,.95)";
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };

    cv.width = cv.offsetWidth || 400;
    cv.height = cv.offsetHeight || 360;
    draw();

    const onResize = () => {
      cv.width = cv.offsetWidth || 400;
      cv.height = cv.offsetHeight || 360;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 12 }}>
      <Card title="Radar / LiDAR Sweep">
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            width: "100%",
            height: 360,
            borderRadius: 9,
            background: "#040d1a",
            border: "1px solid rgba(79,152,163,.3)",
          }}
        />
        <div style={{ marginTop: 10, fontSize: 10.5, color: "#8b9aae", fontFamily: "ui-monospace, monospace", textAlign: "center" }}>
          PPI display - {RADAR_OBJS.length} contacts - rotating at 10 Hz
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Card title="Radar Config">
          {RADAR_CONFIG.map((s) =>
            s.badge ? (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 9px", fontSize: 12 }}>
                <span style={{ color: "#8b9aae", fontWeight: 500 }}>{s.label}</span>
                <Badge kind={s.badge}>{s.value}</Badge>
              </div>
            ) : (
              <Row key={s.label} label={s.label}>{s.value}</Row>
            )
          )}
        </Card>

        <Card title="Detected Objects">
          {RADAR_OBJS.map((o) => (
            <Row key={o.label} label={o.label}>
              {Math.round(o.range * 70)} m
            </Row>
          ))}
        </Card>

        <Card title="Obstacle Zones">
          {OBSTACLE_ZONES.map((z) => (
            <div key={z.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 9px", fontSize: 12 }}>
              <span style={{ color: "#8b9aae", fontWeight: 500 }}>{z.label}</span>
              <Badge kind={z.badge ?? "info"}>{z.value}</Badge>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
