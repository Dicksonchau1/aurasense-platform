// src/app/api/skills/route.ts

import { NextRequest, NextResponse } from "next/server";
import { listSkills, registerSkill } from "@/lib/skills/registry";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const skills = await listSkills({
    domain: searchParams.get("domain") as any ?? undefined,
    status: searchParams.get("status") as any ?? undefined,
    provenance: searchParams.get("provenance") as any ?? undefined,
  });

  return NextResponse.json({ skills });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const skill = await registerSkill(body);
  return NextResponse.json({ skill }, { status: 201 });
}