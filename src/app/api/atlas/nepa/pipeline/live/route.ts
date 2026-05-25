import { NextResponse } from 'next/server';
import { envelope, jitter } from '@/lib/nepa';
import { pickRuntime } from '@/lib/runtime';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const encoder = new TextEncoder();
const STAGE_NAMES = [
  'sensor_ingestion','spike_encoding','stdp_learning','world_model_prior',
  'perception_fusion','anomaly_detection','agent_reasoning','action_orchestration',
  'audit_chain','continual_learning_loop',
];

export async function GET(req: Request) {
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) =>
        controller.enqueue(encoder.encode(`event: pipeline\ndata: ${JSON.stringify(data)}\n\n`));

      const tick = async () => {
        const rt = pickRuntime();
        const health = await rt.health().catch(() => ({ ok: false, runtime: 'error' }));
        const stages = STAGE_NAMES.map((name, i) => ({
          n: i + 1,
          name,
          status: health.ok ? 'healthy' : (i < 3 ? 'offline' : 'degraded'),
          throughput_hz: health.ok ? jitter(28, 34) : 0,
          latency_ms: health.ok ? jitter(0.8, 4.2) : 0,
        }));
        send({ stages, total_latency_ms: health.ok ? jitter(8, 14) : 0, ts: Date.now() });
      };

      await tick();
      const id = setInterval(tick, 2000);
      const hb = setInterval(() => {
        try { controller.enqueue(encoder.encode(`: ping ${Date.now()}\n\n`)); } catch {}
      }, 25000);
      req.signal?.addEventListener('abort', () => { clearInterval(id); clearInterval(hb); try { controller.close(); } catch {} });
    }
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}