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
    this.scene.add(new THREE.AmbientLight(0xffffff, 1.4));
    const dirA = new THREE.DirectionalLight(0xffffff, 1.2);
    dirA.position.set(0, 70, 100).normalize();
    this.scene.add(dirA);
    const dirB = new THREE.DirectionalLight(0xddeeff, 0.8);
    dirB.position.set(100, 50, -50).normalize();
    this.scene.add(dirB);
    const dirC = new THREE.DirectionalLight(0xffe4b5, 0.7);
    dirC.position.set(-80, 30, -40).normalize();
    this.scene.add(dirC);
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
        // Override origin from server response if provided (so tile sits on the building exactly)
        const srvLat = r.headers.get("X-MBIS-Origin-Lat");
        const srvLng = r.headers.get("X-MBIS-Origin-Lng");
        if (srvLat && srvLng) {
          const slat = parseFloat(srvLat);
          const slng = parseFloat(srvLng);
          if (Number.isFinite(slat) && Number.isFinite(slng)) {
            const newOrigin = mapboxgl.MercatorCoordinate.fromLngLat([slng, slat], 0);
            this.modelTransform = {
              translateX: newOrigin.x,
              translateY: newOrigin.y,
              translateZ: newOrigin.z,
              scale: newOrigin.meterInMercatorCoordinateUnits(),
            };
          }
        }
        const buf = await r.arrayBuffer();
        const loader = new GLTFLoader();
        loader.parse(buf, "", (gltf) => {
          const g = gltf.scene;
          g.rotation.x = Math.PI / 2;
          g.traverse((obj: any) => {
            if (obj.isMesh) {
              // Replace whatever material trimesh gave us with MeshBasicMaterial
              // so vertex/face colors from the GLB read regardless of lighting.
              const oldMat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
              const color = oldMat?.color ? oldMat.color.clone() : new THREE.Color(0x22d3ee);
              const newMat = new THREE.MeshBasicMaterial({
                color: color,
                vertexColors: true,
                transparent: true,
                opacity: 0.95,
              });
              obj.material = newMat;
              if (obj.geometry && !obj.geometry.attributes.color) {
                // Geometry has no per-vertex color; tint the whole mesh cyan-ish
                newMat.color.setHex(0x22d3ee);
                newMat.vertexColors = false;
              }
            }
          });
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

  // Approximate floor index for a given altitude (meters AGL) on this building.
  // floorHeight is height_m / floor_count from snapshot; clients pass in the value.
  static floorAtAltitude(altM: number, totalHeightM: number, floorCount: number): number {
    if (totalHeightM <= 0 || floorCount <= 0) return 1;
    const floorH = totalHeightM / floorCount;
    return Math.max(1, Math.min(floorCount, Math.floor(altM / floorH) + 1));
  }
}