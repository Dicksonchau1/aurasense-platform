// src/app/api/skills/[id]/approve/route.ts

import { NextRequest, NextResponse } from "next/server";
import { updateSkillStatus } from "@/lib/skills/registry";
import { emitAuditEvent } from "@/lib/audit/emit";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { approvedBy, action } = await req.json();

  const status = action === "approve" ? "approved" : "deprecated";
  await updateSkillStatus(params.id, status, approvedBy);

  await emitAuditEvent({
    type: action === "approve" ? "skill_approved" : "skill_rejected",
    skillId: params.id,
    approvedBy,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, status });
}