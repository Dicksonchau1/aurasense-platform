'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type CohortRow = {
  customer_id: string; score: number; band: 'healthy'|'at_risk'|'critical';
  monthly_revenue: number; signal_count: number;
};

export function AccountManagerView() {
  const [cohort, setCohort] = useState<CohortRow[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [bandFilter, setBandFilter] = useState<'all'|'critical'|'at_risk'|'healthy'>('all');
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc('customer_health_cohort');
      setCohort((data ?? []).sort((a: any, b: any) => a.score - b.score));

      const { data: alertRows } = await supabase.from('csm_alerts')
        .select('*').is('acknowledged_at', null)
        .order('created_at', { ascending: false }).limit(20);
      setAlerts(alertRows ?? []);
    })();
  }, []);

  const filtered = bandFilter === 'all' ? cohort : cohort.filter(c => c.band === bandFilter);
  const criticalCount = cohort.filter(c => c.band === 'critical').length;
  const atRiskCount   = cohort.filter(c => c.band === 'at_risk').length;
  const healthyCount  = cohort.filter(c => c.band === 'healthy').length;
  const totalMRR      = cohort.reduce((s, c) => s + c.monthly_revenue, 0);
  const atRiskMRR     = cohort.filter(c => c.band !== 'healthy').reduce((s, c) => s + c.monthly_revenue, 0);

  return (
    <div className="grid grid-cols-12 min-h-screen">
      {/* Sidebar — alerts feed */}
      <aside className="col-span-3 bg-white border-r border-neutral-200 overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-sm">Open alerts</h2>
          <p className="text-xs text-neutral-500 mt-1">{alerts.length} unacknowledged</p>
        </div>
        <ul>
          {alerts.map(a => (
            <li key={a.id} className="border-b border-neutral-100 p-3 hover:bg-neutral-50 cursor-pointer"
                onClick={() => setSelected(a.customer_id)}>
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <code className="text-xs">{a.customer_id}</code>
                <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                  a.severity === 'high' ? 'bg-red-100 text-red-800' :
                  a.severity === 'medium' ? 'bg-amber-100 text-amber-800' :
                  'bg-neutral-100 text-neutral-700'
                }`}>{a.severity}</span>
              </div>
              <p className="text-xs text-neutral-700">
                {a.alert_type === 'band_downgrade' && (
                  <>Band drop: <b>{a.payload.from}</b> → <b>{a.payload.to}</b> (score {a.payload.score})</>
                )}
              </p>
              <p className="text-xs text-neutral-500 mt-1">{new Date(a.created_at).toLocaleString()}</p>
            </li>
          ))}
          {alerts.length === 0 && <li className="p-6 text-center text-sm text-neutral-500">No open alerts</li>}
        </ul>
      </aside>

      {/* Main — cohort grid */}
      <section className="col-span-6 p-6 overflow-y-auto">
        <header className="mb-6">
          <h1 className="text-xl font-bold">Customer Health Cohort</h1>
          <p className="text-sm text-neutral-500">Sorted by score ascending — at-risk accounts surface first.</p>
        </header>

        <div className="grid grid-cols-4 gap-3 mb-6">
          <KPI label="Total customers" value={cohort.length} accent="neutral" />
          <KPI label="Critical" value={criticalCount} accent="red" />
          <KPI label="At-risk" value={atRiskCount} accent="amber" />
          <KPI label="At-risk MRR" value={`HK$${atRiskMRR.toLocaleString()}`} hint={`of HK$${totalMRR.toLocaleString()}`} accent="amber" />
        </div>

        <div className="flex gap-1 p-1 bg-neutral-100 rounded mb-4 text-sm w-fit">
          {(['all','critical','at_risk','healthy'] as const).map(b => (
            <button key={b} onClick={() => setBandFilter(b)}
              className={`px-3 py-1 rounded ${bandFilter === b ? 'bg-white shadow-sm font-medium' : 'text-neutral-600'}`}>
              {b === 'all' ? 'All' : b.replace('_',' ')} ({b === 'all' ? cohort.length : cohort.filter(c=>c.band===b).length})
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-xs text-neutral-600">
              <tr>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-right px-4 py-3">Score</th>
                <th className="text-left px-4 py-3">Band</th>
                <th className="text-right px-4 py-3">MRR</th>
                <th className="text-right px-4 py-3">Signals</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <tr key={row.customer_id}
                    onClick={() => setSelected(row.customer_id)}
                    className={`border-t border-neutral-100 cursor-pointer hover:bg-neutral-50 ${
                      selected === row.customer_id ? 'bg-blue-50' : ''
                    }`}>
                  <td className="px-4 py-3"><code className="text-xs">{row.customer_id}</code></td>
                  <td className="text-right px-4 py-3 font-mono font-semibold">{row.score?.toFixed(1) ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded font-mono ${
                      row.band === 'healthy'  ? 'bg-emerald-50 text-emerald-700' :
                      row.band === 'at_risk'  ? 'bg-amber-50 text-amber-700'    :
                                                'bg-red-50 text-red-700'
                    }`}>{row.band}</span>
                  </td>
                  <td className="text-right px-4 py-3 font-mono">HK${row.monthly_revenue?.toLocaleString() ?? 0}</td>
                  <td className="text-right px-4 py-3 font-mono text-neutral-600">{row.signal_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Drill-down panel */}
      <aside className="col-span-3 bg-white border-l border-neutral-200 overflow-y-auto">
        {selected ? <CustomerDrilldown customerId={selected} /> :
          <div className="p-6 text-center text-sm text-neutral-500">Select a customer to drill down.</div>}
      </aside>
    </div>
  );
}

function CustomerDrilldown({ customerId }: { customerId: string }) {
  const [health, setHealth] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: h } = await supabase.rpc('compute_customer_health_score', { p_customer_id: customerId });
      const { data: t } = await supabase.from('customer_health_snapshots')
        .select('score, snapshot_at').eq('customer_id', customerId)
        .order('snapshot_at', { ascending: true }).limit(30);
      setHealth(h); setTrend(t ?? []);
    })();
  }, [customerId]);

  if (!health) return <div className="p-4">Loading…</div>;

  const c = health.components;
  const ctx = health.context;

  return (
    <div className="p-5 space-y-5">
      <header>
        <code className="text-xs">{customerId}</code>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-mono font-bold">{health.score?.toFixed(1)}</span>
          <span className={`text-xs px-2 py-1 rounded font-mono ${
            health.band === 'healthy' ? 'bg-emerald-100 text-emerald-800' :
            health.band === 'at_risk' ? 'bg-amber-100 text-amber-800' :
                                        'bg-red-100 text-red-800'
          }`}>{health.band}</span>
        </div>
      </header>

      {/* Trend sparkline */}
      {trend.length > 1 && <Sparkline points={trend.map((t:any) => parseFloat(t.score))}/>}

      {/* Components breakdown */}
      <section>
        <h4 className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Score components</h4>
        <ul className="space-y-2 text-sm">
          <Component label="SLA compliance" value={`${(c.compliance*100).toFixed(1)}%`} weight={35} />
          <Component label="Margin above floor" value={`+${(c.avg_margin*100).toFixed(1)}%`} weight={25} />
          <Component label="Margin trend (15d)" value={`${c.margin_trend > 0 ? '+' : ''}${(c.margin_trend*100).toFixed(2)}%`} weight={15} />
          <Component label="Credit burden" value={`${(c.credit_ratio*100).toFixed(1)}%`} weight={15} />
          <Component label="Engagement" value={`${(c.engagement*100).toFixed(0)}%`} weight={10} />
        </ul>
      </section>

      {/* Signals */}
      {health.signals.length > 0 && (
        <section>
          <h4 className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Signals</h4>
          <ul className="space-y-1.5 text-sm">
            {health.signals.map((s: any, i: number) => (
              <li key={i} className={`p-2 rounded text-xs ${
                s.severity === 'high'      ? 'bg-red-50 text-red-800' :
                s.severity === 'medium'    ? 'bg-amber-50 text-amber-800' :
                s.severity === 'expansion' ? 'bg-emerald-50 text-emerald-800' :
                                             'bg-neutral-50 text-neutral-700'
              }`}>{s.message}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Context */}
      <section className="pt-3 border-t border-neutral-100">
        <h4 className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Context</h4>
        <dl className="grid grid-cols-2 gap-2 text-xs">
          <Dt>Active contracts</Dt><Dd>{ctx.active_contracts}</Dd>
          <Dt>Monthly revenue</Dt><Dd>HK${ctx.monthly_revenue?.toLocaleString()}</Dd>
          <Dt>Credits (90d)</Dt><Dd>HK${ctx.credits_90d?.toLocaleString()}</Dd>
          <Dt>Missions (30d)</Dt><Dd>{ctx.missions_30d}</Dd>
        </dl>
      </section>

      {/* Recommended action */}
      <section className="pt-3 border-t border-neutral-100">
        <h4 className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Recommended action</h4>
        <p className="text-sm text-neutral-700">{recommendAction(health)}</p>
        <button className="mt-3 w-full px-3 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700">
          Log CSM activity
        </button>
      </section>
    </div>
  );
}

function recommendAction(h: any): string {
  const expansionSignal = h.signals.find((s:any) => s.severity === 'expansion');
  if (expansionSignal) return 'Schedule expansion call. Customer is performing above tier — propose uptier or adjacent skill.';
  if (h.band === 'critical') return 'Immediate intervention. Schedule executive review within 48 hours; investigate margin erosion driver.';
  if (h.band === 'at_risk')  return 'Proactive outreach within 7 days. Review specific signals; offer technical session.';
  return 'Standard cadence. Monthly check-in suffices.';
}

function Component({ label, value, weight }: any) {
  return (
    <li className="flex justify-between items-baseline">
      <span className="text-neutral-600">{label} <span className="text-xs text-neutral-400">×{weight}</span></span>
      <span className="font-mono">{value}</span>
    </li>
  );
}
function Dt({ children }: any) { return <dt className="text-neutral-500">{children}</dt>; }
function Dd({ children }: any) { return <dd className="font-mono text-right">{children}</dd>; }

function KPI({ label, value, hint, accent }: any) {
  const colors: any = {
    neutral: 'bg-white border border-neutral-200',
    red:     'bg-red-50 text-red-800',
    amber:   'bg-amber-50 text-amber-800',
  };
  return (
    <div className={`rounded p-3 ${colors[accent]}`}>
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="font-mono font-bold text-xl mt-1">{value}</div>
      {hint && <div className="text-xs text-neutral-500 mt-0.5">{hint}</div>}
    </div>
  );
}

function Sparkline({ points }: { points: number[] }) {
  const w = 240, h = 40, pad = 2;
  if (points.length < 2) return null;
  const min = Math.min(...points), max = Math.max(...points);
  const range = max - min || 1;
  const path = points.map((v, i) =>
    `${pad + (i/(points.length-1))*(w-pad*2)},${h-pad-((v-min)/range)*(h-pad*2)}`
  ).join(' ');
  const last = points[points.length-1], first = points[0];
  const trending = last >= first;
  return (
    <div>
      <svg width={w} height={h} className="w-full">
        <polyline points={path} fill="none"
          stroke={trending ? '#10b981' : '#ef4444'} strokeWidth={1.5}/>
      </svg>
      <p className="text-xs text-neutral-500 mt-1">
        {points.length}-day trend · {trending ? '↑' : '↓'} {(last - first).toFixed(1)} points
      </p>
    </div>
  );
}
