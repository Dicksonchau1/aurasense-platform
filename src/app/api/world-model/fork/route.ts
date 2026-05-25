import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ForkPayload = {
  sessionId: string;
  siteId: string;
  sourceMode: "live" | "rehearsal";
  snapshot: {
    pose: {
      x: number;
      y: number;
      z: number;
      qx: number;
      qy: number;
      qz: number;
      qw: number;
    };
    vel: {
      vx: number;
      vy: number;
      vz: number;
      wx: number;
      wy: number;
      wz: number;
    };
    battery: number;
    t: number;
  };
  label?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ForkPayload;

    if (
      typeof body?.sessionId !== "string" ||
      typeof body?.siteId !== "string" ||
      (body?.sourceMode !== "live" && body?.sourceMode !== "rehearsal") ||
      typeof body?.snapshot?.pose?.x !== "number" ||
      typeof body?.snapshot?.pose?.y !== "number" ||
      typeof body?.snapshot?.pose?.z !== "number"
    ) {
      return NextResponse.json(
        { ok: false, error: "Invalid fork payload" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      persisted: false,
      target: "stub",
      rehearsalSession: {
        ...body,
        createdAt: new Date().toISOString(),
        label: body.label ?? "Polygon rehearsal fork",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Fork creation failed",
      },
      { status: 500 }
    );
  }
}