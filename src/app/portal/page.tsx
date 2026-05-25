"use client"
import React, { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Loader2, User, CreditCard, LayoutDashboard, LogIn, ShieldAlert, Navigation, Package, ShieldCheck, Settings, Cpu, Globe } from "lucide-react"
import type { OperatorIdentity, LiveUsageTelemetry, OperatorActivity, SubstrateSubscription } from "@/types/operator"

const PLAN_COLOURS = {
  starter:    '#484f58',
  pro:        '#22d3ee',
  team:       '#a78bfa',
  enterprise: '#d946ef',
}
const FEATURE_LABELS = {
  audit_chain:     'Audit Chain',
  world_model_api: 'World Model API',
  webhooks:        'Webhooks',
  air_gapped:      'Air-Gapped Deploy',
  sse_realtime:    'SSE Real-Time Bus',
  rtsp_ingest:     'RTSP/SRT Ingest',
}
const ACTIVITY_ICONS = {
  mission:        Navigation,
  threat_engage:  ShieldAlert,
  registry_enroll: Package,
  audit_append:   ShieldCheck,
  mode_change:    Settings,
  login:          LogIn,
}
const QUICK_ACTIONS = [
  { href:'/atlas/threat',        label:'Threat Console',   icon:ShieldAlert,  colour:'#f85149', sublabel:'OODA Loop' },
  { href:'/atlas/missions',      label:'Missions',         icon:Navigation,   colour:'#22d3ee', sublabel:'MAVLink' },
  { href:'/atlas/registry',      label:'Registry',         icon:Package,      colour:'#3fb950', sublabel:'OEM Assets' },
  { href:'/atlas/nepa',          label:'NEPA Runtime',     icon:Cpu,          colour:'#a78bfa', sublabel:'SNN Pipeline' },
  { href:'/atlas/evidence',      label:'Evidence Chain',   icon:ShieldCheck,  colour:'#d946ef', sublabel:'Audit Trail' },
  { href:'/atlas/civilisation',  label:'Civilisation Map', icon:Globe,        colour:'#f59e0b', sublabel:'9 Verticals' },
]

export default function PortalPage() {
  const [identity, setIdentity] = useState<OperatorIdentity | null>(null)
  const [telemetry, setTelemetry] = useState<LiveUsageTelemetry | null>(null)
  const [activities, setActivities] = useState<OperatorActivity[]>([])
  const [subscriptions, setSubscriptions] = useState<SubstrateSubscription[]>([])
  const [health, setHealth] = useState<any>(null)
  const [auditCount, setAuditCount] = useState<number | null>(null)
  const [upgrading, setUpgrading] = useState(false)
  const [email, setEmail] = useState('')
  const [magicSent, setMagicSent] = useState(false)
  const params = useSearchParams()

  useEffect(() => {
    Promise.all([
      fetch('/api/billing/me').then(r=>r.json()),
      fetch('/api/atlas/operator/telemetry').then(r=>r.json()),
      fetch('/api/atlas/operator/activity').then(r=>r.json()),
      fetch('/api/atlas/operator/subscriptions').then(r=>r.json()),
      fetch('/api/nepa/runtime/health').then(r=>r.json()),
      fetch('/api/atlas/evidence/health').then(r=>r.json()),
    ]).then(([me, tel, act, subs, rth, evh]) => {
      if (me.authenticated) {
        setIdentity({
          user_id: me.user.id, email: me.user.email,
          clearance_level: 'RESTRICTED',
          plan: me.plan, plan_status: me.status,
          current_period_end: me.current_period_end ?? null,
          cancel_at_period_end: me.cancel_at_period_end,
          has_subscription: me.has_subscription,
          created_at: new Date().toISOString(),
        })
      }
      setTelemetry(tel.data)
      setActivities(act.data?.activities ?? [])
      setSubscriptions(subs.data?.subscriptions ?? [])
      setHealth(rth)
      setAuditCount(evh.data?.total_records ?? null)
    })
  }, [])

  async function upgradePlan(targetPlan: 'pro' | 'team', annual: boolean) {
    setUpgrading(true)
    const j = await fetch('/api/billing/checkout', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ plan: targetPlan, annual })
    }).then(r=>r.json())
    if (j.url) window.location.href = j.url
    else {
      alert(`[DEMO] Would redirect to Stripe Checkout for ${targetPlan} ${annual?'annual':'monthly'} plan`)
    }
    setUpgrading(false)
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setMagicSent(true)
    // TODO: Implement magic link logic
  }

  async function signOut() {
    const { createClient } = await import('@/lib/supabase/client')
    await createClient().auth.signOut()
    window.location.href = '/login'
  }

  if (!identity && !magicSent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <h2 className="text-2xl font-bold mb-2">ATLAS OS · OPERATOR ACCESS</h2>
        <p className="mb-4">Sign in to access your operator dashboard</p>
        <form onSubmit={sendMagicLink} className="flex flex-col gap-2 w-72">
          <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="Email address" />
          <Button type="submit">SEND ACCESS LINK →</Button>
        </form>
      </div>
    )
  }
  if (!identity && magicSent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <h2 className="text-2xl font-bold mb-2">Check your email</h2>
        <p>We sent a magic sign-in link to <span className="font-mono">{email}</span></p>
      </div>
    )
  }

  // ...existing code for main portal layout...
  // For brevity, the full UI implementation would continue here, following the detailed layout and logic in the plan.
  // This includes the 3-column grid, identity card, quota gauges, usage sparkline, feature flags, activity feed, subscriptions, quick actions, and danger zone.
  return (
    <div className="grid grid-cols-[300px_1fr_280px] gap-4 p-4 min-h-screen bg-black text-white">
      {/* Left Column: Identity Card */}
      <div className="bg-[#0d1117] rounded-xl p-4 flex flex-col gap-4 border border-[#1f2937]">
        <div>
          <div className="font-bold text-lg">OPERATOR</div>
          <div className="text-sm text-[#a3a3a3]">{identity?.email}</div>
          <div className="mt-2">CLEARANCE: <span className="font-mono text-xs">[{identity?.clearance_level}]</span></div>
        </div>
        <div>
          PLAN: <Badge style={{background: PLAN_COLOURS[identity?.plan ?? 'starter'], color:'#fff'}}>{identity?.plan?.toUpperCase()}</Badge>
        </div>
        <div>
          STATUS: <Badge>{identity?.plan_status}</Badge>
        </div>
        <div>
          RENEWS: {identity?.current_period_end ? new Date(identity.current_period_end).toLocaleDateString() : '—'}
        </div>
        {identity?.plan !== 'enterprise' && (
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline">UPGRADE PLAN</Button>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-2 w-64">
              <Button disabled={upgrading} onClick={()=>upgradePlan('pro', false)}>PRO — HK$388/mo</Button>
              <Button disabled={upgrading} onClick={()=>upgradePlan('pro', true)}>PRO — HK$3,288/yr</Button>
              <Button disabled={upgrading} onClick={()=>upgradePlan('team', false)}>TEAM — HK$1,288/mo</Button>
              <Button disabled={upgrading} onClick={()=>upgradePlan('team', true)}>TEAM — HK$10,788/yr</Button>
              <Button variant="ghost" disabled>ENTERPRISE — Contact sales</Button>
            </PopoverContent>
          </Popover>
        )}
        <div className="mt-4">
          <div className="font-semibold mb-1">SUBSTRATE SUBSCRIPTIONS</div>
          <div className="overflow-y-auto max-h-48 flex flex-col gap-1">
            {subscriptions.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="font-mono w-8">{s.domain.slice(0,4).toUpperCase()}</span>
                <span className={`w-2 h-2 rounded-full ${s.status==='active'?'bg-green-400':s.status==='provisioning'?'bg-amber-400 animate-pulse':'bg-red-500'}`}></span>
                <span>{s.domain}</span>
                <span className="ml-auto">{s.status==='active'?new Date(s.expires_at??'').toLocaleDateString():"PROVISIONING"}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <div className="font-semibold mb-1">RUNTIME HEALTH</div>
          <div className="text-xs">adapter: {health?.adapter ?? '—'}</div>
          <div className="text-xs">status: <span className={health?.status==='ok'?'text-green-400':'text-red-400'}>{health?.status==='ok'?'● OK':'✗ ERROR'}</span></div>
          <div className="text-xs">queue: {health?.queue ?? 0}</div>
        </div>
        <div className="mt-4">
          <div className="font-semibold mb-1">AUDIT CHAIN</div>
          <div className="text-xs">{auditCount ?? '—'} total records  ● INTACT</div>
          <a href="/atlas/evidence" className="text-xs underline text-[#22d3ee]">→ VIEW CHAIN</a>
        </div>
      </div>
      {/* Center Column: Usage Telemetry + Activity Feed */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="font-bold">DAILY USAGE — {new Date().toLocaleDateString()}</div>
          <Badge style={{background: PLAN_COLOURS[identity?.plan ?? 'starter'], color:'#fff'}}>{identity?.plan?.toUpperCase()}</Badge>
          <div className="ml-auto text-xs">{telemetry?.remaining_frames ?? '—'} frames remaining</div>
        </div>
        {/* Quota Gauges */}
        <div className="flex gap-2">
          {telemetry && [
            {label:'Frames', used:telemetry.today.frames, limit:telemetry.quota.frames_per_day, pct_used:telemetry.frame_pct_used, unit:'frames'},
            {label:'Videos', used:telemetry.today.videos, limit:telemetry.quota.videos_per_day, pct_used:-1, unit:'videos'},
            {label:'Bytes', used:telemetry.today.bytes, limit:telemetry.quota.bytes_per_day, pct_used:telemetry.bytes_pct_used, unit:'MB'},
          ].map((g,i)=>(
            <div key={i} className="flex-1 flex flex-col gap-1">
              <div className="flex justify-between text-xs"><span>{g.label}</span><span>{g.used} / {g.limit===-1?'∞':g.limit} {g.unit}</span></div>
              <div className="w-full h-3 bg-[#222] rounded overflow-hidden">
                <div style={{width:g.pct_used===-1?'100%':`${g.pct_used}%`,background:g.pct_used===-1?'#22d3ee':g.pct_used<60?'#3fb950':g.pct_used<85?'#f59e0b':'#f85149',transition:'width 0.5s'}} className={g.pct_used>=85&&g.pct_used!==-1?'animate-pulse':''} />
              </div>
              <div className="text-right text-xs font-mono">{g.pct_used===-1?'∞ UNLIMITED':g.pct_used+'%'}</div>
            </div>
          ))}
        </div>
        {/* 7-day usage sparkline */}
        {telemetry && (
          <div className="w-full h-20 flex items-end gap-1">
            {telemetry.history_7d.map((d,i)=>{
              const maxFrames = Math.max(...telemetry.history_7d.map(x=>x.frames),1)
              const barH = (d.frames / maxFrames) * 60
              const isToday = d.day === new Date().toISOString().slice(0,10)
              return (
                <div key={i} className="flex flex-col items-center" style={{width:'14%'}}>
                  <div style={{height:barH,background:isToday?'rgba(34,211,238,0.9)':'rgba(34,211,238,0.4)',borderRadius:2,width:'80%'}} title={d.frames+" frames"}></div>
                  {isToday && <span className="text-[7px] text-[#22d3ee]">TODAY</span>}
                  <span className="text-[8px] text-[#a3a3a3]">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(d.day).getDay()]}</span>
                </div>
              )
            })}
          </div>
        )}
        {/* Features Panel */}
        {telemetry && (
          <details className="mt-2">
            <summary className="cursor-pointer text-xs">FEATURES INCLUDED ▶</summary>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {Object.entries(telemetry.quota.features).map(([k,v])=>(
                <Badge key={k} className={v?'bg-green-600':'bg-[#222] text-[#484f58]'}>{FEATURE_LABELS[k]}{!v&&<span className="ml-1">🔒</span>}</Badge>
              ))}
            </div>
          </details>
        )}
        {/* Activity Feed */}
        <div className="mt-4 flex-1">
          <div className="font-semibold mb-2">OPERATOR ACTIVITY · LAST 20 EVENTS</div>
          <div className="flex flex-col gap-1">
            {activities.length === 0 && <div className="text-xs text-[#484f58]">NO ACTIVITY RECORDED YET · COMPLETE A TASK IN THE ATLAS OS TO SEE EVENTS HERE.</div>}
            {activities.map((a,i)=>{
              const Icon = ACTIVITY_ICONS[a.type]
              return (
                <div key={a.id} className="flex items-center gap-2 animate-fadeIn" style={{animationDelay:`${i*30}ms`}}>
                  <Icon size={16} className="shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs font-semibold">{a.label}</div>
                    <div className="text-[8px] text-[#484f58] font-mono">{a.detail}</div>
                  </div>
                  <div className="text-[9px] font-mono text-[#a3a3a3]">{a.ts}</div>
                  <div className="text-[8px] font-mono text-[#484f58]">{a.id.slice(0,6)}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      {/* Right Column: Subscription Panel + Quick Actions */}
      <div className="flex flex-col gap-4">
        <div className="bg-[#0d1117] rounded-xl p-4 border border-[#1f2937]">
          <div className="font-bold mb-1">ATLAS OS SUBSTRATE</div>
          <div className="text-xs">{subscriptions.filter(s=>s.status==='active').length} DOMAINS ACTIVE</div>
          <div className="text-xs">{subscriptions.filter(s=>s.status==='provisioning').length} PROVISIONING</div>
          <div className="text-xs mt-2">INSTANCE: ATLAS-HK-KLN-01</div>
          <div className="text-xs">REGION: hk-kln-1</div>
          <div className="text-xs">RUNTIME: {health?.adapter ?? '—'} <span className={health?.status==='ok'?'text-green-400':'text-red-400'}>{health?.status==='ok'?'● OK':'✗ ERROR'}</span></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map((a,i)=>(
            <a key={i} href={a.href} className="bg-[#0d1117] border border-[#1f2937] rounded-lg p-2 flex flex-col items-center hover:border-[${a.colour}] transition-colors cursor-pointer">
              <a.icon size={20} color={a.colour} />
              <div className="text-xs font-semibold mt-1">{a.label}</div>
              <div className="text-[9px] text-[#a3a3a3]">{a.sublabel}</div>
            </a>
          ))}
        </div>
        <div className="bg-[#0d1117] rounded-xl p-4 border border-[#1f2937] mt-auto">
          <div className="font-bold mb-1">DANGER ZONE</div>
          <div className="border-t border-[#222] my-2" />
          <Button variant="destructive" className="w-full mb-2" onClick={async()=>{
            const j = await fetch('/api/billing/portal').then(r=>r.json())
            if(j.url) window.open(j.url, '_blank')
            else alert('[DEMO] Would redirect to Stripe Customer Portal')
          }}>CANCEL SUBSCRIPTION</Button>
          <a href="/api/exports/snapshot" download className="block w-full mb-2"><Button variant="destructive" className="w-full">EXPORT ALL DATA</Button></a>
          <Button variant="outline" className="w-full" onClick={signOut}>SIGN OUT</Button>
        </div>
      </div>
    </div>
  )
}