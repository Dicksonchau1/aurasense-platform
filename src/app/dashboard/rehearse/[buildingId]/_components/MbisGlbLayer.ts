import mapboxgl from "mapbox-gl";
import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";

export interface MbisLayerOptions {
  z: number;
  x: number;
  y: number;
  originLat: number;
  originLng: number;
}

export class MbisGlbLayer implements mapboxgl.CustomLayerInterface {
  id: string;
  type: "custom" = "custom";
  renderingMode: "3d" = "3d";
  private camera: THREE.Camera;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer | null = null;
  private map: mapboxgl.Map | null = null;
  private modelTransform: any = null;
  private loaded = false;
  private opts: MbisLayerOptions;

  constructor(opts: MbisLayerOptions) {
    this.opts = opts;
    this.id = "mbis-glb-" + opts.z + "-" + opts.x + "-" + opts.y;
    this.camera = new THREE.Camera();
    this.scene = new THREE.Scene();
  }

  onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext) {
    this.map = map;
    this.renderer = new THREE.WebGLRenderer({ canvas: map.getCanvas(), context: gl as any, antialias: true });
    this.renderer.autoClear = false;
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(0, 70, 100).normalize();
    this.scene.add(dir);
    const origin = mapboxgl.MercatorCoordinate.fromLngLat([this.opts.originLng, this.opts.originLat], 0);
    this.modelTransform = {
      translateX: origin.x,
      translateY: origin.y,
      translateZ: origin.z,
      scale: origin.meterInMercatorCoordinateUnits(),
    };
    fetch("/api/atlas/mbis/tiles/" + this.opts.z + "/" + this.opts.x + "/" + this.opts.y, { cache: "force-cache" })
      .then(async (r) => {
        if (!r.ok) throw new Error("MBIS tile HTTP " + r.status);
        const buf = await r.arrayBuffer();
        const loader = new GLTFLoader();
        loader.parse(buf, "", (gltf) => {
          const g = gltf.scene;
          g.rotation.x = Math.PI / 2;
          this.scene.add(g);
          this.loaded = true;
          map.triggerRepaint();
        }, (err: any) => { console.error("[MbisGlbLayer] glTF parse error", err); });
      })
      .catch((err) => { console.warn("[MbisGlbLayer] tile fetch failed:", err.message); });
  }

  render(_gl: WebGLRenderingContext, matrix: number[]) {
    if (!this.renderer || !this.modelTransform || !this.loaded) return;
    const m = new THREE.Matrix4().fromArray(matrix);
    const l = new THREE.Matrix4()
      .makeTranslation(this.modelTransform.translateX, this.modelTransform.translateY, this.modelTransform.translateZ)
      .scale(new THREE.Vector3(this.modelTransform.scale, -this.modelTransform.scale, this.modelTransform.scale));
    this.camera.projectionMatrix = m.multiply(l);
    this.renderer.resetState();
    this.renderer.render(this.scene, this.camera);
    this.map?.triggerRepaint();
  }

  onRemove() {
    this.scene.clear();
    this.loaded = false;
  }
}