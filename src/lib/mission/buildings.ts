// HK West Kowloon skyline. 12 buildings used by the canvas2D pseudo-3D viewport.

export interface Building {
  x: number;
  z: number;
  w: number;
  h: number;
  d: number;
  c: [number, number, number]; // base RGB
  name: string;
}

export const BLDS: Building[] = [
  { x:   0, z:   0, w: 14, h:  72, d: 10, c: [ 58,  88, 120], name: "ICC" },
  { x:  22, z:   4, w:  9, h:  48, d:  8, c: [ 61,  92, 122], name: "Elements A" },
  { x: -20, z:  -8, w: 11, h:  85, d: 10, c: [ 74, 104, 136], name: "SHK Tower" },
  { x:  36, z:  -4, w: 15, h: 108, d: 11, c: [ 51,  78, 104], name: "Sorrento" },
  { x: -36, z:  10, w:  7, h:  38, d:  7, c: [ 90, 116, 144], name: "Civic Sq" },
  { x:  12, z: -26, w: 19, h:  58, d: 13, c: [ 71, 100, 130], name: "Elements Mall" },
  { x: -13, z:  22, w:  9, h:  43, d:  9, c: [ 80, 108, 136], name: "W Hotel" },
  { x:  29, z:  21, w: 11, h:  76, d:  8, c: [ 60,  90, 118], name: "Harbour City" },
  { x: -30, z: -21, w: 13, h:  94, d: 10, c: [ 46,  74,  98], name: "Union Sq" },
  { x:  52, z:   7, w:  8, h:  54, d:  8, c: [ 86, 112, 140], name: "Cullinan" },
  { x: -52, z:  -4, w: 10, h:  67, d:  9, c: [ 74, 100, 128], name: "KSC" },
  { x:  44, z: -19, w: 12, h:  82, d:  9, c: [ 56,  84, 110], name: "Arch" },
];
