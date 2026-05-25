import { NextResponse } from 'next/server';
import { HriSessionRepository } from 'packages/audit-events/src/repositories/hriSessionRepository';
import { Database } from '@/lib/supabase/types';

const hriSessionRepo = new HriSessionRepository();

// POST /api/hri-session - create a new HRI session
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Validate required fields
    if (!body.app_context || !body.agent_id || !body.status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const result = await hriSessionRepo.createSession({
      app_context: body.app_context,
      scenario_id: body.scenario_id ?? null,
      mission_id: body.mission_id ?? null,
      operator_user_id: body.operator_user_id ?? null,
      agent_id: body.agent_id,
      status: body.status,
    });
    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }
    return NextResponse.json({ session: result.data?.[0] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

// PATCH /api/hri-session - append event, recommendation, or decision
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    if (!body.session_id || !body.action_type) {
      return NextResponse.json({ error: 'Missing session_id or action_type' }, { status: 400 });
    }
    let result;
    switch (body.action_type) {
      case 'timeline_event': {
        // Required: event_type, event_payload
        if (!body.event_type || !body.event_payload) {
          return NextResponse.json({ error: 'Missing event_type or event_payload' }, { status: 400 });
        }
        result = await hriSessionRepo.supabase.from('hri_timeline_events').insert([
          {
            session_id: body.session_id,
            event_type: body.event_type,
            event_payload: body.event_payload,
          },
        ]);
        break;
      }
      case 'recommendation': {
        // Required: recommendation_type, perception_summary, recommendation_payload
        if (!body.recommendation_type || !body.perception_summary || !body.recommendation_payload) {
          return NextResponse.json({ error: 'Missing recommendation_type, perception_summary, or recommendation_payload' }, { status: 400 });
        }
        result = await hriSessionRepo.supabase.from('agent_recommendations').insert([
          {
            session_id: body.session_id,
            recommendation_type: body.recommendation_type,
            confidence: body.confidence ?? null,
            perception_summary: body.perception_summary,
            recommendation_payload: body.recommendation_payload,
          },
        ]);
        break;
      }
      case 'operator_decision': {
        // Required: decision_type
        if (!body.decision_type) {
          return NextResponse.json({ error: 'Missing decision_type' }, { status: 400 });
        }
        result = await hriSessionRepo.supabase.from('operator_decisions').insert([
          {
            session_id: body.session_id,
            user_id: body.user_id ?? null,
            decision_type: body.decision_type,
            rationale: body.rationale ?? null,
            correction_payload: body.correction_payload ?? null,
          },
        ]);
        break;
      }
      default:
        return NextResponse.json({ error: 'Unknown action_type' }, { status: 400 });
    }
    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data: result.data?.[0] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
