"use client";
import { useEffect, useRef, useState } from "react";
import { Card, Badge, Row } from "../../_components/SpecCard";

export default function SweepTab() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const angRef = useRef(0);
  const rafRef = useRef(0);
  const [active, setActive] = useState(true);
  const [coverage, setCoverage] = useState(74);
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const draw = () => {
      const W = cv.width, H = cv.height, cx = W/2, cy = H/2, R = Math.min(W,H)/2 - 16;
      ctx.fillStyle = "#040d1a"; ctx.fillRect(0,0,W,H);
      [.25,.5,.75,1].forEach(r => {
        ctx.beginPath(); ctx.arc(cx,cy,R*r,0,Math.PI*2);
        ctx.strokeStyle="rgba(79,152,163,.18)"; ctx.lineWidth=1; ctx.stroke();
        ctx.fillStyle="rgba(79,152,163,.45)"; ctx.font="9px ui-monospace,monospace";
        ctx.fillText(Math.round(r*70)+"m",cx+R*r+3,cy-2);
      });
      ctx.strokeStyle="rgba(79,152,163,.2)"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(cx,cy-R); ctx.lineTo(cx,cy+R); ctx.moveTo(cx-R,cy); ctx.lineTo(cx+R,cy); ctx.stroke();
      ["N","S","E","W"].forEach((d,i) => {
        const pos = [[cx-4,cy-R-6],[cx-4,cy+R+14],[cx+R+6,cy+4],[cx-R-14,cy+4]][i];
        ctx.fillStyle="rgba(79,152,163,.55)"; ctx.font="bold 10px ui-monospace,monospace"; ctx.fillText(d,pos[0],pos[1]);
      });
      if (active) {
        const ang = angRef.current;
        ctx.save(); ctx.translate(cx,cy);
        for (let da=0; da<Math.PI/3; da+=0.015) {
          const a=ang-da, alpha=0.35-(da/(Math.PI/3))*0.32;
          ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0,0,R,a,a+0.018); ctx.closePath();
          ctx.fillStyle=`rgba(79,152,163,${alpha})`; ctx.fill();
        }
        ctx.strokeStyle="rgba(110,192,207,.95)"; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(ang)*R,Math.sin(ang)*R); ctx.stroke();
        ctx.restore();
        angRef.current += 0.035;
        if (coverage < 100) setCoverage(c => Math.min(100, c + 0.01));
      }
      ctx.beginPath(); ctx.arc(cx,cy,4,0,Math.PI*2); ctx.fillStyle="rgba(110,192,207,.95)"; ctx.fill();
      rafRef.current = requestAnimationFrame(draw);
    };
    cv.width = cv.offsetWidth || 380; cv.height = cv.offsetHeight || 300;
    draw();
    const ro = new ResizeObserver(() => { cv.width=cv.offsetWidth||380; cv.height=cv.offsetHeight||300; });
    ro.observe(cv);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, [active]);

  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
      <Card title="Sweep Engine">
        <canvas ref={cvRef} style={{display:"block",width:"100%",height:280,borderRadius:9,background:"#040d1a",border:"1px solid rgba(79,152,163,.3)"}} />
        <div style={{marginTop:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:10.5,fontFamily:"ui-monospace,monospace",color:"rgba(79,152,163,.8)"}}>
            {active ? `SCAN ACTIVE — ${Math.round(coverage)}%` : "SCAN PAUSED"}
          </span>
          <Badge kind={active?"ok":"warn"}>{active?"Live":"Paused"}</Badge>
        </div>
        <div style={{height:4,background:"rgba(79,152,163,.15)",borderRadius:999,overflow:"hidden",marginTop:6}}>
          <div style={{width:coverage+"%",height:"100%",background:"linear-gradient(90deg,#2e6b74,#4f98a3)",borderRadius:999,transition:"width .3s"}} />
        </div>
        <div style={{display:"flex",gap:8,marginTop:10}}>
          <button onClick={()=>{setActive(true);showToast("Sweep started");}} style={btnT}>Start Sweep</button>
          <button onClick={()=>{setActive(false);showToast("Paused");}} style={btnG}>Pause</button>
          <button onClick={()=>showToast("Exported")} style={btnG}>Export</button>
        </div>
      </Card>
      <Card title="Sweep Parameters">
        <Row label="Pattern">Boustrophedon</Row>
        <Row label="Overlap front/side">80% / 75%</Row>
        <Row label="GSD target">0.8 cm/px</Row>
        <Row label="Altitude AGL">82 m</Row>
        <Row label="Standoff dist.">8.4 m</Row>
        <Row label="Est. images">1,247</Row>
        <Row label="Coverage time">14 min</Row>
        <Row label="NERM zone"><Badge kind="info">SCAN-ACTIVE</Badge></Row>
        <Row label="Coverage">{Math.round(coverage)}%</Row>
      </Card>
      {toast && <div style={{position:"fixed",bottom:20,right:20,zIndex:9999,padding:"10px 14px",background:"rgba(6,15,30,.95)",border:"1px solid rgba(79,152,163,.4)",borderRadius:10,fontSize:12,color:"#e0e8f2",fontWeight:500}}>{toast}</div>}
    </div>
  );
}
const btnBase: React.CSSProperties = {padding:"5px 12px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",border:"none"};
const btnT: React.CSSProperties = {...btnBase,background:"linear-gradient(135deg,#2e6b74,#4f98a3)",color:"#fff"};
const btnG: React.CSSProperties = {...btnBase,background:"rgba(255,255,255,.06)",border:"1px solid #1a1f26",color:"#cfd8e3"};
