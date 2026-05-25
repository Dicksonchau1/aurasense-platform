import { NextRequest, NextResponse } from 'next/server';
import { droneContextToSessionContext, droneTelemetryToFrame, DroneInspectionContext } from '../../../../lib/rehearse/domains/drone-inspection';
import { orchestratorSessionHandler } from '../../../../lib/rehearse/orchestrator';
import { requireAuth } from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  await requireAuth(req);
  const body = await req.json();
  const { action, session_id, drone_context, telemetry } = body;

  let sessionContext;
  if (drone_context) {
    sessionContext = droneContextToSessionContext(
      drone_context as DroneInspectionContext,
      session_id,
      body.run_id || '',
      body.substrate_run_id || '',
      body.deployment_id || ''
    );
  }

  let frame;
  if (telemetry) {
    frame = droneTelemetryToFrame(telemetry);
  }

  // Delegate to generic orchestrator session handler
  return orchestratorSessionHandler({
    action,
    session_id,
    sessionContext,
    frame,
    domain: 'drone-inspection',
  });
}
