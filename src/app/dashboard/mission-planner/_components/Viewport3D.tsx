"use client";

import { useEffect, useRef } from "react";
import { useMission } from "@/lib/mission/context";
import { BLDS } from "@/lib/mission/buildings";
import { DEFECTS } from "@/lib/mission/defects";
import { project, projectFace, unprojectAtAltitude, DRONE_SCALE, type CameraState } from "@/lib/mission/projection";
import { type Waypoint } from "@/lib/mission/wpEngine";

type Ctx = CanvasRenderingContext2D;
interface DrawDeps { ctx: Ctx; W: number; H: number; cx: number; cy: number; cam: CameraState; wps: Waypoint[]; showPhysics: boolean; showDefects: boolean; sim: boolean; simT: number; cfgAlt: number; drone: keyof typeof DRONE_SCALE; wind: number; sun: number; frame: number; }

function drawGrid(d: DrawDeps): void {
  const { ctx, cam, cx, cy } = d;
  ctx.lineWidth = 0.7;
  for (let gx = -120; gx <= 120; gx += 20) {
    const a = project(gx, 0, -120, cam, cx, cy); const b = project(gx, 0, 120, cam, cx, cy);
    if (!a || !b) continue;
    ctx.beginPath(); ctx.moveTo(a.px, a.py); ctx.lineTo(b.px, b.py); ctx.strokeStyle = "rgba(8,100,140,.14)"; ctx.stroke();
  }
  for (let gz = -120; gz <= 120; gz += 20) {
    const a = project(-120, 0, gz, cam, cx, cy); const b = project(120, 0, gz, cam, cx, cy);
    if (!a || !b) continue;
    ctx.beginPath(); ctx.moveTo(a.px, a.py); ctx.lineTo(b.px, b.py); ctx.strokeStyle = "rgba(8,100,140,.14)"; ctx.stroke();
  }
}

function drawBuilding(d: DrawDeps, b: (typeof BLDS)[number]): void {
  const { ctx, cam, cx, cy } = d;
  const x0 = b.x - b.w / 2, x1 = b.x + b.w / 2, z0 = b.z - b.d / 2, z1 = b.z + b.d / 2, h = b.h;
  const faces: Array<Array<[number, number, number]>> = [
    [[x0, h, z0], [x1, h, z0], [x1, h, z1], [x0, h, z1]],
    [[x0, 0, z1], [x1, 0, z1], [x1, h, z1], [x0, h, z1]],
    [[x0, 0, z0], [x1, 0, z0], [x1, h, z0], [x0, h, z0]],
    [[x0, 0, z0], [x0, 0, z1], [x0, h, z1], [x0, h, z0]],
    [[x1, 0, z0], [x1, 0, z1], [x1, h, z1], [x1, h, z0]],
  ];
  const br = [1.05, 0.85, 0.55, 0.65, 0.75];
  faces.forEach((face, fi) => {
    const pts = projectFace(face, cam, cx, cy);
    if (pts.length < 3) return;
    const r2 = Math.min(255, Math.round(b.c[0] * br[fi])); const g2 = Math.min(255, Math.round(b.c[1] * br[fi])); const b2 = Math.min(255, Math.round(b.c[2] * br[fi]));
    ctx.beginPath(); ctx.moveTo(pts[0].px, pts[0].py);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].px, pts[i].py);
    ctx.closePath(); ctx.fillStyle = "rgba(" + r2 + "," + g2 + "," + b2 + ",0.92)"; ctx.fill();
    ctx.strokeStyle = "rgba(8,145,178,.12)"; ctx.lineWidth = 0.6; ctx.stroke();
  });
  const tp = project(b.x, h + 2, b.z, cam, cx, cy);
  if (tp) { ctx.fillStyle = "rgba(100,180,220,.45)"; ctx.font = "9px monospace"; ctx.textAlign = "center"; ctx.fillText(b.name, tp.px, tp.py); ctx.textAlign = "left"; }
}

function drawRoute(d: DrawDeps): void {
  const { ctx, cam, cx, cy, wps } = d;
  if (wps.length === 0) return;
  const p0 = project(wps[0].x, wps[0].y, wps[0].z, cam, cx, cy);
  if (!p0) return;
  ctx.beginPath(); ctx.moveTo(p0.px, p0.py);
  for (let i = 1; i < wps.length; i++) { const p = project(wps[i].x, wps[i].y, wps[i].z, cam, cx, cy); if (p) ctx.lineTo(p.px, p.py); }
  ctx.strokeStyle = "rgba(8,145,178,.8)"; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.stroke(); ctx.setLineDash([]);
}

function drawWP(d: DrawDeps, w: Waypoint): void {
  const { ctx, cam, cx, cy } = d;
  const p = project(w.x, w.y, w.z, cam, cx, cy);
  if (!p) return;
  const r = Math.max(5, 1460 / p.depth);
  const grad = ctx.createRadialGradient(p.px, p.py, 0, p.px, p.py, r);
  const col = w.type === "home" ? ["#6ee7a4", "#15803d"] : ["#7dd3e8", "#0e7490"];
  grad.addColorStop(0, col[0]); grad.addColorStop(1, col[1]);
  ctx.beginPath(); ctx.arc(p.px, p.py, r, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.lineWidth = 1; ctx.stroke();
}

function drawDrone(d: DrawDeps): void {
  const { ctx, cam, cx, cy, wps, cfgAlt, drone, frame } = d;
  if (d.sim && wps.length > 0) return;
  let dx = 0, dy = cfgAlt / 4 + Math.sin(frame * 0.025) * 0.4, dz = 6;
  if (wps.length > 0) { const last = wps[wps.length - 1]; dx = last.x; dy = last.y; dz = last.z; }
  const p = project(dx, dy, dz, cam, cx, cy);
  if (!p) return;
  const s = Math.max(6, DRONE_SCALE[drone] * 1860 / p.depth);
  ctx.save(); ctx.translate(p.px, p.py);
  ctx.fillStyle = "rgba(200,220,240,.9)"; ctx.fillRect(-s * 0.45, -s * 0.2, s * 0.9, s * 0.4);
  for (const [ax, az] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(ax * s * 0.55, az * s * 0.55);
    ctx.strokeStyle = "rgba(180,200,220,.8)"; ctx.lineWidth = Math.max(1, s * 0.08); ctx.stroke();
  }
  ctx.restore();
}

function drawSimDrone(d: DrawDeps): void {
  const { ctx, cam, cx, cy, wps, simT } = d;
  if (wps.length === 0) return;
  const t = Math.min(simT / 100, 0.999);
  const idx = Math.floor(t * (wps.length - 1));
  const frac = t * (wps.length - 1) - idx;
  const w1 = wps[Math.min(idx, wps.length - 1)]; const w2 = wps[Math.min(idx + 1, wps.length - 1)];
  const sx = w1.x + (w2.x - w1.x) * frac, sy = w1.y + (w2.y - w1.y) * frac, sz = w1.z + (w2.z - w1.z) * frac;
  const p = project(sx, sy, sz, cam, cx, cy);
  if (!p) return;
  const s = Math.max(8, 2060 / p.depth);
  ctx.save(); ctx.translate(p.px, p.py);
  ctx.fillStyle = "rgba(251,191,36,.9)"; ctx.fillRect(-s * 0.4, -s * 0.15, s * 0.8, s * 0.3);
  ctx.restore();
}

function drawDefects(d: DrawDeps): void {
  const { ctx, cam, cx, cy, frame } = d;
  for (const def of DEFECTS) {
    const p = project(def.bx, def.by, def.bz, cam, cx, cy);
    if (!p) continue;
    const pulse = 0.5 + Math.sin(frame * 0.08) * 0.5;
    const col = def.kind === "danger" ? "rgba(239,68,68," + (0.7 - pulse * 0.3) + ")" : "rgba(245,158,11," + (0.6 + pulse * 0.2) + ")";
    const r = 5 + pulse * 2;
    ctx.beginPath(); ctx.arc(p.px, p.py, r, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
  }
}

function drawPhysics(d: DrawDeps): void {
  const { ctx, cam, cx, cy, wind, sun } = d;
  const wa = project(-28, 14, 0, cam, cx, cy); const we = project(-18, 14, 0, cam, cx, cy);
  if (wa && we) {
    ctx.beginPath(); ctx.moveTo(wa.px, wa.py); ctx.lineTo(we.px, we.py);
    ctx.strokeStyle = "rgba(8,145,178,.7)"; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = "rgba(8,145,178,.6)"; ctx.font = "9px monospace";
    ctx.fillText(wind.toFixed(1) + "m/s", wa.px - 4, wa.py - 6);
  }
  const sunPos = project(20, 40, -15, cam, cx, cy);
  if (sunPos) {
    ctx.beginPath(); ctx.arc(sunPos.px, sunPos.py, 5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(251,191,36,.7)"; ctx.fill();
    ctx.fillStyle = "rgba(251,191,36,.6)"; ctx.font = "9px monospace";
    ctx.fillText(sun + "deg", sunPos.px + 8, sunPos.py + 4);
  }
}

function drawScene(d: DrawDeps): void {
  const { ctx, W, H } = d;
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#060e1d"); sky.addColorStop(0.6, "#091524"); sky.addColorStop(1, "#0c1d2e");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  drawGrid(d);
  const sorted = [...BLDS].sort((a, b) => {
    const pa = project(a.x, a.h / 2, a.z, d.cam, d.cx, d.cy);
    const pb = project(b.x, b.h / 2, b.z, d.cam, d.cx, d.cy);
    return (pb ? pb.depth : 0) - (pa ? pa.depth : 0);
  });
  for (const b of sorted) drawBuilding(d, b);
  if (d.wps.length > 1) drawRoute(d);
  d.wps.forEach((w) => drawWP(d, w));
  drawDrone(d);
  if (d.showPhysics) drawPhysics(d);
  if (d.showDefects) drawDefects(d);
  if (d.sim && d.wps.length > 1) drawSimDrone(d);
}

export default function Viewport3D() {
  const m = useMission();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef({ drag: false, lx: 0, ly: 0, moved: 0 });
  const frameRef = useRef(0);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = t - last; last = t;
      if (m.sim) m.tickSim(dt / 1000);
      const ctx = c.getContext("2d");
      if (!ctx) return;
      c.width = c.offsetWidth || 800;
      c.height = c.offsetHeight || 600;
      const W = c.width, H = c.height;
      frameRef.current += 1;
      drawScene({
        ctx, W, H, cx: W / 2, cy: H / 2,
        cam: m.cam, wps: m.wps,
        showPhysics: m.showPhysics, showDefects: m.showDefects,
        sim: m.sim, simT: m.simT,
        cfgAlt: m.cfg.alt, drone: m.drone,
        wind: m.phy.wind, sun: m.phy.sun,
        frame: frameRef.current,
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [m]);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    dragRef.current = { drag: true, lx: e.clientX, ly: e.clientY, moved: 0 };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.drag) return;
    const dx = e.clientX - dragRef.current.lx;
    const dy = e.clientY - dragRef.current.ly;
    dragRef.current.moved += Math.abs(dx) + Math.abs(dy);
    if (e.shiftKey) {
      m.setCam({ ...m.cam, target: { x: m.cam.target.x - dx * m.cam.dist / 1800, y: m.cam.target.y + dy * m.cam.dist / 1800, z: m.cam.target.z } });
    } else {
      m.setCam({ ...m.cam, angleH: m.cam.angleH - dx * 0.005, angleV: Math.max(0.05, Math.min(1.45, m.cam.angleV + dy * 0.005)) });
    }
    dragRef.current.lx = e.clientX;
    dragRef.current.ly = e.clientY;
  };
  const onPointerUp = () => { dragRef.current.drag = false; };
  const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    m.setCam({ ...m.cam, dist: Math.max(10, Math.min(320, m.cam.dist + e.deltaY * 0.18)) });
  };
  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragRef.current.moved > 8) return;
    const c = canvasRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const hit = unprojectAtAltitude(mx, my, m.cfg.alt / 4, m.cam, c.width / 2, c.height / 2);
    if (!hit) return;
    m.addWP(hit.x, m.cfg.alt / 4, hit.z, m.mode === "home" ? "home" : "wp");
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onWheel={onWheel}
      onClick={onClick}
      style={{ display: "block", width: "100%", height: "100%", cursor: m.mode === "wp" ? "crosshair" : "grab", background: "#050e1a" }}
    />
  );
}
