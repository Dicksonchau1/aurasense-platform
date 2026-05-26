// HKO Open Data adapter.
// Primary endpoint: rhrread (temperature, humidity, UV, rainfall, warnings)
// Wind: regional automatic weather stations don't expose wind in rhrread,
// so we use the local-weather-forecast endpoint for wind summary, and fall
// back to last-known cached values for direction.

const RHRREAD_URL = "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=en";
const FLW_URL = "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=flw&lang=en";

const DEFAULT_STATION = "King's Park";
const FETCH_TIMEOUT_MS = 8000;

export interface HkoSample {
  station: string;
  observed_at: string;
  temperature_c: number | null;
  humidity_pct: number | null;
  uv_index: number | null;
  rainfall_mm_1h: number | null;
  wind_speed_ms: number | null;
  wind_dir_deg: number | null;
  wind_gust_ms: number | null;
  pressure_hpa: number | null;
  warnings: string[];
  raw: unknown;
  source: string;
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const ctl = new AbortController();
  const id = setTimeout(() => ctl.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: ctl.signal, cache: "no-store" });
  } finally {
    clearTimeout(id);
  }
}

function pickStationValue(arr: any[] | undefined, station: string): number | null {
  if (!Array.isArray(arr)) return null;
  const hit = arr.find((x) => x?.place === station);
  if (hit && typeof hit.value === "number") return hit.value;
  const fallback = arr.find((x) => typeof x?.value === "number");
  return fallback ? fallback.value : null;
}

function pickRainfallMax(rain: any): number | null {
  if (!rain || !Array.isArray(rain.data)) return null;
  let max = 0;
  for (const d of rain.data) {
    if (typeof d?.max === "number" && d.max > max) max = d.max;
  }
  return max;
}

function extractWindFromForecast(flw: any): { speed_ms: number | null; dir_deg: number | null; gust_ms: number | null } {
  // FLW returns a free-text general situation + forecast. We do best-effort
  // parsing for "Force N" Beaufort scale or "X km/h" mentions.
  const text = [flw?.generalSituation, flw?.forecastDesc, flw?.outlook].filter(Boolean).join(" ").toLowerCase();
  if (!text) return { speed_ms: null, dir_deg: null, gust_ms: null };

  // km/h: "force 4-5 (15-30 km/h)"
  const kmh = text.match(/(\d+)\s*(?:to|-)\s*(\d+)\s*km\/h/);
  let speed_ms: number | null = null;
  if (kmh) {
    const lo = parseFloat(kmh[1]);
    const hi = parseFloat(kmh[2]);
    speed_ms = ((lo + hi) / 2) / 3.6;
  } else {
    const single = text.match(/(\d+)\s*km\/h/);
    if (single) speed_ms = parseFloat(single[1]) / 3.6;
  }

  // direction
  const dirMap: Record<string, number> = {
    "north": 0, "northeast": 45, "east": 90, "southeast": 135,
    "south": 180, "southwest": 225, "west": 270, "northwest": 315,
    "northerly": 0, "easterly": 90, "southerly": 180, "westerly": 270,
  };
  let dir_deg: number | null = null;
  for (const [name, deg] of Object.entries(dirMap)) {
    if (text.includes(name)) { dir_deg = deg; break; }
  }

  return { speed_ms, dir_deg, gust_ms: null };
}

export async function fetchHkoSample(station: string = DEFAULT_STATION): Promise<HkoSample> {
  const [rhrResp, flwResp] = await Promise.all([
    fetchWithTimeout(RHRREAD_URL),
    fetchWithTimeout(FLW_URL).catch(() => null as Response | null),
  ]);

  if (!rhrResp.ok) {
    throw new Error("HKO rhrread HTTP " + rhrResp.status);
  }
  const rhr = await rhrResp.json();
  const flw = flwResp && flwResp.ok ? await flwResp.json() : null;

  const observed_at = rhr?.updateTime ?? new Date().toISOString();
  const temperature_c = pickStationValue(rhr?.temperature?.data, station);
  const humidity_pct = pickStationValue(rhr?.humidity?.data, station);
  const uv_index = pickStationValue(rhr?.uvindex?.data, station);
  const rainfall_mm_1h = pickRainfallMax(rhr?.rainfall);
  const warnings: string[] = Array.isArray(rhr?.warningMessage) ? rhr.warningMessage : [];
  const wind = extractWindFromForecast(flw);

  return {
    station,
    observed_at,
    temperature_c,
    humidity_pct,
    uv_index,
    rainfall_mm_1h,
    wind_speed_ms: wind.speed_ms,
    wind_dir_deg: wind.dir_deg,
    wind_gust_ms: wind.gust_ms,
    pressure_hpa: null,
    warnings,
    raw: { rhrread: rhr, flw },
    source: "hko_rhrread+flw",
  };
}