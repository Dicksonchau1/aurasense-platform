"use client";

import { useEffect, useRef, useState } from "react";
import type { PoseLandmarks } from "./types";

export function usePose(videoRef: React.RefObject<HTMLVideoElement>, enabled: boolean) {
  const [landmarks, setLandmarks] = useState<PoseLandmarks | null>(null);
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
      landmarkerRef.current = await vision.PoseLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
      });

      const tick = () => {
        if (cancelled) return;
        const v = videoRef.current;
        if (v && v.readyState >= 2 && landmarkerRef.current) {
          const ts = performance.now();
          const result = landmarkerRef.current.detectForVideo(v, ts);
          if (result.landmarks?.[0]) {
            setLandmarks({
              ts_ms: ts,
              points: result.landmarks[0].map((p: any) => ({
                x: p.x, y: p.y, z: p.z, visibility: p.visibility,
              })),
              confidence: result.landmarks[0][0]?.visibility ?? 0,
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