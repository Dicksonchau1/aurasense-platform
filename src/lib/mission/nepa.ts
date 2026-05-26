// NEPA agent canned responses + quick-action suggestions for the mission planner.

export const NEPAR: string[] = [
  "Battery on NERM-A1 at 87% sufficient with 15% margin for this route.",
  "Wind 5.2m/s SW adds +8% battery. Suggest flying Face-N first while wind is low.",
  "DEF-001 spalling at Level 16 needs close-up pass at 3m standoff.",
  "Current coverage 74% of north facade. 3 more WPs for 95% coverage.",
  "STDP confidence 0.87. I've learned 247 facade patterns from previous missions.",
  "Solar glare at 45° affects Face-N 10:00-14:00 HKT. Schedule Face-S first.",
  "HKCAD Cat B allows max 120m AMSL. Current alt is compliant.",
  "Recommend Catmull-Rom spline routing - smoother and saves 6% battery vs linear.",
];

export interface NepaSuggestion {
  i: string;
  t: string;
  d: string;
}

export const SUGGS: NepaSuggestion[] = [
  { i: "[wind]",  t: "Wind offset 2.4m",   d: "Shift route upwind to compensate 5.2m/s" },
  { i: "[bat]",   t: "Save 11% battery",    d: "Re-order WPs by proximity" },
  { i: "[cov]",   t: "+3 WPs for 95%",      d: "Add passes for full facade coverage" },
];

export interface NepaMsg {
  role: "ai" | "user";
  text: string;
}
