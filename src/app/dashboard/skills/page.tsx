"use client";
import { useEffect, useState } from "react";
import { Card, Badge } from "../_components/SpecCard";

interface Skill {
  id: string; name: string; category: string; version: string; status: string;
  description: string; author: string; price: string; tags: string[];
  params: Record<string,string>; deployedTo: string[];
}

const MOCK_SKILLS: Skill[] = [
  { id:"SK-001", name:"Facade Crack Detector",      category:"Vision",       version:"2.4.1", status:"active",   description:"STDP-powered crack detection on building facades using thermal + RGB fusion.", author:"AuraSense Core", price:"HK$480/mo", tags:["vision","thermal","defect"], params:{"confidence_threshold":"0.85","min_crack_width_mm":"0.5","thermal_delta_c":"2.0"}, deployedTo:["NERM-A1","NERM-B1"] },
  { id:"SK-002", name:"Thermal Anomaly Scanner",    category:"Thermal",      version:"1.8.0", status:"active",   description:"Detects thermal anomalies in electrical and mechanical systems.", author:"AuraSense Core", price:"HK$320/mo", tags:["thermal","anomaly","inspection"], params:{"temp_threshold_c":"45","scan_resolution":"high","alert_mode":"realtime"}, deployedTo:["NERM-A1"] },
  { id:"SK-003", name:"RTK Precision Mapper",       category:"Mapping",      version:"3.1.2", status:"active",   description:"High-precision photogrammetry mapping with RTK-corrected GCPs.", author:"AuraSense Core", price:"HK$560/mo", tags:["mapping","rtk","photogrammetry"], params:{"gsd_cm":"0.8","overlap_pct":"80","output_format":"geotiff"}, deployedTo:["NERM-D1"] },
  { id:"SK-004", name:"SLAM Navigator",             category:"Navigation",   version:"2.0.3", status:"active",   description:"Simultaneous localisation and mapping for GPS-denied environments.", author:"AuraSense Core", price:"HK$640/mo", tags:["slam","navigation","indoor"], params:{"map_resolution":"0.05","loop_closure":"enabled","imu_fusion":"true"}, deployedTo:["NERM-A3"] },
  { id:"SK-005", name:"Crowd Analytics Engine",     category:"Analytics",    version:"1.2.0", status:"beta",     description:"Real-time crowd density estimation and flow analysis.", author:"AuraSense Labs", price:"HK$720/mo", tags:["analytics","crowd","security"], params:{"detection_model":"yolov10","density_grid":"10x10","alert_threshold":"50"}, deployedTo:[] },
  { id:"SK-006", name:"Perimeter Guard",            category:"Security",     version:"2.2.0", status:"active",   description:"Autonomous perimeter monitoring with intrusion detection.", author:"AuraSense Core", price:"HK$880/mo", tags:["security","perimeter","autonomous"], params:{"patrol_interval_min":"15","alert_sensitivity":"high","night_mode":"auto"}, deployedTo:["NERM-C1"] },
  { id:"SK-007", name:"Structural Health Monitor",  category:"Inspection",   version:"1.5.1", status:"active",   description:"Continuous structural health monitoring using vibration and visual data.", author:"AuraSense Core", price:"HK$400/mo", tags:["inspection","structural","monitoring"], params:{"sample_rate_hz":"100","vibration_threshold":"0.02","report_interval":"daily"}, deployedTo:["NERM-A1","NERM-A2"] },
  { id:"SK-008", name:"Vegetation Index (NDVI)",    category:"Agriculture",  version:"1.0.2", status:"beta",     description:"NDVI analysis for vegetation health assessment.", author:"AuraSense Labs", price:"HK$280/mo", tags:["ndvi","agriculture","vegetation"], params:{"band_ratio":"NIR/RED","threshold":"0.3","output":"heatmap"}, deployedTo:[] },
  { id:"SK-009", name:"Emergency Response AI",      category:"Safety",       version:"3.0.0", status:"active",   description:"AI-powered emergency response coordination and triage.", author:"AuraSense Core", price:"HK$1,200/mo", tags:["emergency","safety","ai","coordination"], params:{"response_time_s":"30","priority_model":"severity","auto_dispatch":"true"}, deployedTo:["NERM-A1","NERM-A2","NERM-A3"] },
  { id:"SK-010", name:"LiDAR Point Cloud Processor",category:"3D Mapping",   version:"2.1.0", status:"active",   description:"Real-time LiDAR point cloud processing and 3D reconstruction.", author:"AuraSense Core", price:"HK$760/mo", tags:["lidar","3d","pointcloud"], params:{"voxel_size":"0.05","filter_noise":"true","output_format":"las"}, deployedTo:["NERM-D1"] },
  { id:"SK-011", name:"Wind Compensation AI",       category:"Flight",       version:"1.3.0", status:"active",   description:"Adaptive wind compensation for stable flight in adverse conditions.", author:"AuraSense Core", price:"HK$240/mo", tags:["flight","wind","stability"], params:{"max_wind_ms":"15","compensation_mode":"adaptive","pid_gain":"1.2"}, deployedTo:["NERM-A1","NERM-A2","NERM-B1","NERM-D1"] },
  { id:"SK-012", name:"Compliance Report Generator",category:"Compliance",   version:"1.1.0", status:"active",   description:"Automated HKCAD/CAAS compliance report generation.", author:"AuraSense Core", price:"HK$360/mo", tags:["compliance","hkcad","reporting"], params:{"jurisdiction":"HK","report_format":"pdf","auto_submit":"false"}, deployedTo:["NERM-A1"] },
];

const CATEGORIES = ["All", ...Array.from(new Set(MOCK_SKILLS.map(s => s.category)))];
const STATUS_COLORS: Record<string,string> = { active:"#22c55e", beta:"#f59e0b", deprecated:"#ef4444" };

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>(MOCK_SKILLS);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<Skill|null>(null);
  const [editParams, setEditParams] = useState<Record<string,string>>({});
  const [newSkillOpen, setNewSkillOpen] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const filtered = skills.filter(s =>
    (category === "All" || s.category === category) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.tags.some(t => t.includes(search.toLowerCase())))
  );

  const openSkill = (s: Skill) => { setSelected(s); setEditParams({...s.params}); };

  const deploySkill = async (skill: Skill) => {
    try {
      const res = await fetch("/api/skills/bundle-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ skillId: skill.id, slaTier: "standard" }], siteId: "site-001", customerId: "demo-user", contract_terms_per_skill: {} }),
      });
      showToast(res.ok ? `${skill.name} deployed!` : `${skill.name} queued for deployment`);
    } catch {
      showToast(`${skill.name} queued for deployment`);
    }
  };

  const saveParams = () => {
    if (!selected) return;
    setSkills(s => s.map(x => x.id === selected.id ? {...x, params: editParams} : x));
    setSelected(s => s ? {...s, params: editParams} : null);
    showToast("Parameters saved");
  };

  return (
    <main style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <h1 style={{fontSize:22,margin:0,color:"#e0e8f2"}}>Skills Library</h1>
          <div style={{fontSize:12,color:"#8b9aae",marginTop:2}}>{skills.length} skills · {skills.filter(s=>s.status==="active").length} active · {skills.filter(s=>s.deployedTo.length>0).length} deployed</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setNewSkillOpen(true)} style={btnT}>+ New Skill</button>
          <button onClick={()=>showToast("Compose chain opened")} style={btnG}>Compose Chain</button>
        </div>
      </div>

      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search skills, tags…"
          style={{height:32,padding:"0 10px",background:"rgba(255,255,255,.04)",border:"1px solid #1a1f26",borderRadius:6,color:"#cfd8e3",fontSize:12,outline:"none",width:220}} />
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={()=>setCategory(c)} style={{padding:"4px 12px",borderRadius:999,fontSize:11,fontWeight:600,cursor:"pointer",border:"1px solid",
              background:category===c?"rgba(79,152,163,.2)":"rgba(255,255,255,.04)",
              borderColor:category===c?"rgba(79,152,163,.5)":"#1a1f26",
              color:category===c?"#5ab8d0":"#8b9aae"}}>{c}</button>
          ))}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
        {filtered.map(s => (
          <div key={s.id} onClick={()=>openSkill(s)} style={{padding:13,background:"linear-gradient(180deg,rgba(218,226,236,.06),rgba(202,213,224,.03))",border:"1px solid #1a1f26",borderRadius:11,cursor:"pointer",transition:"border-color .15s"}}
            onMouseEnter={e=>(e.currentTarget.style.borderColor="rgba(79,152,163,.4)")}
            onMouseLeave={e=>(e.currentTarget.style.borderColor="#1a1f26")}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:"#e0e8f2",marginBottom:2}}>{s.name}</div>
                <div style={{fontSize:10.5,color:"#8b9aae"}}>{s.category} · v{s.version}</div>
              </div>
              <div style={{width:8,height:8,borderRadius:"50%",background:STATUS_COLORS[s.status]???"#8b9aae",marginTop:4,boxShadow:s.status==="active"?`0 0 6px ${STATUS_COLORS[s.status]}`:"none"}} />
            </div>
            <div style={{fontSize:11.5,color:"#8b9aae",marginBottom:10,lineHeight:1.5}}>{s.description}</div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
              {s.tags.map(t => <span key={t} style={{padding:"2px 7px",borderRadius:999,fontSize:9.5,fontWeight:600,background:"rgba(79,152,163,.1)",color:"#5ab8d0",border:"1px solid rgba(79,152,163,.2)"}}>{t}</span>)}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:12,fontWeight:700,color:"#5ab8d0"}}>{s.price}</span>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                {s.deployedTo.length > 0 && <Badge kind="ok">{s.deployedTo.length} deployed</Badge>}
                <button onClick={e=>{e.stopPropagation();deploySkill(s);}} style={{padding:"3px 9px",borderRadius:5,fontSize:10,fontWeight:600,cursor:"pointer",background:"linear-gradient(135deg,#2e6b74,#4f98a3)",border:"none",color:"#fff"}}>Deploy</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Skill Detail Drawer */}
      {selected && (
        <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",justifyContent:"flex-end"}} onClick={()=>setSelected(null)}>
          <div style={{width:420,height:"100%",background:"#0a1628",border:"1px solid #1a1f26",borderRight:"none",overflowY:"auto",padding:20}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div>
                <div style={{fontSize:16,fontWeight:800,color:"#e0e8f2"}}>{selected.name}</div>
                <div style={{fontSize:11,color:"#8b9aae",marginTop:2}}>{selected.id} · v{selected.version}</div>
              </div>
              <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:"#8b9aae",fontSize:18,cursor:"pointer"}}>✕</button>
            </div>
            <div style={{fontSize:12,color:"#8b9aae",marginBottom:14,lineHeight:1.6}}>{selected.description}</div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:700,color:"#5ab8d0",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Parameters</div>
              {Object.entries(editParams).map(([k,v]) => (
                <div key={k} style={{marginBottom:8}}>
                  <label style={{fontSize:11,color:"#8b9aae",display:"block",marginBottom:3}}>{k}</label>
                  <input value={v} onChange={e=>setEditParams(p=>({...p,[k]:e.target.value}))}
                    style={{width:"100%",height:30,padding:"0 9px",background:"rgba(255,255,255,.06)",border:"1px solid #1a1f26",borderRadius:6,color:"#cfd8e3",fontSize:12,outline:"none"}} />
                </div>
              ))}
              <button onClick={saveParams} style={{...btnT,marginTop:6,width:"100%",justifyContent:"center"}}>Save Parameters</button>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:700,color:"#5ab8d0",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Deployed To</div>
              {selected.deployedTo.length === 0 ? <div style={{fontSize:11.5,color:"#8b9aae"}}>Not deployed</div>
                : selected.deployedTo.map(d => <div key={d} style={{fontSize:11.5,color:"#e0e8f2",padding:"4px 0",borderBottom:"1px solid #1a1f26"}}>{d}</div>)}
            </div>
            <button onClick={()=>{deploySkill(selected);setSelected(null);}} style={{...btnT,width:"100%",justifyContent:"center",marginTop:8}}>Deploy Skill</button>
          </div>
        </div>
      )}

      {/* New Skill Modal */}
      {newSkillOpen && (
        <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setNewSkillOpen(false)}>
          <div style={{width:500,background:"#0a1628",border:"1px solid #1a1f26",borderRadius:14,padding:24}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:16,fontWeight:800,color:"#e0e8f2",marginBottom:16}}>New Skill</div>
            {[{label:"Skill Name",ph:"e.g. Facade Crack Detector"},{label:"Category",ph:"e.g. Vision"},{label:"Description",ph:"What does this skill do?"}].map(f=>(
              <div key={f.label} style={{marginBottom:10}}>
                <label style={{fontSize:11.5,color:"#8b9aae",display:"block",marginBottom:3}}>{f.label}</label>
                <input placeholder={f.ph} style={{width:"100%",height:30,padding:"0 9px",background:"rgba(255,255,255,.06)",border:"1px solid #1a1f26",borderRadius:6,color:"#cfd8e3",fontSize:12,outline:"none"}} />
              </div>
            ))}
            <div style={{display:"flex",gap:8,marginTop:16}}>
              <button onClick={()=>{setNewSkillOpen(false);showToast("Skill created");}} style={btnP}>Create Skill</button>
              <button onClick={()=>setNewSkillOpen(false)} style={btnG}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div style={{position:"fixed",bottom:20,right:20,zIndex:9999,padding:"10px 14px",background:"rgba(6,15,30,.95)",border:"1px solid rgba(79,152,163,.4)",borderRadius:10,fontSize:12,color:"#e0e8f2",fontWeight:500}}>{toast}</div>}
    </main>
  );
}
const btnBase: React.CSSProperties = {padding:"6px 14px",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",border:"none"};
const btnT: React.CSSProperties = {...btnBase,background:"linear-gradient(135deg,#2e6b74,#4f98a3)",color:"#fff",display:"flex",alignItems:"center",gap:5};
const btnP: React.CSSProperties = {...btnBase,background:"linear-gradient(135deg,#3b5d8d,#4f98a3)",color:"#fff"};
const btnG: React.CSSProperties = {...btnBase,background:"rgba(255,255,255,.06)",border:"1px solid #1a1f26",color:"#cfd8e3"};
