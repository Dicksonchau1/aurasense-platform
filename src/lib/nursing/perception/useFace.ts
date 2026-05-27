"use client";

import { useEffect, useRef, useState } from "react";
import type { FaceLandmarks } from "./types";

export function useFace(videoRef: React.RefObject<HTMLVideoElement>, enabled: boolean) {
  const [landmarks, setLandmarks] = useState<FaceLandmarks | null>(null);
  const rafRef = useRef<number | null>(null);
  const landmarkerRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    (async () => {
      const vision = await import("@mediapipe/tasks-vision");
      const filesetResolver = await vision.FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm",
      );
      if (cancelled) return;
      landmarkerRef.current = await vision.FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPUWrite-NurseFile 'src\lib\nursing\perception\useFace.ts' @'
"use client";

import { useEffect, useRef, useState } from "react";
import type { FaceLandmarks } from "./types";

export function useFace(videoRef: React.RefObject<HTMLVideoElement>, enabled: boolean) {
  const [landmarks, setLandmarks] = useState<FaceLandmarks | null>(null);
  const rafRef = useRef<number | null>(null);
  const landmarkerRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    (async () => {
      const vision = await import("@mediapipe/tasks-vision");
      const filesetResolver = await vision.FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm",
      );
      if (cancelled) return;
      landmarkerRef.current = await vision.FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numFaces: 1,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      });

      const tick = () => {
        if (cancelled) return;
        const v = videoRef.current;
        if (v && v.readyState >= 2 && landmarkerRef.current) {
          const ts = performance.now();
          const result = landmarkerRef.current.detectForVideo(v, ts);
          const pts = result.faceLandmarks?.[0];
          if (pts) {
            // Derive gaze vector from iris landmarks (468 + 4 iris = 472, but
            // FaceLandmarker outputs iris at indices 468-477 when enabled).
            // For lite model, use eye corners (33, 263) as a proxy.
            const leftEye = pts[33] ?? { x: 0, y: 0 };
            const rightEye = pts[263] ?? { x: 0, y: 0 };
            const cx = (leftEye.x + rightEye.x) / 2;
            const cy = (leftEye.y + rightEye.y) / 2;
            setLandmarks({
              ts_ms: ts,
              points: pts.map((p: any) => ({ x: p.x, y: p.y })),
              gaze: { x: cx - 0.5, y: cy - 0.5 },
              confidence: 0.9,
            });
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    })();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      landmarkerRef.current?.close?.();
    };
  }, [enabled, videoRef]);

  return landmarks;
}