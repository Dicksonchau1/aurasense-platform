import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type EnvelopePayload = {
  t0: number;
  t1: number;
  keyframeRef: string;
  deltaBase64: string;
  scope: "live" | "rehearsal";
  provenance: {
    siteId: string;
    sessionId: string;
    agent?: string;
  };
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EnvelopePayload;

    if (
      typeof body?.t0 !== "number" ||
      typeof body?.t1 !== "number" ||
      typeof body?.keyframeRef !== "string" ||
      typeof body?.deltaBase64 !== "string" ||
      (body?.scope !== "live" && body?.scope !== "rehearsal") ||
      typeof body?.provenance?.siteId !== "string" ||
      typeof body?.provenance?.sessionId !== "string"
    ) {
      return NextResponse.json(
        { ok: false, error: "Invalid envelope payload" },
        { status: 400 }
      );
    }

    const record = {
      receivedAt: new Date().toISOString(),
      ...body,
    };

    return NextResponse.json({
      ok: true,
      persisted: false,
      target: "stub",
      record,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Envelope ingest failed",
      },
      { status: 500 }
    );
  }
}