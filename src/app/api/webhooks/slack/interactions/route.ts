import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Verify Slack signing secret per their spec
function verifySlack(req: { ts: string; body: string; sig: string }): boolean {
  const secret = process.env.SLACK_SIGNING_SECRET!;
  const base = `v0:${req.ts}:${req.body}`;
  const expected = 'v0=' + crypto.createHmac('sha256', secret).update(base).digest('hex');
  // Reject requests older than 5 minutes (replay protection)
  if (Math.abs(Date.now()/1000 - parseInt(req.ts)) > 300) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(req.sig));
  } catch { return false; }
}

export async function POST(req: NextRequest) {
  const ts  = req.headers.get('x-slack-request-timestamp') ?? '';
  const sig = req.headers.get('x-slack-signature') ?? '';
  const rawBody = await req.text();
  if (!verifySlack({ ts, body: rawBody, sig })) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
  }

  // Slack sends URL-encoded form with a `payload` field containing JSON
  const params = new URLSearchParams(rawBody);
  const payload = JSON.parse(params.get('payload') ?? '{}');

  if (payload.type !== 'block_actions') {
    return NextResponse.json({ ok: true });
  }

  const action = payload.actions?.[0];
  const userId = payload.user?.id;
  const userName = payload.user?.username ?? payload.user?.name ?? 'unknown';
  const responseUrl = payload.response_url;

  if (action?.action_id === 'csm_acknowledge') {
    const alertId = parseInt(action.value);

    // Acknowledge in our database
    await supabase.from('csm_alerts').update({
      acknowledged_at: new Date().toISOString(),
      acknowledged_by: `slack:${userName}`,
    }).eq('id', alertId);

    // Update the original message to reflect acknowledgement
    const updatedBlocks = (payload.message?.blocks ?? []).map((b: any) =>
      b.type === 'actions' ? {
        type: 'context',
        elements: [{
          type: 'mrkdwn',
          text: `:white_check_mark: Acknowledged by <@${userId}> at ${new Date().toUTCString()}`
        }]
      } : b
    );

    await fetch(responseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        replace_original: true,
        text: payload.message.text,
        blocks: updatedBlocks,
      }),
    });
  }

  if (action?.action_id === 'open_drilldown') {
    // URL buttons still send a payload — we just ack with 200
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
