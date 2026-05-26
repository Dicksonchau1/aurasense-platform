// Mock data for /dashboard/world-model.

export interface Layer {
  key: string;
  name: string;
  on: boolean;
}

export const WM_LAYERS: Layer[] = [
  { key: "buildings", name: "Buildings",   on: true  },
  { key: "drone",     name: "Drone Path",  on: true  },
  { key: "anomalies", name: "Anomalies",   on: true  },
  { key: "wind",      name: "Wind Vector", on: true  },
  { key: "sun",       name: "Sun Ray",     on: false },
  { key: "grid",      name: "Ground Grid", on: true  },
  { key: "labels",    name: "Labels",      on: false },
];

export interface WMBuilding {
  id: string;
  name: string;
  height: number;
  floors: number;
  status: "scanning" | "queued" | "done";
}

export const WM_BUILDINGS: WMBuilding[] = [
  { id: "B-01", name: "ICC",          height: 484, floors: 108, status: "scanning" },
  { id: "B-02", name: "K11 Musea",    height:  38, floors:   9, status: "done"     },
  { id: "B-03", name: "Tower West B", height: 120, floors:  29, status: "queued"   },
  { id: "B-04", name: "Hung Hom Blk", height:  85, floors:  22, status: "done"     },
  { id: "B-05", name: "Sorrento 1",   height: 256, floors:  75, status: "queued"   },
];

export interface WMDefect {
  id: string;
  type: string;
  face: string;
  level: number;
  confidence: number;
  severity: "danger" | "warn" | "info";
}

export const WM_DEFECTS: WMDefect[] = [
  { id: "DEF-001", type: "Spalling",      face: "N", level: 42, confidence: 96, severity: "danger" },
  { id: "DEF-002", type: "Cracks",        face: "N", level: 38, confidence: 88, severity: "warn"   },
  { id: "DEF-003", type: "Efflorescence", face: "E", level: 12, confidence: 79, severity: "info"   },
  { id: "DEF-004", type: "Seepage",       face: "S", level: 27, confidence: 83, severity: "warn"   },
];
