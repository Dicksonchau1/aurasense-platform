// Defect markers attached to building facades. Pulse-rendered in the viewport.

export type DefectKind = "danger" | "warn";

export interface Defect {
  bx: number;
  by: number;
  bz: number;
  kind: DefectKind;
  lbl: string;
}

export const DEFECTS: Defect[] = [
  { bx:  0, by: 16, bz:  5.1, kind: "danger", lbl: "DEF-001 Spalling" },
  { bx: -2, by: 10, bz:  5.1, kind: "warn",   lbl: "DEF-002 Cracks" },
  { bx:  3, by: 25, bz:  5.1, kind: "warn",   lbl: "DEF-003 Efflor." },
];
