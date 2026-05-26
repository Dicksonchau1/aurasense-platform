"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function WorldScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let w = mount.clientWidth || 800;
    let h = mount.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060f1e);
    scene.fog = new THREE.Fog(0x060f1e, 60, 220);

    const camera = new THREE.PerspectiveCamera(54, w / h, 0.1, 500);
    camera.position.set(30, 25, 40);
    camera.lookAt(0, 8, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    mount.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0x3a5070, 0.5));
    const sun = new THREE.DirectionalLight(0x88aacc, 1.4);
    sun.position.set(15, 30, 20);
    scene.add(sun);
    const acc = new THREE.PointLight(0x4f98a3, 1.5, 60);
    acc.position.set(-8, 12, 0);
    scene.add(acc);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshLambertMaterial({ color: 0x1a2a3a }),
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Grid
    scene.add(new THREE.GridHelper(200, 40, 0x203050, 0x182840));

    // HK buildings - 12 of them, matching atlas-v11 HKBLDS
    const HKBLDS: Array<{ x: number; z: number; w: number; d: number; h: number; c: number }> = [
      { x:   0, z:   0, w: 12, d:  8, h: 60, c: 0x4a6080 },
      { x:  20, z:   5, w:  8, d:  6, h: 45, c: 0x3d5470 },
      { x: -18, z:  -8, w: 10, d: 10, h: 80, c: 0x5a7290 },
      { x:  35, z:  -5, w: 14, d: 10, h:100, c: 0x3a5068 },
      { x: -35, z:  10, w:  6, d:  6, h: 35, c: 0x607898 },
      { x:  10, z: -25, w: 18, d: 12, h: 55, c: 0x4d6885 },
      { x: -12, z:  22, w:  8, d:  8, h: 40, c: 0x556a7a },
      { x:  28, z:  20, w: 10, d:  7, h: 70, c: 0x425f78 },
      { x: -28, z: -20, w: 12, d:  9, h: 90, c: 0x384e65 },
      { x:  50, z:   8, w:  7, d:  7, h: 50, c: 0x5a7080 },
      { x: -50, z:  -5, w:  9, d:  9, h: 65, c: 0x4e6880 },
      { x:  42, z: -18, w: 11, d:  8, h: 78, c: 0x3c5572 },
    ];
    for (const b of HKBLDS) {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(b.w, b.h, b.d),
        new THREE.MeshPhysicalMaterial({ color: b.c, roughness: 0.35, metalness: 0.4 }),
      );
      m.position.set(b.x, b.h / 2, b.z);
      scene.add(m);
    }

    // Drone group orbiting Tower-C
    const drone = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.28, 1.2),
      new THREE.MeshPhysicalMaterial({ color: 0xd0dce8, roughness: 0.2, metalness: 0.7 }),
    );
    drone.add(body);
    for (const [x, z] of [[-1,-1],[1,-1],[1,1],[-1,1]] as const) {
      const arm = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.1, 0.1),
        new THREE.MeshPhysicalMaterial({ color: 0x8899aa, roughness: 0.4, metalness: 0.5 }),
      );
      arm.position.set(x / 2, 0, z / 2);
      arm.rotation.y = Math.atan2(z, x);
      drone.add(arm);
    }
    drone.position.set(0, 18, 0);
    scene.add(drone);

    // Anomaly spheres
    for (const a of [
      { x:  2, y: 12, z: 4.5, c: 0xb91c1c },
      { x: -1, y:  8, z: 4.5, c: 0xb45309 },
    ]) {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 8, 8),
        new THREE.MeshBasicMaterial({ color: a.c }),
      );
      m.position.set(a.x, a.y, a.z);
      scene.add(m);
    }

    const loop = () => {
      drone.rotation.y += 0.01;
      drone.position.y = 18 + Math.sin(Date.now() * 0.001) * 0.25;
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    // ResizeObserver so canvas always fills parent
    const ro = new ResizeObserver(() => {
      w = mount.clientWidth || 800;
      h = mount.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "absolute",
        inset: 0,
        background: "#060f1e",
      }}
    />
  );
}
