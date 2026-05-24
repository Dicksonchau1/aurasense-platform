export const dynamic = "force-dynamic";

import Card from "@/components/shell/Card";

async function fetchEdgeStatus() {
  try {
    const url = process.env.NEPA_API_URL || "http://76.13.177.39:8080";
    const r = await fetch(`${url}/healthz`, { cache: "no-store", next: { revalidate: 0 } });
    if (!r.ok) return null;
    return (await r.json()) as any;
  } catch {
    return null;
  }
}

export default async function AttasPage() {
  const edge = await fetchEdgeStatus();
  const ok = !!edge && edge.status === "ok";

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="aura-h1">ATTAS</h1>
          <p className="aura-sub mt-1">
            Adaptive Telemetry &amp; Actuation Substrate — real-time NEPA edge
            perception pipeline for autonomous task execution.
          </p>
        </div>
        <span className={`aura-badge ${ok ? "aura-badge-success" : "aura-badge-warn"}`}>
          {ok ? "Edge online" : "Edge unreachable"}
        </span>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        <Card title="Runtime">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="aura-sub">Service</span>
              <span className="font-semibold">aurasense-nepa</span>
            </div>
            <div className="flex justify-between">
              <span className="aura-sub">Version</span>
              <span className="font-mono">{edge?.version ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="aura-sub">Status</span>
              <span className="font-semibold">{edge?.status ?? "unknown"}</span>
            </div>
          </div>
        </Card>

        <Card title="Capacity">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="aura-sub">Active slots</span>
              <span className="font-mono">{edge?.active_slots ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="aura-sub">Max slots</span>
              <span className="font-mono">{edge?.max_slots ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="aura-sub">Free capacity</span>
              <span className="font-mono">{edge?.free_capacity ?? "—"}</span>
            </div>
          </div>
        </Card>

        <Card title="Transport">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="aura-sub">Protocol</span>
              <span className="font-mono">{edge?.transport ?? "WebSocket"}</span>
            </div>
            <div className="flex justify-between">
              <span className="aura-sub">Uptime</span>
              <span className="font-mono">{edge?.uptime ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="aura-sub">Latency</span>
              <span className="font-mono">{edge?.latency_ms != null ? `${edge.latency_ms} ms` : "—"}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Pipeline stages">
        <ol className="space-y-3 text-sm list-decimal list-inside text-[var(--text-muted)]">
          <li><span className="text-[var(--text)]">Perception</span> — YOLO v8 + MediaPipe pose fusion at 30 fps</li>
          <li><span className="text-[var(--text)]">State encoding</span> — NEPA spike encoder maps visual features to latent spikes</li>
          <li><span className="text-[var(--text)]">Decision</span> — SNN inference selects actuation policy</li>
          <li><span className="text-[var(--text)]">Actuation</span> — motor commands dispatched over WebSocket in &lt;16 ms</li>
          <li><span className="text-[var(--text)]">Audit</span> — HMAC-signed event written to Supabase audit chain</li>
        </ol>
      </Card>
    </div>
  );
}
