'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
type ContractRisk = {
  id: string;
  customer_id: string;
  site_id: string;
  skill_id: string;
  sla_tier: string;
  compliance: number;
  margin: number;
  breaches: number;
  endsIn: number;
  risk: 'high'|'medium'|'low';
};

export function AccountManagerDashboard() {
  const [loading, setLoading] = useState(true);
  const [risks, setRisks] = useState<ContractRisk[]>([]);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [churn, setChurn] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      // Renewal risk: contracts expiring in 60d, low compliance, low margin, or high breaches
      const since = new Date(Date.now() - 30*24*60*60*1000).toISOString();
      const { data: contracts } = await supabase.from('skill_contracts')
        .select('*')
        .eq('status', 'active')
        .neq('skill_id', '__bundle_master__');
      const risks: ContractRisk[] = [];
      for (const c of contracts ?? []) {
        // Fetch compliance and breaches for last 30d
        const { data: m } = await supabase.from('skill_slo_measurements')
          .select('sla_met')
          .eq('skill_id', c.skill_id)
          .gte('measured_at', since);
        const total = m?.length ?? 0;
        const met = m?.filter((x: any) => x.sla_met).length ?? 0;
        const compliance = total ? met/total : 1;
        // Margin: use avg_margin from renewal_offers if available, else 0
        const { data: offer } = await supabase.from('renewal_offers')
          .select('retrospective')
          .eq('contract_id', c.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        const margin = offer?.retrospective?.avg_margin ?? 0;
        const breaches = m?.filter((x: any) => !x.sla_met).length ?? 0;
        const endsIn = Math.round((new Date(c.ends_at).getTime() - Date.now())/(1000*60*60*24));
        // Risk scoring
        let risk: 'high'|'medium'|'low' = 'low';
        if (compliance < 0.97 || margin < 0.02 || breaches > 2 || endsIn < 45) risk = 'medium';
        if (compliance < 0.95 || margin < 0.01 || breaches > 4 || endsIn < 15) risk = 'high';
        risks.push({
          id: c.id, customer_id: c.customer_id, site_id: c.site_id, skill_id: c.skill_id, sla_tier: c.sla_tier,
          compliance, margin, breaches, endsIn, risk
        });
      }
      setRisks(risks);

      // Cohort trends: avg compliance/margin by tier
      const cohortMap: Record<string, { n: number, compliance: number, margin: number }> = {};
      for (const r of risks) {
        const key = r.sla_tier;
        if (!cohortMap[key]) cohortMap[key] = { n: 0, compliance: 0, margin: 0 };
        cohortMap[key].n++;
        cohortMap[key].compliance += r.compliance;
        cohortMap[key].margin += r.margin;
      }
      const cohorts = Object.entries(cohortMap).map(([tier, v]) => ({
        tier,
        n: v.n,
        avgCompliance: v.compliance/v.n,
        avgMargin: v.margin/v.n,
      }));
      setCohorts(cohorts);

      // Churn signals: contracts with declining compliance/margin (simulate for now)
      const churn = risks.filter(r => r.compliance < 0.96 || r.margin < 0.01 || r.risk === 'high');
      setChurn(churn);

      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-12 text-center text-neutral-500">Loading dashboard…</div>;

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Account Manager Dashboard</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Renewal Risk</h2>
        <table className="w-full text-sm border">
          <thead className="bg-neutral-100">
            <tr>
              <th className="text-left px-3 py-2">Customer</th>
              <th className="text-left px-3 py-2">Site</th>
              <th className="text-left px-3 py-2">Skill</th>
              <th className="text-left px-3 py-2">Tier</th>
              <th className="text-right px-3 py-2">Compliance</th>
              <th className="text-right px-3 py-2">Margin</th>
              <th className="text-right px-3 py-2">Breaches</th>
              <th className="text-right px-3 py-2">Ends in</th>
              <th className="text-center px-3 py-2">Risk</th>
            </tr>
          </thead>
          <tbody>
            {risks.map(c => (
              <tr key={c.id} className="border-t">
                <td className="px-3 py-2">{c.customer_id}</td>
                <td className="px-3 py-2">{c.site_id}</td>
                <td className="px-3 py-2">{c.skill_id}</td>
                <td className="px-3 py-2">{c.sla_tier}</td>
                <td className="px-3 py-2 text-right">{(c.compliance*100).toFixed(1)}%</td>
                <td className="px-3 py-2 text-right">+{(c.margin*100).toFixed(1)}%</td>
                <td className="px-3 py-2 text-right">{c.breaches}</td>
                <td className="px-3 py-2 text-right">{c.endsIn}d</td>
                <td className="px-3 py-2 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-mono ${c.risk==='high'?'bg-red-100 text-red-700':c.risk==='medium'?'bg-amber-100 text-amber-700':'bg-emerald-50 text-emerald-700'}`}>{c.risk.toUpperCase()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Cohort Trends</h2>
        <table className="w-full text-sm border">
          <thead className="bg-neutral-100">
            <tr>
              <th className="text-left px-3 py-2">Tier</th>
              <th className="text-right px-3 py-2">Contracts</th>
              <th className="text-right px-3 py-2">Avg Compliance</th>
              <th className="text-right px-3 py-2">Avg Margin</th>
            </tr>
          </thead>
          <tbody>
            {cohorts.map(c => (
              <tr key={c.tier} className="border-t">
                <td className="px-3 py-2">{c.tier}</td>
                <td className="px-3 py-2 text-right">{c.n}</td>
                <td className="px-3 py-2 text-right">{(c.avgCompliance*100).toFixed(1)}%</td>
                <td className="px-3 py-2 text-right">+{(c.avgMargin*100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Churn Signals</h2>
        {churn.length === 0 ? (
          <div className="text-neutral-500 p-4">No strong churn signals detected.</div>
        ) : (
          <table className="w-full text-sm border">
            <thead className="bg-neutral-100">
              <tr>
                <th className="text-left px-3 py-2">Customer</th>
                <th className="text-left px-3 py-2">Skill</th>
                <th className="text-right px-3 py-2">Compliance</th>
                <th className="text-right px-3 py-2">Margin</th>
                <th className="text-right px-3 py-2">Risk</th>
              </tr>
            </thead>
            <tbody>
              {churn.map(c => (
                <tr key={c.id} className="border-t">
                  <td className="px-3 py-2">{c.customer_id}</td>
                  <td className="px-3 py-2">{c.skill_id}</td>
                  <td className="px-3 py-2 text-right">{(c.compliance*100).toFixed(1)}%</td>
                  <td className="px-3 py-2 text-right">+{(c.margin*100).toFixed(1)}%</td>
                  <td className="px-3 py-2 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-mono ${c.risk==='high'?'bg-red-100 text-red-700':c.risk==='medium'?'bg-amber-100 text-amber-700':'bg-emerald-50 text-emerald-700'}`}>{c.risk.toUpperCase()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
