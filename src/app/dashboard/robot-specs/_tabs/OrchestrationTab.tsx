"use client";
import { useEffect, useState } from "react";
import { Card, Badge, Row } from "../../_components/SpecCard";

const PIPELINE_STAGES = [
  { name:"Sensor Ingestion",    status:"healthy", hz:32.1, ms:1.2 },
  { name:"STDP Learning",       status:"healthy", hz:30.8, ms:2.1 },
  { name:"World Model Prior",   status:"healthy", hz:29.5, ms:1.8 },
  { name:"Perception Fusion",   status:"healthy", hz:28.9, ms:2.4 },
  { name:"Anomaly Detection",   status:"healthy", hz:28.1, ms:1.6 },
  { name:"Agent Reasoning",     status:"healthy", hz:27.4, ms:3.2 },
  { name:"Action Orchestration",status:"healthy", hz:26.8, ms:1.9 },
  { name:"Audit Chain",         status:"healthy", hz:26.2, ms:0.8 },
];

export default function OrchestrationTab() {
  const [stages, setStages] = useState(PIPELINE_STAGES);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTick(t => t + 1);
      setStages(s => s.map(x => ({
        ...x,
        hz: Math.round((x.hz + (Math.random()-.5)*2) * 10) / 10,
        ms: Math.round((x.ms + (Math.random()-.5)*.5) * 10) / 10,
      })));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const totalLatency = stages.reduce((s,x) => s+x.ms, 0);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:11}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
        <Card title="NEPA Orchestration">
          <Row label="Architecture">STDP v3.2</Row>
          <Row label="Neurons">128K spiking</Row>
          <Row label="Hardware">Jetson Orin 64GB</Row>
          <Row label="Inference">45 fps</Row>
          <Row label="Dopamine reward"><Badge kind="ok">Active</Badge></Row>
          <Row label="STDP learning"><Badge kind="ok">Active</Badge></Row>
          <Row label="Agent loops">Perception→Plan→Act</Row>
        </Card>
        <Card title="Tendon Orchestration">
          <Row label="DOF">6-DOF Tendon</Row>
          <Row label="Payload">2.5 kg</Row>
          <Row label="Reach">1.2 m</Row>
          <Row label="Precision">±0.5 mm</Row>
          <Row label="Actuators">12 servo motors</Row>
          <Row label="Control loop">1 kHz</Row>
          <Row label="Safety stop"><Badge kind="ok">Active</Badge></Row>
        </Card>
      </div>
      <Card title="Orchestration Pipeline — Live">
        <div style={{display:"flex",alignItems:"center",gap:0,overflowX:"auto",paddingBottom:8,marginBottom:10}}>
          {stages.map((s,i) => (
            <div key={s.name} style={{display:"flex",alignItems:"center",flexShrink:0}}>
              <div style={{padding:"6px 10px",borderRadius:7,background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.25)",textAlign:"center",minWidth:90}}>
                <div style={{fontSize:9.5,fontWeight:700,color:"#22c55e",fontFamily:"ui-monospace,monospace"}}>{s.name.replace(/ /g,"
")}</div>
                <div style={{fontSize:9,color:"#8b9aae",marginTop:3}}>{s.hz} Hz · {s.ms} ms</div>
              </div>
              {i < stages.length-1 && <div style={{width:16,height:1,background:"rgba(79,152,163,.4)",flexShrink:0}} />}
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {[
            {label:"Total Latency",  value:totalLatency.toFixed(1)+" ms"},
            {label:"Throughput",     value:"26.2 Hz"},
            {label:"Pipeline Health",value:"100%"},
            {label:"Last Update",    value:new Date().toLocaleTimeString("en-HK",{timeZone:"Asia/Hong_Kong"})},
          ].map(m => (
            <div key={m.label} style={{textAlign:"center",padding:"8px 6px",background:"rgba(255,255,255,.03)",border:"1px solid #1a1f26",borderRadius:8}}>
              <div style={{fontSize:14,fontWeight:800,color:"#5ab8d0",fontFamily:"ui-monospace,monospace"}}>{m.value}</div>
              <div style={{fontSize:10,color:"#8b9aae",marginTop:2}}>{m.label}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
