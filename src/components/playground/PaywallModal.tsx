'use client'

import { useState } from 'react'
import type { NepaBlockKey } from '@/lib/playground-types'
import { BLOCK_LABELS } from '@/lib/playground-types'

interface Props {
  open: boolean
  reasonBlock?: NepaBlockKey | null
  onClose: () => void
}

export function PaywallModal({ open, reasonBlock, onClose }: Props) {
  const [pending, setPending] = useState(false)

  if (!open) return null

  const upgrade = async () => {
    setPending(true)
    try {
      const r = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ plan: 'pro', returnTo: '/playground' }),
      })
      const j = (await r.json().catch(() => ({}))) as { url?: string }
      if (j.url) {
        window.location.href = j.url
        return
      }
    } catch {
      /* fall through to error state */
    }
    setPending(false)
  }

  return (
    <div
      role="dialog"
      aria-modal
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[min(440px,92vw)] rounded-xl border border-white/10 bg-[#0d1828] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-400">Upgrade required</p>
        <h2 className="mt-3 text-2xl font-bold text-white">
          {reasonBlock ? `${BLOCK_LABELS[reasonBlock]} is a Pro feature` : 'This is a Pro feature'}
        </h2>
        <p className="mt-3 text-sm text-white/60">
          Unlock the full NEPA block chain — polygon zones, IMU fusion, events-only outputs, and unlimited
          stream minutes — on the Rehearse Pro plan.
        </p>
        <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-white">Rehearse Pro</span>
            <span className="text-2xl font-bold text-emerald-300">HK$108<span className="text-xs text-white/50">/mo</span></span>
          </div>
          <p className="mt-1 text-xs text-white/50">7-day free trial · cancel anytime</p>
        </div>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={upgrade}
            disabled={pending}
            className="flex-1 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-[#062017] hover:bg-emerald-400 disabled:opacity-60"
          >
            {pending ? 'Redirecting…' : 'Start free trial'}
          </button>
        </div>
      </div>
    </div>
  )
}
