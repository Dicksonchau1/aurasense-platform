// src/app/api/skills/approval-queue/route.ts

import { NextResponse } from "next/server";
import { getPendingApprovalQueue } from "@/lib/skills/registry";

export async function GET() {
  const queue = await getPendingApprovalQueue();
  return NextResponse.json({ queue });
}