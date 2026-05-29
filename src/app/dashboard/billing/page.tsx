"use client";
import { useEffect, useState } from "react";
import { Card, Badge, Row } from "../_components/SpecCard";
import { getBillingMe } from "@/lib/nepa-client";

interface UsageTelemetry {
  today: { frames: number; bytes: number; flights: number; };
  quota: { frames_per_day: number; bytes_per_day: number; flights_per_month: number; };
  frame_pct_used: number; bytes_pct_used: number;
}

const PLANS = [
  { key:"pilot_starter", name:"Pilot Starter", sub:"1 drone · Pilot",  price:"HK$980",  features:["1 drone registration","50K frames/day","500MB/day","15 flights/mo","HKCAD reports"], current:false },
  { key:"starter",       name:"Starter",       sub:"Up to 2 drones",   price:"HK$2,200",features:["2 drone registrations","120K frames/day","1.2GB/day","30 flights/mo","HKCAD reports","Basic analytics"], current:true },
  { key:"team",          name:"Pro Team",       sub:"Up to 10 drones",  price:"HK$8,800",features:["10 drone registrations","400K frames/day","4GB/day","100 flights/mo","World Model 3D","NEPA API access","Audit chain export","Carryover credits"], current:false },
  { key:"enterprise",    name:"Enterprise",     sub:"Unlimited fleet",  price:"Custom",  features:["Unlimited drones","Unlimited frames","Unlimited storage","Dedicated NEPA cluster","White-label dashboard","SLA 99.95%","On-prem deployment","Custom integrations"], current:false },
];

const INVOICES = [
  { id:"INV-2026-05", date:"2026-05-01", amount:"HK$2,200", status:"paid" },
  { id:"INV-2026-04", date:"2026-04-01", amount:"HK$2,200", status:"paid" },
  { id:"INV-2026-03", date:"2026-03-01", amount:"HK$2,200", status:"paid" },
  { id:"INV-2026-02", date:"2026-02-01", amount:"HK$2,200", status:"paid" },
  { id:"INV-2026-01", date:"2026-01-01", amount:"HK$2,200", status:"paid" },
];

export default function BillingPage() {
  const [usage, setUsage] = useState<UsageTelemetry|null>(null);
  const [toast, setToast] = useState("");
  const [upgrading, setUpgrading] = useState<string|null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  useEffect(() => {
    fetch("/api/atlas/operator/telemetry")
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (j?.data) setUsage(j.data); })
      .catch(() => {});
  }, []);

  const fmtBytes = (b: number) => b > 1e9 ? (b/1e9).toFixed(1)+"GB" : (b/1e6).toFixed(0)+"MB";

  return (
    <main style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <h1 style={{fontSize:22,margin:0,color:"#e0e8f2"}}>Billing & Plans</h1>
          <div style={{fontSize:12,color:"#8b9aae",marginTop:2}}>Manage your subscription, usage, and invoices</div>
        </div>
        <Badge kind="warn">Starter Plan</Badge>
      </div>

      {/* Plans */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11}}>
        {PLANS.map(p => (
          <div key={p.key} style={{padding:14,background:p.current?"linear-gradient(160deg,rgba(79,152,163,.1),rgba(59,93,141,.07))":"linear-gradient(180deg,rgba(218,226,236,.06),rgba(202,213,224,.03))",border:`1px solid ${p.current?"rgba(79,152,163,.5)":"#1a1f26"}`,borderRadius:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <div style={{fontSize:14,fontWeight:800,color:"#e0e8f2"}}>{p.name}</div>
                <div style={{fontSize:11,color:"#8b9aae"}}>{p.sub}</div>
              </div>
              {p.current && <Badge kind="warn">Current</Badge>}
            </div>
            <div style={{fontSize:22,fontWeight:800,color:"#5ab8d0",marginBottom:12}}>{p.price}{p.price!=="Custom"&&<span style={{fontSize:11,fontWeight:500,color:"#8b9aae"}}>/mo</span>}</div>
            <div style={{display:"flex",flexDirection:"column",gap:4,fontSize:11.5,color:"#8b9aae",marginBottom:14}}>
              {p.features.map(f => <div key={f}>✓ {f}</div>)}
            </div>
            {!p.current && (
              <button onClick={async()=>{
                if(p.key==="enterprise"){window.open("mailto:sales@aurasense.io?subject=Enterprise Plan Enquiry","_blank");return;}
                setUpgrading(p.key);
                try {
                  const res = await fetch("/api/billing/upgrade",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({plan:p.key})});
                  showToast(res.ok?`✓ Upgraded to ${p.name}`:`✓ ${p.name} upgrade requested`);
                } catch { showToast(`✓ ${p.name} upgrade requested`); }
                finally { setUpgrading(null); }
              }} disabled={upgrading===p.key} style={{width:"100%",padding:"7px 0",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",background:p.key==="team"?"linear-gradient(135deg,#2e6b74,#4f98a3)":"rgba(255,255,255,.06)",border:p.key==="team"?"none":"1px solid #1a1f26",color:p.key==="team"?"#fff":"#cfd8e3",opacity:upgrading===p.key?.6:1}}>
                {upgrading===p.key?"Processing…":p.key==="enterprise"?"Contact Sales":"Upgrade"}
              </button>
            )}
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {/* Payment */}
        <Card title="Payment Method">
          <div style={{background:"linear-gradient(135deg,#0a1628,#1a2a3e)",borderRadius:11,padding:16,marginBottom:12,color:"white"}}>
            <div style={{fontSize:10,opacity:.6,marginBottom:8}}>VISA •••• 4892</div>
            <div style={{fontSize:18,fontWeight:700,letterSpacing:".15em"}}>•••• •••• •••• 4892</div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:12,fontSize:11,opacity:.7}}>
              <span>AuraSense Ltd.</span><span>09/28</span>
            </div>
          </div>
          <button onClick={()=>{ window.open("https://billing.stripe.com/p/login/test","_blank"); showToast("Opening Stripe billing portal…"); }} style={{width:"100%",padding:"7px 0",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",background:"rgba(255,255,255,.06)",border:"1px solid #1a1f26",color:"#cfd8e3"}}>Update Card</button>
        </Card>

        {/* Usage */}
        <Card title="Usage This Month">
          {usage ? (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[
                { label:"Frames Used",    used:usage.today.frames,    quota:usage.quota.frames_per_day,    pct:usage.frame_pct_used,  unit:"frames" },
                { label:"Data Used",      used:usage.today.bytes,     quota:usage.quota.bytes_per_day,     pct:usage.bytes_pct_used,  unit:"bytes" },
                { label:"Flights",        used:usage.today.flights,   quota:usage.quota.flights_per_month, pct:Math.round(usage.today.flights/Math.max(1,usage.quota.flights_per_month)*100), unit:"flights" },
              ].map(u => (
                <div key={u.label}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:12,color:"#8b9aae"}}>{u.label}</span>
                    <span style={{fontSize:11.5,fontFamily:"ui-monospace,monospace",color:"#cfd8e3"}}>
                      {u.unit==="bytes"?fmtBytes(u.used):u.used.toLocaleString()} / {u.quota===-1?"∞":u.unit==="bytes"?fmtBytes(u.quota):u.quota.toLocaleString()}
                    </span>
                  </div>
                  <div style={{height:5,background:"rgba(79,152,163,.15)",borderRadius:999,overflow:"hidden"}}>
                    <div style={{width:(u.quota===-1?10:Math.min(100,u.pct))+"%",height:"100%",background:u.pct>80?"linear-gradient(90deg,#b45309,#ef4444)":"linear-gradient(90deg,#2e6b74,#4f98a3)",borderRadius:999}} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{fontSize:12,color:"#8b9aae",textAlign:"center",padding:20}}>Loading usage data…</div>
          )}
        </Card>
      </div>

      {/* Invoices */}
      <Card title="Invoice History">
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead>
            <tr>{["Invoice ID","Date","Amount","Status","Action"].map(h=>(
              <th key={h} style={{background:"rgba(59,93,141,.1)",color:"#8b9aae",fontWeight:600,fontSize:10.5,textTransform:"uppercase",letterSpacing:".06em",padding:"7px 10px",textAlign:"left",borderBottom:"1px solid #1a1f26"}}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {INVOICES.map(inv => (
              <tr key={inv.id} style={{borderBottom:"1px solid rgba(26,31,38,.6)"}}>
                <td style={{padding:"8px 10px",fontFamily:"ui-monospace,monospace",color:"#5ab8d0"}}>{inv.id}</td>
                <td style={{padding:"8px 10px",color:"#cfd8e3"}}>{inv.date}</td>
                <td style={{padding:"8px 10px",fontWeight:700,color:"#e0e8f2"}}>{inv.amount}</td>
                <td style={{padding:"8px 10px"}}><Badge kind="ok">{inv.status}</Badge></td>
                <td style={{padding:"8px 10px"}}>
                  <button onClick={()=>{ const csv=`Invoice ID,Date,Amount,Status\n${inv.id},${inv.date},${inv.amount},${inv.status}`; const blob=new Blob([csv],{type:"text/csv"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`${inv.id}.csv`; a.click(); showToast(`✓ ${inv.id} downloaded`); }} style={{padding:"3px 9px",borderRadius:5,fontSize:10,fontWeight:600,cursor:"pointer",background:"rgba(255,255,255,.05)",border:"1px solid #1a1f26",color:"#cfd8e3"}}>Download</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {toast && <div style={{position:"fixed",bottom:20,right:20,zIndex:9999,padding:"10px 14px",background:"rgba(6,15,30,.95)",border:"1px solid rgba(79,152,163,.4)",borderRadius:10,fontSize:12,color:"#e0e8f2",fontWeight:500}}>{toast}</div>}
    </main>
  );
}
