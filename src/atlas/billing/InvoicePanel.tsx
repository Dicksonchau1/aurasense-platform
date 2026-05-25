'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function InvoicePanel({ siteId }:{ siteId: string }) {
  const [invoices, setInvoices] = useState<any[]>([]);
  useEffect(() => {
    supabase.from('invoices').select('*').eq('site_id', siteId)
      .order('period_start', { ascending: false }).limit(12)
      .then(({ data }) => setInvoices(data ?? []));
  }, [siteId]);

  return (
    <div className="p-4 space-y-2">
      <h3 className="font-semibold text-sm">Invoices</h3>
      {invoices.map(inv => (
        <div key={inv.id} className="rounded border p-3 text-sm">
          <div className="flex justify-between">
            <span className="font-mono">{inv.period_start} – {inv.period_end}</span>
            <span className={`text-xs px-2 py-0.5 rounded ${inv.status==='paid'?'bg-emerald-100 text-emerald-800':'bg-amber-100 text-amber-800'}`}>{inv.status}</span>
          </div>
          <div className="grid grid-cols-2 gap-1 mt-2 text-xs text-neutral-600">
            <span>Subscription: HK${inv.subscription_hkd}</span>
            <span>Overage: HK${inv.postflight_overage_hkd}</span>
            <span>Skills: HK${inv.skills_hkd}</span>
            <span className="text-emerald-700">Credits: −HK${inv.slo_credits_hkd}</span>
          </div>
          <div className="mt-2 font-semibold">Total: HK${inv.total_hkd}</div>
          {inv.pdf_url && <a href={inv.pdf_url} className="text-xs text-blue-600 underline mt-1 block" target="_blank">Download PDF</a>}
        </div>
      ))}
    </div>
  );
}