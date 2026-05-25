'use client';

// src/atlas/skills/bundles/BundleCart.tsx
'use client';
import { useEffect, useState } from 'react';
import { computeBundlePrice, type BundleQuote, type CartItem } from './computeBundlePrice';

export function BundleCart({ siteId, items, onCheckout }:{
  siteId: string; items: CartItem[]; onCheckout: (q: BundleQuote)=>void;
}) {
  const [quote, setQuote] = useState<BundleQuote | null>(null);

  useEffect(() => {
    if (items.length === 0) { setQuote(null); return; }
    computeBundlePrice(items).then(setQuote);
  }, [items]);

  if (!quote) return null;

  const nextTierGap = nextTierThreshold(quote.itemCount);

  return (
    <aside className="w-96 rounded-lg border border-neutral-200 bg-white p-5 sticky top-6">
      <header className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Your bundle</h3>
        <span className="text-xs font-mono text-neutral-500">{quote.itemCount} skill{quote.itemCount!==1?'s':''}</span>
      </header>

      {/* Tier badge with progress to next tier */}
      <div className={`rounded-md p-3 mb-4 ${
        quote.appliedTier.discountPct > 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-neutral-50'
      }`}>
        <div className="flex items-baseline justify-between mb-1">
          <span className="font-semibold text-sm">{quote.appliedTier.name} tier</span>
          {quote.appliedTier.discountPct > 0 && (
            <span className="font-mono text-emerald-700 font-semibold">âˆ’{quote.appliedTier.discountPct}%</span>
          )}
        </div>
        {nextTierGap && (
          <p className="text-xs text-neutral-600 mt-2">
            Add <b>{nextTierGap.skillsNeeded} more skill{nextTierGap.skillsNeeded>1?'s':''}</b> to unlock
            <b> {nextTierGap.nextDiscount}% off</b> ({nextTierGap.nextName} tier).
          </p>
        )}
      </div>

      {/* Per-skill breakdown showing before/after */}
      <ul className="space-y-2 mb-4 text-sm">
        {quote.perSkillEffective.map(s => (
          <li key={s.skillId} className="flex items-baseline justify-between">
            <span className="font-mono text-xs text-neutral-700 truncate">{s.skillId}</span>
            <span className="font-mono">
              {s.before !== s.after && (
                <span className="text-neutral-400 line-through mr-2">HK${s.before}</span>
              )}
              <span>HK${s.after}</span>
            </span>
          </li>
        ))}
      </ul>

      {/* Totals */}
      <div className="border-t pt-3 space-y-1.5 text-sm">
        <Row label="Subtotal"        value={`HK$${quote.subtotalMonthly.toLocaleString()}`} />
        {quote.discountMonthly > 0 && (
          <Row label={`Bundle discount (${quote.appliedTier.discountPct}%)`}
               value={`âˆ’HK$${quote.discountMonthly.toLocaleString()}`}
               accent="emerald" />
        )}
        <Row label="Monthly total"   value={`HK$${quote.totalMonthly.toLocaleString()}`} bold />
        {quote.savingsAnnual > 0 && (
          <p className="text-xs text-emerald-700 mt-2">
            âœ“ Saves HK${quote.savingsAnnual.toLocaleString()} per year vs individual subscriptions
          </p>
        )}
      </div>

      {/* Bundle perks */}
      {quote.appliedTier.perks.length > 0 && (
        <ul className="mt-4 pt-3 border-t space-y-1.5 text-xs text-neutral-700">
          {quote.appliedTier.perks.map(p => (
            <li key={p} className="flex gap-2"><span className="text-emerald-600">âœ“</span><span>{p}</span></li>
          ))}
        </ul>
      )}

      <button onClick={()=>onCheckout(quote)} disabled={items.length===0}
        className="w-full mt-4 py-3 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
        Review {quote.itemCount} contract{quote.itemCount!==1?'s':''} & checkout â†’
      </button>
      <p className="text-xs text-neutral-500 mt-2 text-center">
        SLA terms remain individual per skill. Billing aggregates into one invoice.
      </p>
    </aside>
  );
}

function Row({ label, value, bold, accent }:{ label: string; value: string; bold?: boolean; accent?: string }) {
  return (
    <div className="flex justify-between">
      <span className={accent === 'emerald' ? 'text-emerald-700' : 'text-neutral-600'}>{label}</span>
      <span className={`font-mono ${bold?'font-bold':''} ${accent === 'emerald' ? 'text-emerald-700' : ''}`}>{value}</span>
    </div>
  );
}

function nextTierThreshold(currentCount: number) {
  if (currentCount >= 8) return null;
  if (currentCount < 3)  return { skillsNeeded: 3 - currentCount, nextDiscount: 15, nextName: 'Portfolio' };
  if (currentCount < 5)  return { skillsNeeded: 5 - currentCount, nextDiscount: 22, nextName: 'Enterprise' };
  return { skillsNeeded: 8 - currentCount, nextDiscount: 30, nextName: 'Strategic' };
}