import mapboxgl from "mapbox-gl";
import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";

export interface HoverDroneOptions {
  lat: number;
  lng: number;
  altitudeM: number;
  batterySoc?: number;
  modelUrl?: string;
}

interface LivePos { lat: number; lng: number; alt: number; headingDeg: number; }

export class HoverDroneLayer implements mapboxgl.CustomLayerInterface {
  id: string;
  type: "custom" = "custom";
  renderingMode: "3d" = "3d";

  private camera: THREE.Camera;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer | null = null;
  private map: mapboxgl.Map | null = null;
  private root: THREE.Group | null = null;
  private body: THREE.Object3D | null = null;
  private rotors: THREE.Object3D[] = [];
  private opts: HoverDroneOptions;
  private livePos: LivePos | null = null;
  private startTime = 0;
  private positionListener: ((ev: Event) => void) | null = null;

  constructor(opts: HoverDroneOptions) {
    this.opts = opts;
    this.id = "hover-drone-" + opts.lat.toFixed(4) + "-" + opts.lng.toFixed(4);
    this.camera = new THREE.Camera();
    this.scene = new THREE.Scene();
  }

  private buildProceduralDrone(): THREE.Group {
    const g = new THREE.Group();
    const matBody = new THREE.MeshStandardMaterial({ color: 0x22d3ee, metalness: 0.5, roughness: 0.3, emissive: 0x22d3ee, emissiveIntensity: 1.2 });
    const matAccent = new THREE.MeshStandardMaterial({ color: 0x22d3ee, metalness: 0.5, roughness: 0.3, emissive: 0x0a4060, emissiveIntensity: 0.6 });
    const matRotor = new THREE.MeshStandardMaterial({ color: 0x111122, metalness: 0.7, roughness: 0.5 });
    const matDark = new THREE.MeshStandardMaterial({ color: 0x0a0a14, metalness: 0.5, roughness: 0.6 });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 1.8, 6), matBody);
    body.rotation.y = Math.PI / 6;
    g.add(body);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.4, 8, 24), matAccent);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 1;
    g.add(ring);

    const gimbalHousing = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 12), matDark);
    gimbalHousing.position.y = -1.5;
    g.add(gimbalHousing);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 0.8, 16), matAccent);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, -1.5, 1.4);
    g.add(lens);

    for (const [sx, sz] of [[1, 1], [1, -1], [-1, -1], [-1, 1]] as Array<[number, number]>) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 3.5, 8), matDark);
      leg.position.set(sx * 2.4, -1.8, sz * 2.4);
      g.add(leg);
    }

    const armLen = 12;
    for (const [sx, sz] of [[1, 1], [1, -1], [-1, -1], [-1, 1]] as Array<[number, number]>) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(armLen, 0.6, 0.6), matBody);
      arm.position.set(sx * armLen / 2, 0.3, sz * armLen / 2);
      arm.rotation.y = Math.atan2(sz, sx);
      g.add(arm);

      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.6, 12), matDark);
      hub.position.set(sx * armLen, 0.9, sz * armLen);
      g.add(hub);

      const rotorGroup = new THREE.Group();
      const blade1 = new THREE.Mesh(new THREE.BoxGeometry(8, 0.1, 0.5), matRotor);
      const blade2 = new THREE.Mesh(new THREE.BoxGeometry(8, 0.1, 0.5), matRotor);
      blade2.rotation.y = Math.PI / 2;
      rotorGroup.add(blade1);
      rotorGroup.add(blade2);
      rotorGroup.position.set(sx * armLen, 1.3, sz * armLen);
      g.add(rotorGroup);
      this.rotors.push(rotorGroup);
    }

    const soc = this.opts.batterySoc ?? 0.95;
    const ledColor = soc > 0.5 ? 0x34d399 : soc > 0.25 ? 0xf59e0b : 0xef4444;
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 8), new THREE.MeshBasicMaterial({ color: ledColor }));
    led.position.set(0, 1.5, 3);
    g.add(led);

    // Bright beacon pillar — makes the drone trivially findable on the map
    const beacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.6, 18, 12),
      new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.85 }),
    );
    beacon.position.y = 10;
    g.add(beacon);

    // Pulsing halo ring
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(6, 9, 32),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.55, side: THREE.DoubleSide }),
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = -2;
    g.add(halo);

    return g;
  }

  onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext) {
    this.map = map;
    this.renderer = new THREE.WebGLRenderer({ canvas: map.getCanvas(), context: gl as any, antialias: true });
    this.renderer.autoClear = false;
    this.startTime = performance.now();

    this.scene.add(new THREE.AmbientLight(0xffffff, 1.4));
    const sun = new THREE.DirectionalLight(0xffffff, 2.0);
    sun.position.set(0, 100, 50).normalize();
    this.scene.add(sun);
    const fill = new THREE.DirectionalLight(0x88aaff, 0.8);
    fill.position.set(-50, 30, -50).normalize();
    this.scene.add(fill);

    this.root = new THREE.Group();
    this.scene.add(this.root);

    this.body = this.buildProceduralDrone();
    this.body.scale.set(6, 6, 6);
    this.root.add(this.body);

    if (this.opts.modelUrl) {
      const loader = new GLTFLoader();
      loader.load(this.opts.modelUrl, (gltf) => {
        if (this.body && this.root) {
          this.root.remove(this.body);
        }
        gltf.scene.scale.set(6, 6, 6);
        this.body = gltf.scene;
        this.root?.add(this.body);
      }, undefined, (err) => {
        console.warn("[HoverDroneLayer] GLB load failed, keeping procedural:", err);
      });
    }

    this.positionListener = (ev: Event) => {
      const detail = (ev as CustomEvent).detail;
      if (!detail) return;
      this.livePos = { lat: detail.lat, lng: detail.lng, alt: detail.alt, headingDeg: detail.headingDeg ?? 0 };
      this.map?.triggerRepaint();
    };
    window.addEventListener("rehearse-drone-position", this.positionListener);
  }

  render(_gl: WebGLRenderingContext, matrix: number[]) {
    if (!this.renderer || !this.root) return;
    const t = (performance.now() - this.startTime) / 1000;
    for (const r of this.rotors) r.rotation.y = t * 60;

    const pos = this.livePos ?? { lat: this.opts.lat, lng: this.opts.lng, alt: this.opts.altitudeM, headingDeg: 0 };
    const origin = mapboxgl.MercatorCoordinate.fromLngLat([pos.lng, pos.lat], pos.alt);
    const scale = origin.meterInMercatorCoordinateUnits();
    const bob = this.livePos ? 0 : Math.sin(t * 1.5) * 0.4;
    this.root.position.y = bob;
    this.root.rotation.y = (pos.headingDeg * Math.PI) / 180;

    const m = new THREE.Matrix4().fromArray(matrix);
    const l = new THREE.Matrix4()
      .makeTranslation(origin.x, origin.y, origin.z)
      .scale(new THREE.Vector3(scale, -scale, scale));
    this.camera.projectionMatrix = m.multiply(l);
    this.renderer.resetState();
    this.renderer.render(this.scene, this.camera);
    this.map?.triggerRepaint();
  }

  onRemove() {
    if (this.positionListener) {
      window.removeEventListener("rehearse-drone-position", this.positionListener);
      this.positionListener = null;
    }
    this.scene.clear();
    this.root = null;
    this.body = null;
    this.rotors = [];
  }
}