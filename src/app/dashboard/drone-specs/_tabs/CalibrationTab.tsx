"use client";
import { useState, useRef } from "react";
import { Card, Badge } from "../../_components/SpecCard";

const CAL_STEPS = [
  { id:"C1", title:"IMU Calibration",       desc:"Place on flat surface, rotate 6 axes on prompt.",         ok:true,  duration:45 },
  { id:"C2", title:"Compass Calibration",   desc:"Rotate 360° horizontally and vertically.",               ok:true,  duration:30 },
  { id:"C3", title:"ESC Calibration",       desc:"Throttle range calibration for all 4 ESCs.",             ok:true,  duration:20 },
  { id:"C4", title:"Gimbal Calibration",    desc:"Full gimbal range-of-motion test.",                      ok:false, duration:25 },
  { id:"C5", title:"RTK Baseline",          desc:"Establish RTK baseline with ground station.",            ok:true,  duration:60 },
  { id:"C6", title:"Barometer Calibration", desc:"Seal drone in calibration bag, apply pressure cycle.",  ok:true,  duration:15 },
  { id:"C7", title:"Camera Calibration",    desc:"Run lens distortion correction on calibration target.",  ok:false, duration:35 },
  { id:"C8", title:"Thermal Sensor Cal",    desc:"Point at blackbody reference at 35°C for 60s.",         ok:true,  duration:60 },
];

export default function CalibrationTab() {
  const [steps, setSteps] = useState(CAL_STEPS.map(s => ({...s, running:false, done:s.ok, progress:s.ok?100:0})));
  const [running, setRunning] = useState(false);
  const [toast, setToast] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const runCal = () => {
    if (running) return;
    setRunning(true);
    let idx = 0;
    const next = () => {
      if (idx >= steps.length) { setRunning(false); showToast("Calibration complete ✓"); return; }
      setSteps(s => s.map((x,i) => i===idx ? {...x,running:true,progress:0} : x));
      let p = 0;
      timerRef.current = setInterval(() => {
        p += 100 / (steps[idx].duration * 2);
        if (p >= 100) {
          clearInterval(timerRef.current!);
          setSteps(s => s.map((x,i) => i===idx ? {...x,running:false,done:true,progress:100} : x));
          idx++;
          setTimeout(next, 300);
        } else {
          setSteps(s => s.map((x,i) => i===idx ? {...x,progress:Math.round(p)} : x));
        }
      }, 500);
    };
    next();
  };

  return (
    <div>
      <Card title="Calibration Sequence">
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {steps.map(s => (
            <div key={s.id} style={{padding:"10px 12px",background:"rgba(255,255,255,.03)",border:`1px solid ${s.done?"rgba(34,197,94,.2)":s.running?"rgba(79,152,163,.3)":"#1a1f26"}`,borderRadius:9}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:s.running?8:0}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:s.done?"rgba(34,197,94,.15)":s.running?"rgba(79,152,163,.15)":"rgba(255,255,255,.05)",border:`1px solid ${s.done?"rgba(34,197,94,.4)":s.running?"rgba(79,152,163,.4)":"#1a1f26"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,flexShrink:0}}>
                  {s.done ? "✓" : s.running ? "⟳" : s.id.slice(1)}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12.5,fontWeight:700,color:s.done?"#22c55e":s.running?"#5ab8d0":"#e0e8f2"}}>{s.title}</div>
                  <div style={{fontSize:11,color:"#8b9aae"}}>{s.desc}</div>
                </div>
                <div style={{fontSize:10.5,color:"#8b9aae",fontFamily:"ui-monospace,monospace"}}>{s.duration}s</div>
                <Badge kind={s.done?"ok":s.running?"info":"warn"}>{s.done?"Done":s.running?"Running":"Pending"}</Badge>
              </div>
              {s.running && (
                <div style={{height:4,background:"rgba(79,152,163,.15)",borderRadius:999,overflow:"hidden"}}>
                  <div style={{width:s.progress+"%",height:"100%",background:"linear-gradient(90deg,#2e6b74,#4f98a3)",borderRadius:999,transition:"width .3s"}} />
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:8,marginTop:14}}>
          <button onClick={runCal} disabled={running} style={{...btnP,opacity:running?.6:1}}>▶ {running?"Running…":"Run Full Calibration"}</button>
          <button onClick={()=>{
            const rows = ["id,title,status,duration_s", ...steps.map(s=>`${s.id},"${s.title}",${s.done?"done":s.running?"running":"pending"},${s.duration}`)].join("\n");
            const blob = new Blob([rows],{type:"text/csv"});
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href=url; a.download=`calibration-log-${new Date().toISOString().slice(0,10)}.csv`; a.click();
            URL.revokeObjectURL(url);
            showToast("✓ Calibration log exported");
          }} style={btnG}>Export Log</button>
          <button onClick={()=>{setSteps(CAL_STEPS.map(s=>({...s,running:false,done:s.ok,progress:s.ok?100:0})));setRunning(false);}} style={btnG}>Reset</button>
        </div>
      </Card>
      {toast && <div style={{position:"fixed",bottom:20,right:20,zIndex:9999,padding:"10px 14px",background:"rgba(6,15,30,.95)",border:"1px solid rgba(79,152,163,.4)",borderRadius:10,fontSize:12,color:"#e0e8f2",fontWeight:500}}>{toast}</div>}
    </div>
  );
}
const btnBase: React.CSSProperties = {padding:"6px 14px",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",border:"none"};
const btnP: React.CSSProperties = {...btnBase,background:"linear-gradient(135deg,#3b5d8d,#4f98a3)",color:"#fff"};
const btnG: React.CSSProperties = {...btnBase,background:"rgba(255,255,255,.06)",border:"1px solid #1a1f26",color:"#cfd8e3"};
