"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Props {
  height?: number;
}

export default function WorldScene({ height = 520 }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth || 800;
    const h = height;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e15);
    scene.fog = new THREE.Fog(0x0a0e15, 60, 220);

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 500);
    camera.position.set(70, 55, 90);
    camera.lookAt(0, 8, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0x223344, 0.6);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(40, 80, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);
    const rim = new THREE.PointLight(0x22d3ee, 0.6, 200);
    rim.position.set(-40, 20, -30);
    scene.add(rim);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 400),
      new THREE.MeshStandardMaterial({ color: 0x0e1217, roughness: 0.9 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid
    const grid = new THREE.GridHelper(200, 40, 0x1a1f26, 0x11151a);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.6;
    scene.add(grid);

    // 12 HK skyline buildings
    const buildings: THREE.Mesh[] = [];
    const positions: Array<[number, number, number, number]> = [
      [-50,  5, -40,  8], [-35,  9, -20, 12], [-20, 14,  -5, 18],
      [ -5, 20,  10, 26], [ 12, 16,  20, 22], [ 28, 12,  10, 16],
      [ 38,  8,  -5, 10], [ 25,  6, -25,  8], [ 10,  4, -38,  6],
      [-10, 11,  35, 14], [ 25, 18,  40, 24], [ 45,  9,  35, 12],
    ];
    for (const [x, hh, z, height3] of positions) {
      const geo = new THREE.BoxGeometry(8, height3, 8);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x1b232c,
        roughness: 0.75,
        metalness: 0.15,
        emissive: new THREE.Color(0x0c2230),
        emissiveIntensity: 0.35,
      });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, height3 / 2, z);
      m.castShadow = true;
      m.receiveShadow = true;
      scene.add(m);
      buildings.push(m);
    }

    // Anomaly spheres
    const anomalies: THREE.Mesh[] = [];
    const anomalyData: Array<[number, number, number, number]> = [
      [ -5, 20,  10, 0xef4444],
      [ 28, 12,  10, 0xf59e0b],
      [-10, 11,  35, 0x22d3ee],
    ];
    for (const [x, y, z, color] of anomalyData) {
      const a = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 16, 16),
        new THREE.MeshBasicMaterial({ color }),
      );
      a.position.set(x, y + 8, z);
      scene.add(a);
      anomalies.push(a);
    }

    // Quadcopter: body + 4 arms + 4 props
    const drone = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.6, 2.2),
      new THREE.MeshStandardMaterial({ color: 0xe7ecf3 }),
    );
    body.castShadow = true;
    drone.add(body);

    const armMat = new THREE.MeshStandardMaterial({ color: 0x22d3ee });
    const propMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 });
    const arms: THREE.Mesh[] = [];
    const props: THREE.Mesh[] = [];
    const corners: Array<[number, number]> = [
      [ 1.6,  1.6], [-1.6,  1.6], [ 1.6, -1.6], [-1.6, -1.6],
    ];
    for (const [ax, az] of corners) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.3), armMat);
      arm.position.set(ax, 0, az);
      drone.add(arm);
      arms.push(arm);

      const prop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9, 0.9, 0.06, 16),
        propMat,
      );
      prop.position.set(ax, 0.2, az);
      drone.add(prop);
      props.push(prop);
    }
    drone.position.set(0, 18, 0);
    scene.add(drone);

    // Drone glow
    const glow = new THREE.PointLight(0x22d3ee, 1.4, 30);
    drone.add(glow);

    // Animation loop
    let t = 0;
    const loop = () => {
      t += 0.016;
      // Drone orbits the city
      const r = 38;
      drone.position.x = Math.cos(t * 0.4) * r;
      drone.position.z = Math.sin(t * 0.4) * r;
      drone.position.y = 18 + Math.sin(t * 1.2) * 1.5;
      drone.rotation.y = -t * 0.4 + Math.PI / 2;

      for (const p of props) p.rotation.y += 0.7;

      for (let i = 0; i < anomalies.length; i++) {
        const a = anomalies[i];
        const mat = a.material as THREE.MeshBasicMaterial;
        const pulse = 0.6 + 0.4 * Math.sin(t * 3 + i * 1.2);
        mat.opacity = pulse;
        mat.transparent = true;
      }

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    // Resize
    const onResize = () => {
      const nw = mount.clientWidth || 800;
      camera.aspect = nw / h;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else if (mat) mat.dispose();
      });
    };
  }, [height]);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height,
        borderRadius: 8,
        overflow: "hidden",
        border: "1px solid #1a1f26",
        background: "#0a0e15",
      }}
    />
  );
}
