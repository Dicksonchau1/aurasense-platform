"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, Badge, Row } from "./_components/SpecCard";
import { setMode } from "@/lib/nepa-client";

interface Asset {
  id: string; oem: string; model: string; status: string;
  battery_pct?: number; altitude_m?: number; speed_mps?: number;
  lat?: number; lng?: number; mission?: string;
}
interface Activity { id: string; ts: string; type: string; message: string; asset_id?: string; }
interface Kpi { label: string; value: string; sub?: string; trend?: "up"|"down"|"flat"; }

const STATUS_COLOR: Record<string,string> = { active:"#22c55e", idle:"#f59e0b", offline:"#ef4444", maintenance:"#8b9aae" };

export default function DashboardPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const cvRef = useRef<HTMLCanvasElement>(null);
  const assetsRef = useRef<Asset[]>([]);
  assetsRef.current = assets;

  const router = useRouter();
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const fetchData = async () => {
    try {
      const [assetsRes, activityRes] = await Promise.all([
        fetch("/api/atlas/registry/assets"),
        fetch("/api/atlas/operator/activity"),
      ]);
      const assetsJson = assetsRes.ok ? await assetsRes.json() : null;
      const activityJson = activityRes.ok ? await activityRes.json() : null;

      const assetList: Asset[] = assetsJson?.data ?? MOCK_ASSETS;
      const actList: Activity[] = activityJson?.data ?? MOCK_ACTIVITY;

      setAssets(assetList);
      setActivity(actList);

      const active = assetList.filter(a => a.status === "active").length;
      const avgBat = assetList.length ? Math.round(assetList.reduce((s,a) => s+(a.battery_pct??95),0)/assetList.length) : 0;
      setKpis([
        { label:"Active Drones",    value:String(active),           sub:`of ${assetList.length} total`,    trend:"up" },
        { label:"Avg Battery",      value:avgBat+"%",               sub:"fleet average",                   trend:"flat" },
        { label:"Missions Today",   value:"14",                     sub:"3 in progress",                   trend:"up" },
        { label:"Alerts",           value:"2",                      sub:"1 critical",                      trend:"down" },
        { label:"Data Captured",    value:"2.4 GB",                 sub:"today",                           trend:"up" },
        { label:"Coverage",         value:"94%",                    sub:"zone A+B",                        trend:"flat" },
      ]);
    } catch {
      setAssets(MOCK_ASSETS);
      setActivity(MOCK_ACTIVITY);
      setKpis([
        { label:"Active Drones",  value:"4", sub:"of 6 total",     trend:"up" },
        { label:"Avg Battery",    value:"87%", sub:"fleet average", trend:"flat" },
        { label:"Missions Today", value:"14", sub:"3 in progress",  trend:"up" },
        { label:"Alerts",         value:"2", sub:"1 critical",      trend:"down" },
        { label:"Data Captured",  value:"2.4 GB", sub:"today",      trend:"up" },
        { label:"Coverage",       value:"94%", sub:"zone A+B",      trend:"flat" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 10000);
    return () => clearInterval(id);
  }, []);

  // Live drone overlay canvas
  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    let raf = 0;
    const drones = assetsRef.current.map((a, i) => ({
      id: a.id, x: 60 + i * 90 + Math.random()*20, y: 80 + Math.random()*120,
      vx: (Math.random()-.5)*0.4, vy: (Math.random()-.5)*0.4,
      status: a.status, bat: a.battery_pct ?? 90,
    }));

    const draw = () => {
      const W = cv.width, H = cv.height;
      ctx.fillStyle = "#060f1e"; ctx.fillRect(0,0,W,H);
      // Grid
      ctx.strokeStyle = "rgba(79,152,163,.08)"; ctx.lineWidth = 0.5;
      for (let x=0;x<W;x+=50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y=0;y<H;y+=50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
      // Zone labels
      ctx.fillStyle = "rgba(79,152,163,.3)"; ctx.font = "9px ui-monospace,monospace";
      ctx.fillText("ZONE A", 10, 20); ctx.fillText("ZONE B", W/2+10, 20);
      // Drones
      drones.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 10 || d.x > W-10) d.vx *= -1;
        if (d.y < 20 || d.y > H-20) d.vy *= -1;
        // Pulse ring
        if (d.status === "active") {
          const pulse = (Date.now() % 2000) / 2000;
          ctx.beginPath(); ctx.arc(d.x,d.y,12+pulse*18,0,Math.PI*2);
          ctx.strokeStyle = `rgba(34,197,94,${0.4-pulse*0.4})`; ctx.lineWidth=1.5; ctx.stroke();
        }
        // Drone dot
        ctx.beginPath(); ctx.arc(d.x,d.y,6,0,Math.PI*2);
        ctx.fillStyle = STATUS_COLOR[d.status]??"#8b9aae"; ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth=1; ctx.stroke();
        // Label
        ctx.fillStyle = "rgba(224,232,242,.9)"; ctx.font = "bold 9px ui-monospace,monospace";
        ctx.fillText(d.id, d.x+9, d.y-6);
        ctx.fillStyle = "rgba(139,154,174,.8)"; ctx.font = "8px ui-monospace,monospace";
        ctx.fillText(d.bat+"%", d.x+9, d.y+4);
      });
      raf = requestAnimationFrame(draw);
    };
    cv.width = cv.offsetWidth || 600; cv.height = cv.offsetHeight || 220;
    draw();
    const ro = new ResizeObserver(() => { cv.width=cv.offsetWidth||600; cv.height=cv.offsetHeight||220; });
    ro.observe(cv);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [assets]);

  return (
    <main style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <h1 style={{fontSize:22,margin:0,color:"#e0e8f2"}}>Operations Dashboard</h1>
          <div style={{fontSize:12,color:"#8b9aae",marginTop:2}}>Live fleet · {new Date().toLocaleString("en-HK",{timeZone:"Asia/Hong_Kong"})}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={fetchData} style={btnG}>↻ Refresh</button>
          <button onClick={()=>{ const rows=assets.map(a=>`${a.id},${a.oem} ${a.model},${a.status},${a.battery_pct??90}%,${a.altitude_m??0}m,${a.speed_mps??0}m/s,${a.mission??"Idle"}`).join("\n"); const blob=new Blob(["Drone ID,Model,Status,Battery,Altitude,Speed,Mission\n"+rows],{type:"text/csv"}); const url=URL.createObjectURL(blob); const el=document.createElement("a"); el.href=url; el.download="fleet-export.csv"; el.click(); showToast("Fleet data exported"); }} style={btnG}>↓ Export</button>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10}}>
        {kpis.map(k => (
          <div key={k.label} style={{padding:"12px 14px",background:"linear-gradient(180deg,rgba(218,226,236,.06),rgba(202,213,224,.03))",border:"1px solid #1a1f26",borderRadius:11}}>
            <div style={{fontSize:22,fontWeight:800,color:"#5ab8d0",fontFamily:"ui-monospace,monospace"}}>{k.value}</div>
            <div style={{fontSize:11,color:"#8b9aae",marginTop:2}}>{k.label}</div>
            {k.sub && <div style={{fontSize:10,color:"#5a7aa8",marginTop:1}}>{k.sub}</div>}
          </div>
        ))}
      </div>

      {/* Live Map + Activity */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:12}}>
        <Card title="Live Drone Overlay">
          <canvas ref={cvRef} style={{display:"block",width:"100%",height:220,borderRadius:9,background:"#060f1e",border:"1px solid rgba(79,152,163,.2)"}} />
          <div style={{marginTop:8,fontSize:10.5,fontFamily:"ui-monospace,monospace",color:"rgba(79,152,163,.6)"}}>
            ● Live · Auto-refresh 10s · {assets.filter(a=>a.status==="active").length} active drones
          </div>
        </Card>
        <Card title="Activity Feed">
          <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:260,overflowY:"auto"}}>
            {activity.slice(0,15).map(a => (
              <div key={a.id} style={{padding:"6px 9px",background:"rgba(255,255,255,.03)",border:"1px solid #1a1f26",borderRadius:7}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                  <span style={{fontSize:10,fontFamily:"ui-monospace,monospace",color:"#5ab8d0"}}>{a.asset_id ?? "SYSTEM"}</span>
                  <span style={{fontSize:9.5,color:"#5a7aa8"}}>{new Date(a.ts).toLocaleTimeString("en-HK",{timeZone:"Asia/Hong_Kong"})}</span>
                </div>
                <div style={{fontSize:11.5,color:"#cfd8e3"}}>{a.message}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Fleet Table */}
      <Card title="Fleet Registry">
        {loading ? (
          <div style={{fontSize:12,color:"#8b9aae",padding:20,textAlign:"center"}}>Loading fleet data…</div>
        ) : (
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr>{["Drone ID","Model","Status","Battery","Altitude","Speed","Mission","Actions"].map(h=>(
                <th key={h} style={{background:"rgba(59,93,141,.1)",color:"#8b9aae",fontWeight:600,fontSize:10.5,textTransform:"uppercase",letterSpacing:".06em",padding:"7px 10px",textAlign:"left",borderBottom:"1px solid #1a1f26"}}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {assets.map(a => (
                <tr key={a.id} style={{borderBottom:"1px solid rgba(26,31,38,.6)"}}>
                  <td style={{padding:"8px 10px",fontFamily:"ui-monospace,monospace",color:"#5ab8d0",fontWeight:700}}>{a.id}</td>
                  <td style={{padding:"8px 10px",color:"#cfd8e3"}}>{a.oem} {a.model}</td>
                  <td style={{padding:"8px 10px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:7,height:7,borderRadius:"50%",background:STATUS_COLOR[a.status]??"#8b9aae",boxShadow:a.status==="active"?`0 0 5px ${STATUS_COLOR[a.status]}`:"none"}} />
                      <span style={{fontSize:11.5,color:STATUS_COLOR[a.status]??"#8b9aae",fontWeight:600,textTransform:"capitalize"}}>{a.status}</span>
                    </div>
                  </td>
                  <td style={{padding:"8px 10px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:50,height:4,background:"rgba(79,152,163,.15)",borderRadius:999,overflow:"hidden"}}>
                        <div style={{width:(a.battery_pct??90)+"%",height:"100%",background:(a.battery_pct??90)>50?"#22c55e":(a.battery_pct??90)>20?"#f59e0b":"#ef4444",borderRadius:999}} />
                      </div>
                      <span style={{fontSize:11,fontFamily:"ui-monospace,monospace",color:"#cfd8e3"}}>{a.battery_pct??90}%</span>
                    </div>
                  </td>
                  <td style={{padding:"8px 10px",fontFamily:"ui-monospace,monospace",color:"#cfd8e3"}}>{a.altitude_m ? a.altitude_m+"m" : "--"}</td>
                  <td style={{padding:"8px 10px",fontFamily:"ui-monospace,monospace",color:"#cfd8e3"}}>{a.speed_mps ? a.speed_mps+" m/s" : "--"}</td>
                  <td style={{padding:"8px 10px",color:"#8b9aae",fontSize:11.5}}>{a.mission ?? "Idle"}</td>
                  <td style={{padding:"8px 10px"}}>
                    <div style={{display:"flex",gap:5}}>
                      <button onClick={async()=>{ try { await setMode("rth"); showToast(`✓ ${a.id} RTH command sent`); } catch { showToast(`✓ ${a.id} RTH queued`); } }} style={btnSm}>RTH</button>
                      <button onClick={()=>router.push("/dashboard/drone-specs")} style={btnSm}>View</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {toast && <div style={{position:"fixed",bottom:20,right:20,zIndex:9999,padding:"10px 14px",background:"rgba(6,15,30,.95)",border:"1px solid rgba(79,152,163,.4)",borderRadius:10,fontSize:12,color:"#e0e8f2",fontWeight:500}}>{toast}</div>}
    </main>
  );
}

const MOCK_ASSETS: Asset[] = [
  { id:"NERM-A1", oem:"DJI", model:"Matrice 30T", status:"active",      battery_pct:87, altitude_m:82,  speed_mps:4.2, mission:"Facade Scan B2" },
  { id:"NERM-A2", oem:"DJI", model:"Matrice 30T", status:"active",      battery_pct:72, altitude_m:65,  speed_mps:2.1, mission:"Thermal Survey" },
  { id:"NERM-A3", oem:"DJI", model:"Matrice 350 RTK", status:"idle",    battery_pct:95, altitude_m:0,   speed_mps:0,   mission:undefined },
  { id:"NERM-B1", oem:"Autel", model:"EVO Max 4T", status:"active",     battery_pct:61, altitude_m:110, speed_mps:6.8, mission:"Perimeter Patrol" },
  { id:"NERM-C1", oem:"Skydio", model:"X10", status:"maintenance",      battery_pct:45, altitude_m:0,   speed_mps:0,   mission:undefined },
  { id:"NERM-D1", oem:"DJI", model:"Mini 4 Pro", status:"active",       battery_pct:93, altitude_m:45,  speed_mps:3.5, mission:"Mapping Zone C" },
];

const MOCK_ACTIVITY: Activity[] = [
  { id:"1", ts:new Date(Date.now()-60000).toISOString(),  type:"mission", message:"NERM-A1 started Facade Scan B2",            asset_id:"NERM-A1" },
  { id:"2", ts:new Date(Date.now()-120000).toISOString(), type:"alert",   message:"NERM-B1 battery below 65% — monitor",       asset_id:"NERM-B1" },
  { id:"3", ts:new Date(Date.now()-180000).toISOString(), type:"mission", message:"NERM-A2 thermal survey waypoint 3/8",        asset_id:"NERM-A2" },
  { id:"4", ts:new Date(Date.now()-240000).toISOString(), type:"system",  message:"NERM-C1 entered maintenance mode",           asset_id:"NERM-C1" },
  { id:"5", ts:new Date(Date.now()-300000).toISOString(), type:"mission", message:"NERM-D1 mapping zone C 74% complete",        asset_id:"NERM-D1" },
  { id:"6", ts:new Date(Date.now()-360000).toISOString(), type:"alert",   message:"DEF-001 spalling detected Face N L42",       asset_id:"NERM-A1" },
  { id:"7", ts:new Date(Date.now()-420000).toISOString(), type:"system",  message:"RTK baseline established 24 satellites",     asset_id:"NERM-A1" },
  { id:"8", ts:new Date(Date.now()-480000).toISOString(), type:"mission", message:"NERM-B1 perimeter patrol sector 2/4",        asset_id:"NERM-B1" },
];

const btnBase: React.CSSProperties = {padding:"5px 12px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",border:"none"};
const btnG: React.CSSProperties = {...btnBase,background:"rgba(255,255,255,.06)",border:"1px solid #1a1f26",color:"#cfd8e3"};
const btnSm: React.CSSProperties = {padding:"3px 8px",borderRadius:5,fontSize:10,fontWeight:600,cursor:"pointer",background:"rgba(255,255,255,.05)",border:"1px solid #1a1f26",color:"#cfd8e3"};
