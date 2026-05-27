"use client";

import { useEffect, useRef } from "react";
import type { PoseLandmarks, FaceLandmarks } from "@/lib/nursing/perception/types";

interface Props {
  videoRef: React.RefObject<HTMLVideoElement>;
  pose: PoseLandmarks | null;
  face: FaceLandmarks | null;
  showFace?: boolean;
  showPose?: boolean;
}

// BlazePose skeleton edges (parent -> child)
const POSE_EDGES: Array<[number, number]> = [
  [11, 12], [11, 13], [13, 15],
  [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [27, 29], [27, 31],
  [24, 26], [26, 28], [28, 30], [28, 32],
];

export default function OverlayCanvas({ videoRef, pose, face, showFace = true, showPose = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    const v = videoRef.current;
    if (!c || !v) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!c || !v) return;
      const rect = v.getBoundingClientRect();
      c.width = rect.width * devicePixelRatio;
      c.height = rect.height * devicePixelRatio;
      c.style.width = rect.width + "px";
      c.style.height = rect.height + "px";
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(v);

    return () => ro.disconnect();
  }, [videoRef]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, c.width, c.height);

    if (showPose && pose) {
      ctx.strokeStyle = "#10b981";
      ctx.fillStyle = "#10b981";
      ctx.lineWidth = 2 * devicePixelRatio;
      // edges
      for (const [a, b] of POSE_EDGES) {
        const pa = pose.points[a];
        const pb = pose.points[b];
        if (!pa || !pb) continue;
        ctx.beginPath();
        ctx.moveTo(pa.x * c.width, pa.y * c.height);
        ctx.lineTo(pb.x * c.width, pb.y * c.height);
        ctx.stroke();
      }
      // joints
      for (const p of pose.points) {
        ctx.beginPath();
        ctx.arc(p.x * c.width, p.y * c.height, 3 * devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (showFace && face) {
      ctx.fillStyle = "rgba(34, 211, 238, 0.6)";
      for (let i = 0; i < face.points.length; i += 4) {
        const p = face.points[i];
        if (!p) continue;
        ctx.beginPath();
        ctx.arc(p.x * c.width, p.y * c.height, 1.5 * devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [pose, face, showFace, showPose]);

  return (
    anvas
      ref={canvasRef}
      style={{
        position: "absolute", inset: 0,
        pointerEvents: "none", zIndex: 2,
      }}
    />
  );
}