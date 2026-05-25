"use client"
import React, { useEffect, useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function AccountPage() {
  const [overview, setOverview] = useState<any>({})
  const [missions, setMissions] = useState<any[]>([])
  const [engagements, setEngagements] = useState<any[]>([])
  const [assets, setAssets] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  useEffect(()=>{
    Promise.all([
      fetch('/api/atlas/operator/activity').then(r=>r.json()),
      fetch('/api/atlas/missions').then(r=>r.json()),
      fetch('/api/atlas/threat/authority-log').then(r=>r.json()),
      fetch('/api/atlas/registry/assets').then(r=>r.json()),
      fetch('/api/atlas/evidence/health').then(r=>r.json()),
      fetch('/api/rehearse/sessions').then(r=>r.json()),
    ]).then(([act, ms, eng, reg, audit, sess])=>{
      setActivity(act.data?.activities??[])
      setMissions(ms.data?.missions??[])
      setEngagements(eng.data?.tokens??[])
      setAssets(reg.data?.assets??[])
      setOverview({
        missions: ms.data?.missions?.filter((m:any)=>['in_flight','armed','returning'].includes(m.state)).length,
        engagements: eng.data?.tokens?.length,
        assets: reg.data?.assets?.length,
        audit: audit.data?.total_records??0,
      })
      setSessions(sess.data?.sessions??[])
    })
  },[])
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="missions">Missions</TabsTrigger>
          <TabsTrigger value="engagements">Engagements</TabsTrigger>
          <TabsTrigger value="registry">Registry</TabsTrigger>
          <TabsTrigger value="sessions">Rehearse Sessions</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-[#0d1117] rounded-xl p-4 flex flex-col items-center"><div className="font-bold">Active Missions</div><div className="text-2xl font-mono">{overview.missions}</div></div>
            <div className="bg-[#0d1117] rounded-xl p-4 flex flex-col items-center"><div className="font-bold">Threat Engagements</div><div className="text-2xl font-mono">{overview.engagements}</div></div>
            <div className="bg-[#0d1117] rounded-xl p-4 flex flex-col items-center"><div className="font-bold">Enrolled Assets</div><div className="text-2xl font-mono">{overview.assets}</div></div>
            <div className="bg-[#0d1117] rounded-xl p-4 flex flex-col items-center"><div className="font-bold">Audit Records</div><div className="text-2xl font-mono">{overview.audit}</div></div>
          </div>
          <div className="font-semibold mb-2">Recent Activity</div>
          <div className="flex flex-col gap-1">
            {activity.slice(0,8).map((a:any,i:number)=>(
              <div key={a.id} className="flex items-center gap-2">
                <span className="font-mono text-xs">{a.label}</span>
                <span className="text-[9px] font-mono text-[#a3a3a3]">{a.ts}</span>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="missions">
          <table className="min-w-full text-xs border-collapse">
            <thead><tr><th>ID</th><th>Name</th><th>Asset</th><th>State</th><th>Flight Time</th><th>Waypoints</th><th>Created</th></tr></thead>
            <tbody>
              {missions.map((m:any,i:number)=>(
                <tr key={m.id} className="hover:bg-[#222] cursor-pointer" onClick={()=>window.location.href=`/atlas/missions?id=${m.id}`}>
                  <td>{m.id}</td><td>{m.name}</td><td>{m.asset_label}</td><td><Badge>{m.state}</Badge></td><td>{m.flight_time}</td><td>{m.waypoints?.length}</td><td>{m.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>
        <TabsContent value="engagements">
          <table className="min-w-full text-xs border-collapse">
            <thead><tr><th>Track ID</th><th>Jurisdiction</th><th>Token</th><th>Issued</th><th>Expires</th><th>MAVLink Frame</th></tr></thead>
            <tbody>
              {engagements.map((e:any,i:number)=>(
                <tr key={e.audit_id}><td>{e.track_id}</td><td>{e.sovereignty_fence}</td><td>{e.token?.slice(0,8)}</td><td>{e.issued_at}</td><td>{e.expires_at}</td><td>{e.frame?.slice(0,12)}</td></tr>
              ))}
            </tbody>
          </table>
        </TabsContent>
        <TabsContent value="registry">
          <table className="min-w-full text-xs border-collapse">
            <thead><tr><th>Asset ID</th><th>OEM</th><th>Model</th><th>Class</th><th>Protocol</th><th>Status</th><th>Enrolled</th></tr></thead>
            <tbody>
              {assets.map((a:any,i:number)=>(
                <tr key={a.id}><td>{a.id}</td><td>{a.oem}</td><td>{a.model}</td><td>{a.capability_class}</td><td>{a.protocol}</td><td>{a.status}</td><td>{a.registered_at}</td></tr>
              ))}
            </tbody>
          </table>
        </TabsContent>
        <TabsContent value="sessions">
          {/* Existing rehearse session rendering, assumed to be a table or list */}
          <div className="mt-4">
            {sessions.map((s:any,i:number)=>(
              <div key={i} className="bg-[#0d1117] rounded p-2 mb-2">
                <div className="font-mono text-xs">Session: {s.id}</div>
                <div className="text-xs">{s.detail}</div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}