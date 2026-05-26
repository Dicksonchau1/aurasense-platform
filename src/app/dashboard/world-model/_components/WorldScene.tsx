"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";

interface Building {
  id: string;
  name: string | null;
  lat: number | null;
  lng: number | null;
  height_m: number | null;
  floor_count: number | null;
  risk_score: number | null;
  mbis_id: string | null;
  gltf_url: string | null;
  source: string | null;
}

interface Drone {
  id: string;
  name: string | null;
  home_lat: number | null;
  home_lng: number | null;
  status: string | null;
}

interface Snapshot {
  data: { buildings?: Building[]; drones?: Drone[] };
}

const PROCEDURAL_FALLBACK = [
  { x: 0, z: 0, w: 12, d: 8, h: 60, c: 0x4a6080 },
  { x: 20, z: 5, w: 8, d: 6, h: 45, c: 0x3d5470 },
  { x: -18, z: -8, w: 10, d: 10, h: 80, c: 0x5a7290 },
  { x: 35, z: -5, w: 14, d: 10, h: 100, c: 0x3a5068 },
  { x: -35, z: 10, w: 6, d: 6, h: 35, c: 0x607898 },
  { x: 10, z: -25, w: 18, d: 12, h: 55, c: 0x4d6885 },
  { x: -12, z: 22, w: 8, d: 8, h: 40, c: 0x556a7a },
  { x: 28, z: 20, w: 10, d: 7, h: 70, c: 0x425f78 },
  { x: -28, z: -20, w: 12, d: 9, h: 90, c: 0x384e65 },
  { x: 50, z: 8, w: 7, d: 7, h: 50, c: 0x5a7080 },
  { x: -50, z: -5, w: 9, d: 9, h: 65, c: 0x4e6880 },
  { x: 42, z: -18, w: 11, d: 8, h: 78, c: 0x3c5572 },
];

const EARTH_R = 6378137;
const MBIS_ZOOM = 16;

function wgs84ToEnu(lat: number, lng: number, oLat: number, oLng: number) {
  const dLat = ((lat - oLat) * Math.PI) / 180;
  const dLng = ((lng - oLng) * Math.PI) / 180;
  const meanLat = (((lat + oLat) / 2) * Math.PI) / 180;
  return { east: dLng * EARTH_R * Math.cos(meanLat), north: dLat * EARTH_R };
}

function latLngToTile(lat: number, lng: number, z: number) {
  const n = Math.pow(2, z);
  const xt = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const yt = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
  return { x: xt, y: yt };
}

function riskColor(risk: number | null): number {
  if (risk == null) return 0x4a6080;
  if (risk > 75) return 0xb91c1c;
  if (risk > 60) return 0xb45309;
  if (risk > 40) return 0x4a6080;
  return 0x3d5470;
}

async function loadGlbTile(z: number, x: number, y: number): Promise<THREE.Group | null> {
  try {
    const r = await fetch("/api/atlas/mbis/tiles/" + z + "/" + x + "/" + y, { cache: "force-cache" });
    if (!r.ok) return null;
    const buf = await r.arrayBuffer();
    const loader = new GLTFLoader();
    return await new Promise<THREE.Group | null>((resolve) => {
      loader.parse(buf, "", (gltf) => resolve(gltf.scene), () => resolve(null));
    });
  } catch {
    return null;
  }
}

export default function WorldScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number>(0);
  const [snap, setSnap] = useState<Snapshot | null>(null);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const r = await fetch("/api/atlas/nepa/world-model/snapshot", { cache: "no-store" });
        if (!r.ok) return;
        const j = await r.json();
        if (alive) setSnap(j);
      } catch {}
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => { alive = false; clearInterval(id); };
  }, []);
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let w = mount.clientWidth || 800;
    let h = mount.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060f1e);
    scene.fog = new THREE.Fog(0x060f1e, 60, 800);

    const camera = new THREE.PerspectiveCamera(54, w / h, 0.1, 5000);
    camera.position.set(120, 200, 240);
    camera.lookAt(0, 30, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x3a5070, 0.6));
    const sun = new THREE.DirectionalLight(0x88aacc, 1.4);
    sun.position.set(15, 30, 20);
    scene.add(sun);
    const acc = new THREE.PointLight(0x4f98a3, 1.5, 200);
    acc.position.set(-8, 12, 0);
    scene.add(acc);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(4000, 4000),
      new THREE.MeshLambertMaterial({ color: 0x1a2a3a }),
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    scene.add(new THREE.GridHelper(2000, 80, 0x203050, 0x182840));

    const buildings = snap?.data?.buildings ?? [];
    const drones = snap?.data?.drones ?? [];
    const buildingGroup = new THREE.Group();
    scene.add(buildingGroup);

    let cancelled = false;

    (async () => {
      if (buildings.length === 0 || !buildings.every((b) => b.lat != null && b.lng != null)) {
        for (const b of PROCEDURAL_FALLBACK) {
          if (cancelled) return;
          const m = new THREE.Mesh(
            new THREE.BoxGeometry(b.w, b.h, b.d),
            new THREE.MeshPhysicalMaterial({ color: b.c, roughness: 0.35, metalness: 0.4 }),
          );
          m.position.set(b.x, b.h / 2, b.z);
          buildingGroup.add(m);
        }
        return;
      }
      const valid = buildings.filter((b) => b.lat != null && b.lng != null) as Array<Building & { lat: number; lng: number }>;
      const oLat = valid.reduce((a, b) => a + b.lat, 0) / valid.length;
      const oLng = valid.reduce((a, b) => a + b.lng, 0) / valid.length;
      const placeholders = new Map<string, THREE.Mesh>();
      for (const b of valid) {
        const enu = wgs84ToEnu(b.lat, b.lng, oLat, oLng);
        const height = b.height_m ?? (b.floor_count ? b.floor_count * 3.5 : 40);
        const width = b.floor_count ? Math.max(8, b.floor_count * 0.5) : 12;
        const mesh = new THREE.Mesh(
          new THREE.BoxGeometry(width, height, width * 0.8),
          new THREE.MeshPhysicalMaterial({ color: riskColor(b.risk_score), roughness: 0.35, metalness: 0.4, transparent: true, opacity: 0.85 }),
        );
        mesh.position.set(enu.east, height / 2, -enu.north);
        mesh.userData = { id: b.id, mbis_id: b.mbis_id, isFallback: true };
        buildingGroup.add(mesh);
        placeholders.set(b.id, mesh);
      }
      const bbox = new THREE.Box3().setFromObject(buildingGroup);
      const size = bbox.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z) || 200;
      const dist = maxDim * 1.4;
      camera.position.set(dist * 0.6, dist * 0.7, dist * 0.9);
      camera.lookAt(0, size.y / 2, 0);

      for (const d of drones) {
        if (cancelled || d.home_lat == null || d.home_lng == null) continue;
        const enu = wgs84ToEnu(d.home_lat, d.home_lng, oLat, oLng);
        const drone = new THREE.Group();
        const body = new THREE.Mesh(
          new THREE.BoxGeometry(2, 0.5, 2),
          new THREE.MeshPhysicalMaterial({ color: 0xd0dce8, roughness: 0.2, metalness: 0.7 }),
        );
        drone.add(body);
        drone.position.set(enu.east, 15, -enu.north);
        scene.add(drone);
      }

      for (const b of valid) {
        if (cancelled || !b.mbis_id) continue;
        const t = latLngToTile(b.lat, b.lng, MBIS_ZOOM);
        const glb = await loadGlbTile(MBIS_ZOOM, t.x, t.y);
        if (cancelled) return;
        if (glb) {
          const enu = wgs84ToEnu(b.lat, b.lng, oLat, oLng);
          glb.position.set(enu.east, 0, -enu.north);
          scene.add(glb);
          const ph = placeholders.get(b.id);
          if (ph) ph.visible = false;
        }
      }
    })();

    const loop = () => {
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    const ro = new ResizeObserver(() => {
      w = mount.clientWidth || 800;
      h = mount.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(mount);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [snap]);

  return <div ref={mountRef} style={{ position: "absolute", inset: 0, background: "#060f1e" }} />;
}
