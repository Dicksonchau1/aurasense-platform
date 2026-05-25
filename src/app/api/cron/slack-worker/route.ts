import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  bandDowngradeBlocks, creditIssuedBlocks, emailDeadLetterBlocks
} from '@/atlas/slack/templates';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const WEBHOOK_CSM = process.env.SLACK_WEBHOOK_CSM!;       // #atlas-csm
const WEBHOOK_OPS = process.env.SLACK_WEBHOOK_OPS!;       // #atlas-ops
const BATCH_SIZE = 25;

function nextDelaySeconds(attempt: number): number {
  const exp = 60 * Math.pow(2, attempt);
  const jitter = Math.floor(Math.random() * 30);
  return Math.min(exp + jitter, 3600);
}

function isTransient(status: number): boolean {
  return status === 408 || status === 429 || (status >= 500 && status < 600);
}

function webhookFor(template: string): string {
  if (template.startsWith('ops_')) return WEBHOOK_OPS;
  return WEBHOOK_CSM;
}

function buildPayload(template: string, payload: any, alertId?: number) {
  switch (template) {
    case 'csm_band_downgrade':
      return bandDowngradeBlocks({ ...payload, alert_id: alertId ?? 0 });
    case 'csm_credit_issued':
      return creditIssuedBlocks(payload);
    case 'ops_email_dead_letter':
      return emailDeadLetterBlocks(payload);
    default:
      throw new Error(`Unknown template: ${template}`);
  }
}

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { data: claimed } = await supabase.rpc('claim_slack_batch', { p_limit: BATCH_SIZE });
  if (!claimed?.length) return NextResponse.json({ ok: true, drained: 0 });

  let sent = 0, retried = 0, dead = 0;

  for (const row of claimed) {
    try {
      const url = webhookFor(row.channel_template);
      if (!url) throw new Error('no_webhook_configured');

      const body = buildPayload(row.channel_template, row.payload, row.related_alert_id);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        const err: any = new Error(`slack_http_${res.status}: ${text.slice(0,200)}`);
        err.status = res.status;
        throw err;
      }

      // Incoming webhooks return "ok" as plain text and don't include ts/channel
      // unless using chat.postMessage. We'll record the response for audit.
      const ackText = await res.text();

      await supabase.from('slack_queue').update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        attempt_count: row.attempt_count + 1,
        last_error: null,
      }).eq('id', row.id);
      sent++;
    } catch (err: any) {
      const status = err?.status ?? 0;
      const transient = isTransient(status) || status === 0;  // network errors transient
      const newAttempts = row.attempt_count + 1;
      const dead_letter = newAttempts >= row.max_attempts || !transient;

      await supabase.from('slack_queue').update({
        status: dead_letter ? 'dead' : 'pending',
        attempt_count: newAttempts,
        last_error: String(err?.message ?? err).slice(0, 500),
        next_attempt_at: dead_letter ? null
          : new Date(Date.now() + nextDelaySeconds(newAttempts) * 1000).toISOString(),
      }).eq('id', row.id);

      if (dead_letter) dead++; else retried++;
    }
  }

  return NextResponse.json({ ok: true, drained: claimed.length, sent, retried, dead });
}
