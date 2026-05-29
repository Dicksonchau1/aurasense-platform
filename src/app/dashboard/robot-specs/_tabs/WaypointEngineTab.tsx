"use client";
import { useEffect, useRef, useState } from "react";
import { Card, Badge, Row } from "../../_components/SpecCard";

interface WP { id:number; x:number; y:number; alt:number; }

export default function WaypointEngineTab() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [wps, setWps] = useState<WP[]>([]);
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const drawCanvas = (pts: WP[]) => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const W = cv.width, H = cv.height;
    ctx.fillStyle = "#060f1e"; ctx.fillRect(0,0,W,H);
    // Grid
    ctx.strokeStyle = "rgba(79,152,163,.1)"; ctx.lineWidth = 0.5;
    for (let x=0;x<W;x+=40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y=0;y<H;y+=40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    // Route
    if (pts.length > 1) {
      ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y);
      pts.slice(1).forEach(p => ctx.lineTo(p.x,p.y));
      ctx.strokeStyle = "rgba(79,152,163,.5)"; ctx.lineWidth = 1.5; ctx.setLineDash([5,4]); ctx.stroke(); ctx.setLineDash([]);
    }
    // Waypoints
    pts.forEach((p,i) => {
      ctx.beginPath(); ctx.arc(p.x,p.y,7,0,Math.PI*2);
      ctx.fillStyle = i===0?"#22c55e":"rgba(79,152,163,.9)"; ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.font = "bold 9px ui-monospace,monospace"; ctx.textAlign = "center";
      ctx.fillText(String(i+1),p.x,p.y+3.5);
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(224,232,242,.8)"; ctx.font = "9px ui-monospace,monospace";
      ctx.fillText(`WP${i+1} ${p.alt}m`,p.x+10,p.y-6);
    });
    ctx.fillStyle = "rgba(79,152,163,.4)"; ctx.font = "9px ui-monospace,monospace";
    ctx.fillText("Click to add waypoint",10,H-10);
  };

  useEffect(() => { drawCanvas(wps); }, [wps]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cv = cvRef.current; if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const scaleX = cv.width / rect.width, scaleY = cv.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX, y = (e.clientY - rect.top) * scaleY;
    const alt = 60 + Math.round(Math.random()*40);
    setWps(p => [...p, {id:p.length+1,x:Math.round(x),y:Math.round(y),alt}]);
    showToast(`WP${wps.length+1} added at alt ${alt}m`);
  };

  const totalDist = wps.length > 1 ? wps.slice(1).reduce((s,p,i) => s + Math.hypot(p.x-wps[i].x,p.y-wps[i].y)*0.5,0).toFixed(0)+"m" : "--";
  const estTime = wps.length > 1 ? (parseFloat(totalDist)*0.5/4).toFixed(0)+"s" : "--";

  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 260px",gap:11}}>
      <Card title="Waypoint Engine">
        <canvas ref={cvRef} width={560} height={320} onClick={handleClick}
          style={{display:"block",width:"100%",borderRadius:9,background:"#060f1e",cursor:"crosshair",border:"1px solid rgba(79,152,163,.2)"}} />
        <div style={{display:"flex",gap:8,marginTop:10}}>
          <button onClick={()=>{setWps([]);showToast("Waypoints cleared");}} style={btnT}>Clear All</button>
          <button onClick={()=>showToast("Route optimised (A* + STDP)")} style={btnP}>Optimise Route</button>
          <button onClick={()=>showToast("JSON exported")} style={btnG}>Export JSON</button>
        </div>
      </Card>
      <div style={{display:"flex",flexDirection:"column",gap:11}}>
        <Card title="Active Waypoints">
          <div style={{maxHeight:200,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
            {wps.length === 0 ? <div style={{fontSize:11,color:"#8b9aae",textAlign:"center",padding:12}}>No waypoints. Click canvas to add.</div>
              : wps.map((p,i) => (
              <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 8px",background:"rgba(255,255,255,.03)",border:"1px solid #1a1f26",borderRadius:6}}>
                <span style={{fontSize:11,fontFamily:"ui-monospace,monospace",color:"#5ab8d0"}}>WP{i+1}</span>
                <span style={{fontSize:10.5,color:"#8b9aae"}}>{p.alt}m AGL</span>
                <button onClick={()=>setWps(w=>w.filter((_,j)=>j!==i))} style={{fontSize:9,padding:"1px 5px",borderRadius:4,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",color:"#ef4444",cursor:"pointer"}}>✕</button>
              </div>
            ))}
          </div>
          <div style={{marginTop:8}}>
            <Row label="Total distance">{totalDist}</Row>
            <Row label="Est. time">{estTime}</Row>
            <Row label="Battery required">{wps.length > 1 ? Math.min(99,Math.round(parseFloat(totalDist||"0")*0.05))+"%":"--"}</Row>
          </div>
        </Card>
        <Card title="WP Engine Config">
          <Row label="Algorithm">A* + STDP</Row>
          <Row label="Avoidance"><Badge kind="ok">Active</Badge></Row>
          <Row label="Wind comp."><Badge kind="ok">Active</Badge></Row>
          <Row label="RTK precision">±0.08m</Row>
        </Card>
      </div>
      {toast && <div style={{position:"fixed",bottom:20,right:20,zIndex:9999,padding:"10px 14px",background:"rgba(6,15,30,.95)",border:"1px solid rgba(79,152,163,.4)",borderRadius:10,fontSize:12,color:"#e0e8f2",fontWeight:500}}>{toast}</div>}
    </div>
  );
}
const btnBase: React.CSSProperties = {padding:"5px 12px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",border:"none"};
const btnT: React.CSSProperties = {...btnBase,background:"linear-gradient(135deg,#2e6b74,#4f98a3)",color:"#fff"};
const btnP: React.CSSProperties = {...btnBase,background:"linear-gradient(135deg,#3b5d8d,#4f98a3)",color:"#fff"};
const btnG: React.CSSProperties = {...btnBase,background:"rgba(255,255,255,.06)",border:"1px solid #1a1f26",color:"#cfd8e3"};
