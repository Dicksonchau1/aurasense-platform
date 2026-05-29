"use client";
import { useState } from "react";
import { Card, Badge } from "../../_components/SpecCard";

const ACTIONS = [
  { id:"SA-001", name:"Precision Hover",       desc:"Hold position at current coordinates for operator inspection.",  risk:"low",   status:"approved" },
  { id:"SA-002", name:"Facade Scan Pass",       desc:"Execute single-pass facade scan at current standoff distance.", risk:"low",   status:"approved" },
  { id:"SA-003", name:"Thermal Overlay Sweep",  desc:"Activate FLIR and run thermal scan of target zone.",           risk:"low",   status:"pending"  },
  { id:"SA-004", name:"Emergency RTH",          desc:"Immediate return-to-home at maximum safe speed.",              risk:"medium",status:"approved" },
  { id:"SA-005", name:"Forced Landing",         desc:"Emergency descent and landing at current position.",           risk:"high",  status:"pending"  },
  { id:"SA-006", name:"Perimeter Patrol",       desc:"Autonomous perimeter patrol of assigned zone.",                risk:"medium",status:"approved" },
  { id:"SA-007", name:"Defect Annotation",      desc:"Mark and annotate detected defect with geo-tag.",              risk:"low",   status:"approved" },
  { id:"SA-008", name:"Multi-Drone Handoff",    desc:"Transfer mission to backup drone NERM-A2.",                   risk:"high",  status:"pending"  },
];

const RISK_COLOR: Record<string,string> = { low:"#22c55e", medium:"#f59e0b", high:"#ef4444" };

export default function SupervisedTab() {
  const [actions, setActions] = useState(ACTIONS);
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const approve = (id: string) => {
    setActions(a => a.map(x => x.id === id ? {...x, status:"approved"} : x));
    showToast(`Action ${id} approved`);
  };
  const reject = (id: string) => {
    setActions(a => a.map(x => x.id === id ? {...x, status:"rejected"} : x));
    showToast(`Action ${id} rejected`);
  };

  return (
    <div>
      <Card title="Supervised Actions">
        <p style={{fontSize:12,color:"#8b9aae",marginBottom:12}}>All actions require operator confirmation before dispatch.</p>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {actions.map(a => (
            <div key={a.id} style={{padding:"10px 12px",background:"rgba(255,255,255,.03)",border:"1px solid #1a1f26",borderRadius:9,display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:RISK_COLOR[a.risk],flexShrink:0}} />
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                  <span style={{fontSize:12.5,fontWeight:700,color:"#e0e8f2"}}>{a.name}</span>
                  <span style={{fontFamily:"ui-monospace,monospace",fontSize:10,color:"#5ab8d0"}}>{a.id}</span>
                  <Badge kind={a.risk==="low"?"ok":a.risk==="medium"?"warn":"danger"}>{a.risk}</Badge>
                </div>
                <div style={{fontSize:11.5,color:"#8b9aae"}}>{a.desc}</div>
              </div>
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                {a.status === "pending" ? (
                  <>
                    <button onClick={()=>approve(a.id)} style={btnOk}>Approve</button>
                    <button onClick={()=>reject(a.id)} style={btnDn}>Reject</button>
                  </>
                ) : (
                  <Badge kind={a.status==="approved"?"ok":"danger"}>{a.status}</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:8,marginTop:14}}>
          <button onClick={()=>{setActions(a=>a.map(x=>({...x,status:"approved"})));showToast("All actions dispatched");}} style={btnP}>Dispatch Approved</button>
          <button onClick={()=>{setActions(a=>a.map(x=>x.status==="pending"?{...x,status:"pending"}:x));showToast("Queue cleared");}} style={btnG}>Clear Queue</button>
        </div>
      </Card>
      {toast && <div style={{position:"fixed",bottom:20,right:20,zIndex:9999,padding:"10px 14px",background:"rgba(6,15,30,.95)",border:"1px solid rgba(79,152,163,.4)",borderRadius:10,fontSize:12,color:"#e0e8f2",fontWeight:500}}>{toast}</div>}
    </div>
  );
}
const btnBase: React.CSSProperties = {padding:"5px 12px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",border:"none"};
const btnP: React.CSSProperties = {...btnBase,background:"linear-gradient(135deg,#3b5d8d,#4f98a3)",color:"#fff"};
const btnG: React.CSSProperties = {...btnBase,background:"rgba(255,255,255,.06)",border:"1px solid #1a1f26",color:"#cfd8e3"};
const btnOk: React.CSSProperties = {...btnBase,background:"rgba(34,197,94,.14)",border:"1px solid rgba(34,197,94,.3)",color:"#22c55e"};
const btnDn: React.CSSProperties = {...btnBase,background:"rgba(239,68,68,.14)",border:"1px solid rgba(239,68,68,.3)",color:"#ef4444"};
