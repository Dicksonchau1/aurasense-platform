"use client";
import { useState } from "react";
import { Card, Badge, Row } from "../_components/SpecCard";

const API_KEYS_DEFAULT = [
  { id:"AK-001", name:"Production API Key",    key:"sk-aura-prod-••••••••••••4892", created:"2026-01-14", lastUsed:"2026-05-30", scope:"read:write" },
  { id:"AK-002", name:"Analytics Read-Only",   key:"sk-aura-ro-••••••••••••2341",   created:"2026-03-01", lastUsed:"2026-05-29", scope:"read" },
  { id:"AK-003", name:"Webhook Signing Secret", key:"whsec-••••••••••••••••••••••", created:"2026-02-15", lastUsed:"2026-05-30", scope:"webhook" },
];

const INTEGRATIONS = [
  { name:"Stripe Billing",       status:"connected", icon:"💳" },
  { name:"Supabase Database",    status:"connected", icon:"🗄" },
  { name:"HKCAD Portal",         status:"connected", icon:"🏛" },
  { name:"DJI FlightHub 2",      status:"connected", icon:"🚁" },
  { name:"Slack Notifications",  status:"disconnected", icon:"💬" },
  { name:"PagerDuty Alerts",     status:"disconnected", icon:"🔔" },
  { name:"AWS S3 Storage",       status:"connected", icon:"☁" },
  { name:"Mapbox Tiles",         status:"connected", icon:"🗺" },
];

const NOTIFICATIONS = [
  { label:"Low battery alerts",        enabled:true },
  { label:"Mission completion",        enabled:true },
  { label:"Defect detected",           enabled:true },
  { label:"Drone offline",             enabled:true },
  { label:"Calibration due",           enabled:false },
  { label:"Invoice generated",         enabled:true },
  { label:"API quota warning",         enabled:false },
  { label:"New skill available",       enabled:false },
];

export default function SettingsPage() {
  const [org, setOrg] = useState({ name:"AuraSense Ltd.", email:"ops@aurasense.hk", cadId:"AURA-OP-001", tz:"Asia/Hong_Kong (UTC+8)" });
  const [apiKeys, setApiKeys] = useState(API_KEYS_DEFAULT);
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const addKey = () => {
    const id = `AK-${String(apiKeys.length+1).padStart(3,"0")}`;
    setApiKeys(k => [...k, { id, name:"New API Key", key:`sk-aura-new-••••••••••••${Math.floor(Math.random()*9999)}`, created:new Date().toISOString().slice(0,10), lastUsed:"Never", scope:"read" }]);
    showToast("New API key generated");
  };

  return (
    <main style={{display:"flex",flexDirection:"column",gap:14}}>
      <div>
        <h1 style={{fontSize:22,margin:0,color:"#e0e8f2"}}>Settings</h1>
        <div style={{fontSize:12,color:"#8b9aae",marginTop:2}}>Organisation, API keys, integrations, and notifications</div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {/* API Keys */}
        <Card title="API Keys">
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
            {apiKeys.map(k => (
              <div key={k.id} style={{padding:"10px 12px",background:"rgba(255,255,255,.03)",border:"1px solid #1a1f26",borderRadius:9}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{fontSize:12.5,fontWeight:700,color:"#e0e8f2"}}>{k.name}</span>
                  <Badge kind="info">{k.scope}</Badge>
                </div>
                <div style={{fontFamily:"ui-monospace,monospace",fontSize:11,color:"#5ab8d0",marginBottom:4}}>{k.key}</div>
                <div style={{fontSize:10.5,color:"#8b9aae"}}>Created {k.created} · Last used {k.lastUsed}</div>
                <div style={{display:"flex",gap:6,marginTop:8}}>
                  <button onClick={()=>showToast("Key copied")} style={btnSm}>Copy</button>
                  <button onClick={()=>showToast("Key rotated")} style={btnSm}>Rotate</button>
                  <button onClick={()=>{setApiKeys(a=>a.filter(x=>x.id!==k.id));showToast("Key revoked");}} style={{...btnSm,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",color:"#ef4444"}}>Revoke</button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={addKey} style={btnP}>+ Generate Key</button>
        </Card>

        {/* Organisation */}
        <Card title="Organisation">
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[
              {label:"Organisation Name", key:"name" as const},
              {label:"Contact Email",     key:"email" as const},
              {label:"CAD Account ID",    key:"cadId" as const},
            ].map(f => (
              <div key={f.key}>
                <label style={lbl}>{f.label}</label>
                <input value={org[f.key]} onChange={e=>setOrg(o=>({...o,[f.key]:e.target.value}))} style={inp} />
              </div>
            ))}
            <div>
              <label style={lbl}>Time Zone</label>
              <select value={org.tz} onChange={e=>setOrg(o=>({...o,tz:e.target.value}))} style={inp}>
                <option>Asia/Hong_Kong (UTC+8)</option>
                <option>UTC</option>
                <option>Asia/Singapore</option>
                <option>Europe/London</option>
              </select>
            </div>
          </div>
          <button onClick={()=>showToast("Organisation settings saved")} style={{...btnP,marginTop:14}}>Save</button>
        </Card>

        {/* Integrations */}
        <Card title="Integrations">
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {integrations.map(i => (
              <div key={i.name} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 10px",background:"rgba(255,255,255,.03)",border:"1px solid #1a1f26",borderRadius:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:16}}>{i.icon}</span>
                  <span style={{fontSize:12.5,color:"#cfd8e3",fontWeight:500}}>{i.name}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <Badge kind={i.status==="connected"?"ok":"warn"}>{i.status}</Badge>
                  <button onClick={()=>{setIntegrations(x=>x.map(y=>y.name===i.name?{...y,status:y.status==="connected"?"disconnected":"connected"}:y));showToast(`${i.name} ${i.status==="connected"?"disconnected":"connected"}`);}} style={btnSm}>
                    {i.status==="connected"?"Disconnect":"Connect"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Notifications */}
        <Card title="Notifications">
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {notifications.map((n,i) => (
              <div key={n.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 9px",borderRadius:7,transition:"background .1s"}}
                onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,.03)")}
                onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                <span style={{fontSize:12.5,color:"#cfd8e3"}}>{n.label}</span>
                <div onClick={()=>setNotifications(x=>x.map((y,j)=>j===i?{...y,enabled:!y.enabled}:y))}
                  style={{width:34,height:18,borderRadius:999,background:n.enabled?"linear-gradient(90deg,#2e6b74,#4f98a3)":"rgba(90,122,168,.25)",border:`1px solid ${n.enabled?"transparent":"rgba(90,122,168,.3)"}`,position:"relative",cursor:"pointer",transition:"background .18s"}}>
                  <div style={{width:12,height:12,borderRadius:"50%",background:"white",position:"absolute",top:2,left:n.enabled?20:2,transition:"left .18s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Danger Zone */}
      <div style={{padding:16,background:"rgba(185,28,28,.04)",border:"1px solid rgba(185,28,28,.3)",borderRadius:12}}>
        <div style={{fontSize:14,fontWeight:700,color:"#ef4444",marginBottom:12}}>⚠ Danger Zone</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>showToast("Confirmation required")} style={{...btnBase,background:"rgba(185,28,28,.1)",border:"1px solid rgba(185,28,28,.25)",color:"#ef4444"}}>Delete All Data</button>
          <button onClick={()=>showToast("Account deactivated")} style={{...btnBase,background:"rgba(180,83,9,.1)",border:"1px solid rgba(180,83,9,.25)",color:"#f59e0b"}}>Deactivate Account</button>
          <button onClick={()=>showToast("Data export started")} style={btnG}>Export All Data</button>
        </div>
      </div>

      {toast && <div style={{position:"fixed",bottom:20,right:20,zIndex:9999,padding:"10px 14px",background:"rgba(6,15,30,.95)",border:"1px solid rgba(79,152,163,.4)",borderRadius:10,fontSize:12,color:"#e0e8f2",fontWeight:500}}>{toast}</div>}
    </main>
  );
}
const lbl: React.CSSProperties = {fontSize:11.5,color:"#8b9aae",fontWeight:500,display:"block",marginBottom:3};
const inp: React.CSSProperties = {width:"100%",height:30,padding:"0 9px",background:"rgba(255,255,255,.06)",border:"1px solid #1a1f26",borderRadius:6,color:"#cfd8e3",fontSize:12,outline:"none"};
const btnBase: React.CSSProperties = {padding:"6px 14px",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",border:"none"};
const btnP: React.CSSProperties = {...btnBase,background:"linear-gradient(135deg,#3b5d8d,#4f98a3)",color:"#fff"};
const btnG: React.CSSProperties = {...btnBase,background:"rgba(255,255,255,.06)",border:"1px solid #1a1f26",color:"#cfd8e3"};
const btnSm: React.CSSProperties = {padding:"3px 8px",borderRadius:5,fontSize:10,fontWeight:600,cursor:"pointer",background:"rgba(255,255,255,.05)",border:"1px solid #1a1f26",color:"#cfd8e3"};
