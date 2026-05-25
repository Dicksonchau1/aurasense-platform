import { NextRequest, NextResponse } from 'next/server';
import { PolygonEngineOrchestrator } from '@/lib/rehearse/orchestrator';
import type { RehearseSessionContext, TelemetryFrame } from '@/lib/rehearse/types';
// Import or define your auth middleware/util
import { requireAuth } from '@/lib/nepa/auth';
// Import or define your NEPA and signature map adapters/clients
import { getSubstrateClient } from '@/lib/nepa/substrate-adapter';
import { getSignatureMapClient } from '@/lib/signature-map/client';
import { broadcastSceneEvent } from '@/app/api/rehearse/scene-ws/route';

export async function POST(req: NextRequest) {
  // Require authentication using existing pattern
  const user = await requireAuth(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const { action, session_id, payload } = body || {};
  if (!action || !session_id) {
    return NextResponse.json({ error: 'Missing action or session_id' }, { status: 400 });
  }
  // Instantiate orchestrator with dependency wrappers
  const orchestrator = new PolygonEngineOrchestrator({
    sessionId: session_id,
    runId: payload?.run_id || '',
    substrateClient: getSubstrateClient(),
    signatureMapClient: getSignatureMapClient(),
    broadcastSceneEvent
  });
  try {
    if (action === 'start') {
      const result = await orchestrator.onSessionStart(payload as RehearseSessionContext);
      return NextResponse.json(result);
    } else if (action === 'tick') {
      const { context, telemetry } = payload || {};
      if (!context || !telemetry) {
        return NextResponse.json({ error: 'Missing context or telemetry' }, { status: 400 });
      }
      const result = await orchestrator.onTick(context as RehearseSessionContext, telemetry as TelemetryFrame);
      return NextResponse.json(result);
    } else if (action === 'end') {
      const { context } = payload || {};
      if (!context) {
        return NextResponse.json({ error: 'Missing context' }, { status: 400 });
      }
      const result = await orchestrator.onSessionEnd(context as RehearseSessionContext);
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal error', detail: err?.message || err }, { status: 500 });
  }
}
