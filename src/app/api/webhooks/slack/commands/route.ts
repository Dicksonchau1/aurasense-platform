import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function verifySlack(ts: string, body: string, sig: string): boolean {
  const secret = process.env.SLACK_SIGNING_SECRET!;
  const expected = 'v0=' + crypto.createHmac('sha256', secret)
    .update(`v0:${ts}:${body}`).digest('hex');
  if (Math.abs(Date.now()/1000 - parseInt(ts)) > 300) return false;
  try { return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig)); }
  catch { return false; }
}

export async function POST(req: NextRequest) {
  const ts  = req.headers.get('x-slack-request-timestamp') ?? '';
  const sig = req.headers.get('x-slack-signature') ?? '';
  const rawBody = await req.text();
  if (!verifySlack(ts, rawBody, sig)) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
  }

  const params = new URLSearchParams(rawBody);
  const command = params.get('command');
  const text = (params.get('text') ?? '').trim();

  if (command === '/atlas-health') {
    const customerId = text.split(/\s+/)[0];
    if (!customerId) {
      return NextResponse.json({
        response_type: 'ephemeral',
        text: 'Usage: `/atlas-health cust_alpha_001`'
      });
    }

    const { data: health } = await supabase.rpc('compute_customer_health_score', {
      p_customer_id: customerId
    });
    if (!health || health.score == null) {
      return NextResponse.json({
        response_type: 'ephemeral',
        text: `No active contracts found for \`${customerId}\``
      });
    }

    const c = health.components;
    return NextResponse.json({
      response_type: 'in_channel',
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: `${customerId} health` }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Score*\n\`${health.score}\` · \`${health.band}\`` },
            { type: 'mrkdwn', text: `*Monthly*\nHK$${health.context.monthly_revenue.toLocaleString()}` },
            { type: 'mrkdwn', text: `*SLA*\n${(c.compliance*100).toFixed(1)}%` },
            { type: 'mrkdwn', text: `*Margin*\n+${(c.avg_margin*100).toFixed(1)}%` },
            { type: 'mrkdwn', text: `*Trend (15d)*\n${c.margin_trend > 0 ? '+' : ''}${(c.margin_trend*100).toFixed(2)}%` },
            { type: 'mrkdwn', text: `*Credits 90d*\n${(c.credit_ratio*100).toFixed(1)}%` },
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Signals*\n' + (health.signals?.length
              ? health.signals.map((s: any) => `• ${s.message}`).join('\n')
              : '_None — performing within targets._')
          }
        },
        {
          type: 'actions',
          elements: [{
            type: 'button',
            text: { type: 'plain_text', text: 'Open Account Manager' },
            url: `${process.env.NEXT_PUBLIC_APP_URL}/account-manager?customer=${customerId}`,
          }]
        }
      ]
    });
  }

  return NextResponse.json({ response_type: 'ephemeral', text: 'Unknown command' });
}
