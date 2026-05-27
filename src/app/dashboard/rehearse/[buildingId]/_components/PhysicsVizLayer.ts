import mapboxgl from "mapbox-gl";
import * as THREE from "three";

export interface PhysicsVizOptions {
  buildingLat: number;
  buildingLng: number;
  buildingHeightM: number;
  windSpeedMs: number;
  windDirDeg: number;
}

export class PhysicsVizLayer implements mapboxgl.CustomLayerInterface {
  id: string = "physics-viz-3d";
  type: "custom" = "custom";
  renderingMode: "3d" = "3d";

  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer | null = null;
  private map: mapboxgl.Map | null = null;
  private opts: PhysicsVizOptions;
  private dronePos = { lat: 0, lng: 0, alt: 0, hdg: 0 };
  private posListener: ((ev: Event) => void) | null = null;
  private startTime = 0;

  constructor(opts: PhysicsVizOptions) {
    this.opts = opts;
    this.camera = new THREE.Camera();
  }

  onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext) {
    this.map = map;
    this.renderer = new THREE.WebGLRenderer({ canvas: map.getCanvas(), context: gl as any, antialias: true });
    this.renderer.autoClear = false;
    this.startTime = performance.now();

    this.posListener = (ev: Event) => {
      const d = (ev as CustomEvent).detail;
      if (!d) return;
      this.dronePos = { lat: d.lat, lng: d.lng, alt: d.alt, hdg: d.headingDeg ?? 0 };
      this.map?.triggerRepaint();
    };
    window.addEventListener("rehearse-drone-position", this.posListener);
  }

  render(_gl: WebGLRenderingContext, matrix: number[]) {
    if (!this.renderer) return;
    const t = (performance.now() - this.startTime) / 1000;

    // --- Render 1: Wind arrow at building rooftop ---
    {
      const tmp = new THREE.Scene();
      tmp.add(new THREE.AmbientLight(0xffffff, 1.4));
      const windRad = (this.opts.windDirDeg * Math.PI) / 180;
      const windDir = new THREE.Vector3(Math.sin(windRad), 0, -Math.cos(windRad));
      const windLen = Math.max(10, this.opts.windSpeedMs * 5);
      const arrow = new THREE.ArrowHelper(windDir, new THREE.Vector3(0, 0, 0), windLen, 0x88ddff, windLen * 0.3, windLen * 0.2);
      arrow.position.y = Math.sin(t * 0.8) * 0.5;
      tmp.add(arrow);

      const o = mapboxgl.MercatorCoordinate.fromLngLat([this.opts.buildingLng, this.opts.buildingLat], this.opts.buildingHeightM + 15);
      const s = o.meterInMercatorCoordinateUnits();
      const m = new THREE.Matrix4().fromArray(matrix);
      const l = new THREE.Matrix4().makeTranslation(o.x, o.y, o.z).scale(new THREE.Vector3(s, -s, s));
      this.camera.projectionMatrix = m.multiply(l);
      this.renderer.resetState();
      this.renderer.render(tmp, this.camera);
    }

    // --- Render 2: FoV cone + altitude tick at drone position ---
    if (this.dronePos.lat !== 0) {
      const tmp = new THREE.Scene();
      tmp.add(new THREE.AmbientLight(0xffffff, 1.4));

      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(8, 28, 16, 1, true),
        new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false }),
      );
      cone.rotation.x = Math.PI;
      cone.position.y = -14;
      tmp.add(cone);

      const tickGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, -this.dronePos.alt, 0),
      ]);
      const tick = new THREE.Line(tickGeo, new THREE.LineDashedMaterial({ color: 0xfacc15, dashSize: 4, gapSize: 3, transparent: true, opacity: 0.7 }));
      tick.computeLineDistances();
      tmp.add(tick);

      const o = mapboxgl.MercatorCoordinate.fromLngLat([this.dronePos.lng, this.dronePos.lat], this.dronePos.alt);
      const s = o.meterInMercatorCoordinateUnits();
      const m = new THREE.Matrix4().fromArray(matrix);
      const l = new THREE.Matrix4().makeTranslation(o.x, o.y, o.z).scale(new THREE.Vector3(s, -s, s));
      this.camera.projectionMatrix = m.multiply(l);
      this.renderer.resetState();
      this.renderer.render(tmp, this.camera);
    }

    this.map?.triggerRepaint();
  }

  onRemove() {
    if (this.posListener) window.removeEventListener("rehearse-drone-position", this.posListener);
  }
}