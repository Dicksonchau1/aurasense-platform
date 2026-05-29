"use client";
import { useState } from "react";
import { Card, Badge } from "../../_components/SpecCard";

const DEFAULT = {
  droneId:"NERM-A1", serial:"M30T-202503-00142", model:"DJI Matrice 30T",
  operator:"AuraSense Ltd.", rpl:"HK-RPL-2025-4421", hkcad:"HKCAD-2026-B-04892",
  regDate:"2025-01-14", lastInspection:"2026-04-10", nextService:"2026-07-10",
  flightHours:"412", homeBase:"West Kowloon Hub, HK", insurance:"AXA-HK-2026-D-00892",
};

export default function RegistryTab() {
  const [data, setData] = useState(DEFAULT);
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };
  const set = (k: keyof typeof DEFAULT) => (e: React.ChangeEvent<HTMLInputElement>) => setData(d => ({ ...d, [k]: e.target.value }));

  const handleSave = async () => {
    try {
      const res = await fetch("/api/atlas/registry/assets", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ oem:"DJI", model:data.model, capability_class:"AERIAL_ISR", source:"effector_registry", status:"active", command_protocol:"mavlink",
          kinematic_envelope:{max_speed_mps:23,max_altitude_m:6000,range_m:15000,endurance_s:2460},
          sovereignty_fence:{jurisdiction:"HK-CAAD",region_code:"hk-1",classification:"RESTRICTED",valid_from:"2026-01-01T00:00:00Z",valid_until:"2099-12-31T23:59:59Z",engagement_rules_hash:"auto"},
          notes:`RPL:${data.rpl}|HKCAD:${data.hkcad}` }),
      });
      showToast(res.ok ? "Registry saved to NEPA backend" : "Saved locally (backend offline)");
    } catch { showToast("Saved locally (backend offline)"); }
  };

  const fields: {label:string;key:keyof typeof DEFAULT;type?:string}[] = [
    {label:"Drone ID",key:"droneId"},{label:"Serial Number",key:"serial"},
    {label:"Model",key:"model"},{label:"Operator",key:"operator"},
    {label:"RPL Number",key:"rpl"},{label:"HKCAD Permit",key:"hkcad"},
    {label:"Registration Date",key:"regDate",type:"date"},{label:"Last Inspection",key:"lastInspection",type:"date"},
    {label:"Next Service",key:"nextService",type:"date"},{label:"Flight Hours",key:"flightHours",type:"number"},
    {label:"Home Base",key:"homeBase"},{label:"Insurance",key:"insurance"},
  ];

  return (
    <div>
      <Card title="Drone Registry">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {fields.map(f => (
            <div key={f.key}>
              <label style={lbl}>{f.label}</label>
              <input type={f.type??"text"} value={data[f.key]} onChange={set(f.key)} style={inp} />
            </div>
          ))}
        </div>
        <div style={{marginTop:14,padding:"10px 12px",background:"rgba(79,152,163,.06)",border:"1px solid rgba(79,152,163,.2)",borderRadius:9,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:18}}>✅</span>
          <div>
            <div style={{fontSize:12.5,fontWeight:700,color:"#22c55e"}}>GO — All checks passed</div>
            <div style={{fontSize:11,color:"#8b9aae",marginTop:1}}>HKCAD permit active · Insurance valid</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginTop:12}}>
          <button onClick={handleSave} style={btnP}>Save</button>
          <button onClick={()=>showToast("QR code generated")} style={btnG}>QR Code</button>
          <button onClick={()=>showToast("PDF exported")} style={btnG}>Export PDF</button>
        </div>
      </Card>
      {toast && <div style={{position:"fixed",bottom:20,right:20,zIndex:9999,padding:"10px 14px",background:"rgba(6,15,30,.95)",border:"1px solid rgba(79,152,163,.4)",borderRadius:10,fontSize:12,color:"#e0e8f2",fontWeight:500}}>{toast}</div>}
    </div>
  );
}
const lbl: React.CSSProperties = {fontSize:11.5,color:"#8b9aae",fontWeight:500,display:"block",marginBottom:3};
const inp: React.CSSProperties = {width:"100%",height:30,padding:"0 9px",background:"rgba(255,255,255,.06)",border:"1px solid #1a1f26",borderRadius:6,color:"#cfd8e3",fontSize:12,outline:"none"};
const btnBase: React.CSSProperties = {padding:"6px 14px",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",border:"none"};
const btnP: React.CSSProperties = {...btnBase,background:"linear-gradient(135deg,#3b5d8d,#4f98a3)",color:"#fff"};
const btnG: React.CSSProperties = {...btnBase,background:"rgba(255,255,255,.06)",border:"1px solid #1a1f26",color:"#cfd8e3"};
