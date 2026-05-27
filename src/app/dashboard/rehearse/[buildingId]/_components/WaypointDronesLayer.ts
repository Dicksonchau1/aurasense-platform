import mapboxgl from "mapbox-gl";
import * as THREE from "three";

export interface MiniWp {
  seq: number;
  lat: number;
  lng: number;
  alt_m: number;
}

export class WaypointDronesLayer implements mapboxgl.CustomLayerInterface {
  id: string = "waypoint-drones-3d";
  type: "custom" = "custom";
  renderingMode: "3d" = "3d";

  private camera: THREE.Camera;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer | null = null;
  private map: mapboxgl.Map | null = null;
  private drones: Array<{ group: THREE.Group; lng: number; lat: number; alt: number; seq: number }> = [];
  private startTime = 0;
  private currentSeq = -1;
  private setListener: ((ev: Event) => void) | null = null;
  private curListener: ((ev: Event) => void) | null = null;

  constructor() {
    this.camera = new THREE.Camera();
    this.scene = new THREE.Scene();
  }

  private buildMiniDrone(isCurrent: boolean): THREE.Group {
    const g = new THREE.Group();
    const color = isCurrent ? 0x22d3ee : 0xfacc15;
    const matBody = new THREE.MeshBasicMaterial({ color });
    const matArm = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });
    const matRotor = new THREE.MeshBasicMaterial({ color: isCurrent ? 0x88e8ff : 0xffeaa7, transparent: true, opacity: 0.85 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(2, 0.5, 2), matBody);
    g.add(body);

    for (const [sx, sz] of [[1, 1], [1, -1], [-1, -1], [-1, 1]] as Array<[number, number]>) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.2, 0.2), matArm);
      arm.position.set(sx * 1.2, 0.1, sz * 1.2);
      arm.rotation.y = Math.atan2(sz, sx);
      g.add(arm);
      const rotor = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.1, 16), matRotor);
      rotor.position.set(sx * 2.2, 0.3, sz * 2.2);
      g.add(rotor);
    }

    if (isCurrent) {
      const halo = new THREE.Mesh(
        new THREE.RingGeometry(2.6, 3.8, 32),
        new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.6, side: THREE.DoubleSide }),
      );
      halo.rotation.x = -Math.PI / 2;
      halo.position.y = -0.6;
      g.add(halo);
    }
    return g;
  }

  private setWaypoints(wps: MiniWp[]) {
    for (const d of this.drones) this.scene.remove(d.group);
    this.drones = [];
    for (const w of wps) {
      const isCurrent = w.seq === this.currentSeq;
      const g = this.buildMiniDrone(isCurrent);
      g.scale.set(6, 6, 6);
      this.scene.add(g);
      this.drones.push({ group: g, lng: w.lng, lat: w.lat, alt: w.alt_m, seq: w.seq });
    }
    this.map?.triggerRepaint();
  }

  private rebuildForCurrent(newSeq: number) {
    if (newSeq === this.currentSeq) return;
    this.currentSeq = newSeq;
    for (let i = 0; i < this.drones.length; i++) {
      const d = this.drones[i];
      const wasCurrent = d.group.children.length > 9;
      const shouldBeCurrent = d.seq === newSeq;
      if (wasCurrent === shouldBeCurrent) continue;
      this.scene.remove(d.group);
      const fresh = this.buildMiniDrone(shouldBeCurrent);
      fresh.scale.set(6, 6, 6);
      d.group = fresh;
      this.scene.add(fresh);
    }
    this.map?.triggerRepaint();
  }

  onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext) {
    this.map = map;
    this.renderer = new THREE.WebGLRenderer({ canvas: map.getCanvas(), context: gl as any, antialias: true });
    this.renderer.autoClear = false;
    this.startTime = performance.now();
    this.scene.add(new THREE.AmbientLight(0xffffff, 1.6));

    this.setListener = (ev: Event) => {
      const detail = (ev as CustomEvent).detail;
      if (!detail || !Array.isArray(detail.waypoints)) return;
      this.setWaypoints(detail.waypoints);
    };
    this.curListener = (ev: Event) => {
      const detail = (ev as CustomEvent).detail;
      if (!detail || typeof detail.seq !== "number") return;
      this.rebuildForCurrent(detail.seq);
    };
    window.addEventListener("rehearse-waypoints-set", this.setListener);
    window.addEventListener("rehearse-current-waypoint", this.curListener);
  }

  render(_gl: WebGLRenderingContext, matrix: number[]) {
    if (!this.renderer) return;
    const t = (performance.now() - this.startTime) / 1000;
    for (const d of this.drones) {
      const origin = mapboxgl.MercatorCoordinate.fromLngLat([d.lng, d.lat], d.alt);
      const scale = origin.meterInMercatorCoordinateUnits();
      d.group.rotation.y = t * 0.6;
      const m = new THREE.Matrix4().fromArray(matrix);
      const l = new THREE.Matrix4()
        .makeTranslation(origin.x, origin.y, origin.z)
        .scale(new THREE.Vector3(scale, -scale, scale));
      this.camera.projectionMatrix = m.multiply(l);
      this.renderer.resetState();
      this.renderer.render(this.scene, this.camera);
    }
    this.map?.triggerRepaint();
  }

  onRemove() {
    if (this.setListener) window.removeEventListener("rehearse-waypoints-set", this.setListener);
    if (this.curListener) window.removeEventListener("rehearse-current-waypoint", this.curListener);
    this.scene.clear();
    this.drones = [];
  }
}