import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_URL = (process.env.NEPA_BACKEND_URL ?? "http://127.0.0.1:8001").replace(/\/+$/, "");
const FETCH_TIMEOUT_MS = Number(process.env.NEPA_BACKEND_TIMEOUT_MS ?? "15000");

async function fetchTile(z: string, x: string, y: string): Promise<Response> {
  const ctl = new AbortController();
  const id = setTimeout(() => ctl.abort(), FETCH_TIMEOUT_MS);
  try {
    const url = BACKEND_URL + "/api/mbis/tiles/" + z + "/" + x + "/" + y + ".glb";
    return await fetch(url, { signal: ctl.signal, cache: "no-store" });
  } finally {
    clearTimeout(id);
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ z: string; x: string; y: string }> }) {
  const { z, x, y } = await params;
  if (!/^\d+$/.test(z) || !/^\d+$/.test(x) || !/^\d+$/.test(y)) {
    return NextResponse.json({ ok: false, error: "Invalid tile coordinates" }, { status: 400 });
  }
  try {
    const upstream = await fetchTile(z, x, y);
    if (!upstream.ok) {
      return NextResponse.json({ ok: false, error: "MBIS backend HTTP " + upstream.status }, { status: 502 });
    }
    const buf = await upstream.arrayBuffer();
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "model/gltf-binary",
        "Cache-Control": "public, max-age=3600",
        "X-MBIS-Tile": z + "/" + x + "/" + y,
        "X-MBIS-Origin-Lat": upstream.headers.get("X-MBIS-Origin-Lat") ?? "",
        "X-MBIS-Origin-Lng": upstream.headers.get("X-MBIS-Origin-Lng") ?? "",
        "X-MBIS-Buildings": upstream.headers.get("X-MBIS-Buildings") ?? "0",
        "Access-Control-Expose-Headers": "X-MBIS-Tile,X-MBIS-Origin-Lat,X-MBIS-Origin-Lng,X-MBIS-Buildings",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "MBIS proxy failed" }, { status: 502 });
  }
}