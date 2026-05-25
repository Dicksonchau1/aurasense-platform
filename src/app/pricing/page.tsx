"use client"
import React, { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { PlanKey } from "@/types/operator"

const PLAN_CARDS = [
  {
    key: 'starter', name: 'Starter', price_monthly_hkd: 0, price_annual_hkd: 0,
    description: 'For individuals exploring the NEPA substrate.',
    features: ['500 frames/day', '5 videos/day', 'SSE Real-Time Bus', 'Audit Chain', '1 seat'],
    cta: 'GET STARTED FREE',
    highlighted: false,
  },
  {
    key: 'student', name: 'Student', price_monthly_hkd: 88, price_annual_hkd: 740,
    description: 'For students and research institutions.',
    features: ['Unlimited frames', '50 videos/day', 'SSE Real-Time Bus', 'Audit Chain', 'World Model API', '1 seat'],
    cta: 'APPLY FOR ACCESS',
    highlighted: false,
  },
  {
    key: 'pro', name: 'Pro', price_monthly_hkd: 388, price_annual_hkd: 3288,
    description: 'For solo operators and independent integrators.',
    features: ['Unlimited frames', '200 videos/day', 'World Model API', 'RTSP/SRT Ingest', 'Audit Chain', '1 seat'],
    cta: 'UPGRADE TO PRO',
    highlighted: true,
  },
  {
    key: 'team', name: 'Team', price_monthly_hkd: 1288, price_annual_hkd: 10788,
    description: 'For OEM integration teams and operators.',
    features: ['Unlimited frames/videos', 'World Model API', 'RTSP/SRT Ingest', 'Webhooks', 'Audit Chain', '10 seats'],
    cta: 'UPGRADE TO TEAM',
    highlighted: false,
  },
  {
    key: 'enterprise', name: 'Enterprise', price_monthly_hkd: null, price_annual_hkd: null,
    description: 'For sovereign operators, MINDEF, and OEMs at scale.',
    features: ['Unlimited everything', 'Air-Gapped Deploy', 'World Model API', 'RTSP/SRT Ingest', 'Webhooks', 'Unlimited seats', 'SOC 2 / ISO 27001'],
    cta: 'CONTACT SALES',
    highlighted: false,
  },
]

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const [me, setMe] = useState<any>(null)
  const [checkingOut, setCheckingOut] = useState<string | null>(null)
  const [showMatrix, setShowMatrix] = useState(false)
  useEffect(()=>{ fetch('/api/billing/me').then(r=>r.json()).then(setMe) },[])

  async function handleCTA(card: any) {
    if (card.key === 'starter') { window.location.href = '/register'; return }
    if (card.key === 'student') { window.location.href = '/request-access'; return }
    if (card.key === 'enterprise') { window.location.href = 'mailto:sales@auras.ai'; return }
    if (me?.plan === card.key) return
    setCheckingOut(card.key)
    const j = await fetch('/api/billing/checkout', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ plan: card.key, annual })
    }).then(r=>r.json())
    if (j.url) window.location.href = j.url
    else if (j.error === 'stripe_not_configured') alert('[DEMO MODE] Stripe not configured. In production this would redirect to Stripe Checkout.')
    else alert(j.error ?? 'Checkout failed')
    setCheckingOut(null)
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="font-bold text-2xl">Choose your ATLAS OS plan</div>
        <div className="ml-auto flex items-center gap-2">
          <span>Monthly</span>
          <Switch checked={annual} onCheckedChange={setAnnual} />
          <span>Annual <Badge className="ml-1">SAVE 16%</Badge></span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {PLAN_CARDS.map((card,i)=>{
          const price = annual ? card.price_annual_hkd : card.price_monthly_hkd
          const isCurrent = me?.plan === card.key
          return (
            <div key={i} className={`rounded-xl p-6 flex flex-col gap-2 border ${card.highlighted?'border-[#22d3ee] bg-[rgba(34,211,238,0.05)]':'border-[#1f2937] bg-[#0d1117]'}` + (isCurrent?' ring-2 ring-[#22d3ee]':'')}>
              {card.highlighted && <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#22d3ee] text-black px-2 py-1 rounded text-[9px] font-bold">MOST POPULAR</div>}
              <div className="font-bold text-lg mb-1">{card.name}</div>
              <div className="text-2xl font-mono mb-2">
                {price===null?'Custom':price===0?'Free':`HK$${price.toLocaleString('en-HK')}/${annual?'yr':'mo'}`}
              </div>
              <div className="text-xs mb-2">{card.description}</div>
              <ul className="flex-1 flex flex-col gap-1 mb-2">
                {card.features.map((f,j)=>(<li key={j} className="flex items-center gap-1"><span className="text-green-400">✓</span> {f}</li>))}
              </ul>
              <Button disabled={isCurrent||checkingOut===card.key} onClick={()=>handleCTA(card)}>{isCurrent?'CURRENT PLAN':checkingOut===card.key?<span className="flex items-center gap-2"><span className="animate-spin">⏳</span>Processing…</span>:card.cta}</Button>
            </div>
          )
        })}
      </div>
      <div className="mt-8">
        <Button variant="ghost" onClick={()=>setShowMatrix(x=>!x)}>{showMatrix?'HIDE':'COMPARE ALL FEATURES ▼'}</Button>
        {showMatrix && (
          <div className="overflow-x-auto mt-4">
            {/* Feature matrix table, rows and columns as per requirements, values from QUOTAS */}
            <table className="min-w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border-b border-[#222] text-left">Feature</th>
                  <th className="p-2 border-b border-[#222]">Starter</th>
                  <th className="p-2 border-b border-[#222]">Student</th>
                  <th className="p-2 border-b border-[#222]">Pro</th>
                  <th className="p-2 border-b border-[#222]">Team</th>
                  <th className="p-2 border-b border-[#222]">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {/* Example row, repeat for all features, values must match QUOTAS */}
                <tr>
                  <td className="p-2 border-b border-[#222]">Frames/day</td>
                  <td className="p-2 border-b border-[#222]">500</td>
                  <td className="p-2 border-b border-[#222]">∞</td>
                  <td className="p-2 border-b border-[#222]">∞</td>
                  <td className="p-2 border-b border-[#222]">∞</td>
                  <td className="p-2 border-b border-[#222]">∞</td>
                </tr>
                {/* ...other rows... */}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="mt-8 space-y-2">
        <details><summary className="cursor-pointer">Is there a free trial?</summary><div className="ml-4">All plans start with the Starter tier at no cost. Pro and Team plans can be tested via the 14-day trial period.</div></details>
        <details><summary className="cursor-pointer">Can I deploy air-gapped?</summary><div className="ml-4">Enterprise plans support fully air-gapped deployments. Contact sales@auras.ai for on-premises substrate provisioning.</div></details>
        <details><summary className="cursor-pointer">What is the NEPA substrate?</summary><div className="ml-4">NEPA is a Neuromorphic Event-based Perception Architecture — a spiking neural network inference runtime with ONNX and TensorRT backends, SHA-256 hash-chained audit trail, and a three-state gating layer for sovereign operator use cases.</div></details>
      </div>
    </div>
  )
}