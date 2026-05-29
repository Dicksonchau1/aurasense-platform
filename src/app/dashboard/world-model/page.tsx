"use client";
import { useEffect, useRef, useState } from "react";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

const HK_BUILDINGS = [
  { id:"ICC",     name:"ICC Tower",           lng:114.1601, lat:22.3046, floors:118, height:484, use:"Commercial"  },
  { id:"IFC2",    name:"Two IFC",             lng:114.1589, lat:22.2856, floors:88,  height:415, use:"Commercial"  },
  { id:"CITIC",   name:"CITIC Tower",         lng:114.1641, lat:22.2802, floors:46,  height:216, use:"Commercial"  },
  { id:"BOC",     name:"Bank of China Tower", lng:114.1594, lat:22.2796, floors:72,  height:367, use:"Commercial"  },
  { id:"HSBC",    name:"HSBC Main Building",  lng:114.1591, lat:22.2797, floors:47,  height:179, use:"Commercial"  },
  { id:"CENTRAL", name:"Central Plaza",       lng:114.1733, lat:22.2786, floors:78,  height:374, use:"Mixed"       },
  { id:"NINA",    name:"Nina Tower",          lng:114.1239, lat:22.3746, floors:80,  height:319, use:"Mixed"       },
  { id:"SKYLINE", name:"Skyline Tower",       lng:114.1680, lat:22.3130, floors:65,  height:248, use:"Residential" },
];

const INIT_DRONES = [
  { id:"NERM-A1", lng:114.1601, lat:22.3046, alt:82,  status:"active",      mission:"Facade Scan B2",   bat:87 },
  { id:"NERM-A2", lng:114.1589, lat:22.2856, alt:65,  status:"active",      mission:"Thermal Survey",   bat:72 },
  { id:"NERM-B1", lng:114.1641, lat:22.2802, alt:110, status:"active",      mission:"Perimeter Patrol", bat:61 },
  { id:"NERM-D1", lng:114.1680, lat:22.3130, alt:45,  status:"active",      mission:"Mapping Zone C",   bat:93 },
  { id:"NERM-A3", lng:114.1733, lat:22.2786, alt:0,   status:"idle",        mission:"Standby",          bat:95 },
  { id:"NERM-C1", lng:114.1239, lat:22.3746, alt:0,   status:"maintenance", mission:"Maintenance",      bat:45 },
];

const STATUS_COLOR: Record<string,string> = { active:"#22c55e", idle:"#f59e0b", maintenance:"#ef4444" };

type LayerKey = "buildings"|"dronePath"|"anomalies"|"windVector"|"sunRay"|"groundGrid"|"labels"|"skillZones";
const LAYER_LABELS: Record<LayerKey,string> = { buildings:"Buildings", dronePath:"Drone Path", anomalies:"Anomalies", windVector:"Wind Vector", sunRay:"Sun Ray", groundGrid:"Ground Grid", labels:"Labels", skillZones:"Skill Zones" };

interface SkillZone { id:string; name:string; buildingId:string; color:string; }

export default function WorldModelPage() {
  const mapRef   = useRef<HTMLDivElement>(null);
  const mapInst  = useRef<any>(null);
  const markerRefs = useRef<any[]>([]);

  const [mapLoaded,  setMapLoaded]  = useState(false);
  const [mapStyle,   setMapStyle]   = useState<"dark"|"satellite">("dark");
  const [selBuilding, setSelBuilding] = useState<typeof HK_BUILDINGS[0]|null>(null);
  const [floorSlider, setFloorSlider] = useState(1);
  const [selDrone,   setSelDrone]   = useState<typeof INIT_DRONES[0]|null>(null);
  const [drones,     setDrones]     = useState(INIT_DRONES.map(d=>({...d})));
  const [skillZones, setSkillZones] = useState<SkillZone[]>([
    { id:"sz1", name:"Facade Crack Detector",  buildingId:"ICC",  color:"#4f98a3" },
    { id:"sz2", name:"Thermal Anomaly Scanner", buildingId:"IFC2", color:"#f59e0b" },
  ]);
  const [layers, setLayers] = useState<Record<LayerKey,boolean>>({
    buildings:true, dronePath:true, anomalies:true, windVector:true,
    sunRay:false, groundGrid:true, labels:true, skillZones:true,
  });
  const [toast, setToast] = useState("");

  const showToast = (msg:string) => { setToast(msg); setTimeout(()=>setToast(""),3000); };

  // Animate drones
  useEffect(()=>{
    const id = setInterval(()=>{
      setDrones(prev=>prev.map(d=>d.status==="active"?{
        ...d,
        lng: d.lng+(Math.random()-.5)*0.0003,
        lat: d.lat+(Math.random()-.5)*0.0003,
        alt: Math.max(20,Math.min(150,d.alt+(Math.random()-.5)*3)),
        bat: Math.max(10,d.bat-0.05),
      }:d));
    },2000);
    return ()=>clearInterval(id);
  },[]);

  // Init Mapbox
  useEffect(()=>{
    if(!mapRef.current||mapInst.current) return;
    let map:any;
    import("mapbox-gl").then(mod=>{
      const mgl = (mod as any).default ?? mod;
      mgl.accessToken = MAPBOX_TOKEN;
      map = new mgl.Map({
        container: mapRef.current!,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [114.1694,22.3193],
        zoom: 13.5, pitch:60, bearing:-20, antialias:true,
      });
      mapInst.current = map;
      map.on("load",()=>{
        // 3D buildings
        map.addLayer({
          id:"3d-buildings", source:"composite", "source-layer":"building",
          filter:["==","extrude","true"], type:"fill-extrusion", minzoom:12,
          paint:{
            "fill-extrusion-color":["interpolate",["linear"],["get","height"],0,"#0a1628",100,"#1a2d4a",300,"#2e6b74",500,"#4f98a3"],
            "fill-extrusion-height":["interpolate",["linear"],["zoom"],15,0,15.05,["get","height"]],
            "fill-extrusion-base":["interpolate",["linear"],["zoom"],15,0,15.05,["get","min_height"]],
            "fill-extrusion-opacity":0.85,
          },
        });
        // Drone paths
        map.addSource("drone-paths",{
          type:"geojson",
          data:{ type:"FeatureCollection", features: INIT_DRONES.filter(d=>d.status==="active").map(d=>({
            type:"Feature",
            geometry:{ type:"LineString", coordinates:[[d.lng-.003,d.lat-.002],[d.lng-.001,d.lat+.001],[d.lng,d.lat]] },
            properties:{ id:d.id },
          }))},
        });
        map.addLayer({ id:"drone-paths-layer", type:"line", source:"drone-paths",
          paint:{"line-color":"#22c55e","line-width":1.5,"line-opacity":0.6,"line-dasharray":[2,2]} });
        // Anomaly markers
        [[114.1601,22.3046,"Spalling"],[114.1589,22.2856,"Thermal"],[114.1641,22.2802,"Crack"],[114.1680,22.3130,"Corrosion"]].forEach(([lng,lat,type])=>{
          const el=document.createElement("div");
          el.style.cssText="width:12px;height:12px;border-radius:50%;background:#ef4444;border:2px solid rgba(239,68,68,.4);box-shadow:0 0 8px #ef4444;cursor:pointer;";
          el.title=type+" anomaly";
          new mgl.Marker({element:el}).setLngLat([lng as number,lat as number]).addTo(map);
        });
        setMapLoaded(true);
      });
      map.on("click",()=>{ setSelBuilding(null); setSelDrone(null); });
    });
    return ()=>{ if(map) map.remove(); mapInst.current=null; };
  },[]);

  // Update drone markers
  useEffect(()=>{
    if(!mapLoaded||!mapInst.current) return;
    import("mapbox-gl").then(mod=>{
      const mgl=(mod as any).default??mod;
      markerRefs.current.forEach(m=>m.remove());
      markerRefs.current=[];
      drones.forEach(d=>{
        const el=document.createElement("div");
        const c=STATUS_COLOR[d.status]??"#8b9aae";
        el.style.cssText=`width:14px;height:14px;border-radius:50%;background:${c};border:2px solid rgba(255,255,255,.5);box-shadow:0 0 10px ${c};cursor:pointer;`;
        el.title=`${d.id} — ${d.mission}`;
        el.addEventListener("click",(e)=>{ e.stopPropagation(); setSelDrone({...d}); });
        const marker=new mgl.Marker({element:el}).setLngLat([d.lng,d.lat]).addTo(mapInst.current);
        markerRefs.current.push(marker);
      });
    });
  },[mapLoaded,drones]);

  const toggleLayer=(k:LayerKey)=>{
    setLayers(prev=>{
      const next={...prev,[k]:!prev[k]};
      const map=mapInst.current;
      if(map?.getLayer){
        if(k==="buildings"&&map.getLayer("3d-buildings")) map.setLayoutProperty("3d-buildings","visibility",next.buildings?"visible":"none");
        if(k==="dronePath"&&map.getLayer("drone-paths-layer")) map.setLayoutProperty("drone-paths-layer","visibility",next.dronePath?"visible":"none");
      }
      return next;
    });
  };

  const flyTo=(b:typeof HK_BUILDINGS[0])=>{
    setSelBuilding(b); setFloorSlider(b.floors);
    mapInst.current?.flyTo({center:[b.lng,b.lat],zoom:16.5,pitch:70,bearing:Math.random()*60-30,duration:1800});
  };

  const switchStyle=(s:"dark"|"satellite")=>{
    setMapStyle(s);
    const map=mapInst.current; if(!map) return;
    map.setStyle(s==="dark"?"mapbox://styles/mapbox/dark-v11":"mapbox://styles/mapbox/satellite-streets-v12");
    map.once("style.load",()=>{
      map.addLayer({ id:"3d-buildings",source:"composite","source-layer":"building",filter:["==","extrude","true"],type:"fill-extrusion",minzoom:12,
        paint:{"fill-extrusion-color":["interpolate",["linear"],["get","height"],0,"#0a1628",100,"#1a2d4a",300,"#2e6b74",500,"#4f98a3"],"fill-extrusion-height":["interpolate",["linear"],["zoom"],15,0,15.05,["get","height"]],"fill-extrusion-base":["interpolate",["linear"],["zoom"],15,0,15.05,["get","min_height"]],"fill-extrusion-opacity":0.85} });
    });
  };

  const deploySkill=(skillName:string,buildingId:string)=>{
    const colors=["#4f98a3","#f59e0b","#22c55e","#8b5cf6","#ef4444"];
    setSkillZones(prev=>[...prev,{id:"sz"+Date.now(),name:skillName,buildingId,color:colors[prev.length%colors.length]}]);
    showToast(`${skillName} deployed to ${buildingId}`);
  };

  const visibleFloors = selBuilding ? Math.max(1,floorSlider) : 0;

  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 110px)",gap:0,position:"relative"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingBottom:10,flexShrink:0}}>
        <div>
          <div style={{fontSize:11,color:"#5ab8d0",marginBottom:2}}>Dashboard / World Model</div>
          <h1 style={{fontSize:22,margin:0,color:"#e0e8f2"}}>World Model</h1>
          <div style={{fontSize:12,color:"#8b9aae",marginTop:2}}>
            Live 3D scene · HK skyline · {HK_BUILDINGS.length} buildings · {drones.filter(d=>d.status==="active").length} active drones · {skillZones.length} skill zones
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{display:"flex",gap:3,background:"rgba(255,255,255,.04)",border:"1px solid #1a1f26",borderRadius:8,padding:3}}>
            {(["dark","satellite"] as const).map(s=>(
              <button key={s} onClick={()=>switchStyle(s)} style={{padding:"4px 12px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",border:"none",background:mapStyle===s?"rgba(79,152,163,.3)":"transparent",color:mapStyle===s?"#5ab8d0":"#8b9aae"}}>{s==="dark"?"Dark":"Satellite"}</button>
            ))}
          </div>
          <button onClick={()=>mapInst.current?.flyTo({center:[114.1694,22.3193],zoom:13.5,pitch:60,bearing:-20,duration:1500})} style={btnG}>Reset View</button>
          <button onClick={()=>showToast("Exporting glTF…")} style={btnG}>Export glTF</button>
          <button onClick={()=>showToast("Streaming live…")} style={{...btnT,background:"linear-gradient(135deg,#166534,#22c55e)"}}>▶ Stream Live</button>
        </div>
      </div>

      {/* HUD status bar */}
      <div style={{display:"flex",gap:8,marginBottom:10,flexShrink:0,flexWrap:"wrap"}}>
        <div style={pill}>NERM-A1 SCAN-ACTIVE</div>
        <div style={pill}>22.3284N 114.1675E</div>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <div style={pill}>ALT {drones[0]?.alt.toFixed(0)}m AGL</div>
          <div style={pill}>WIND 5.2 m/s (220 deg)</div>
          <div style={pill}>SUN 45 deg</div>
        </div>
      </div>

      {/* Map + Right Panel */}
      <div style={{display:"flex",gap:12,flex:1,minHeight:0}}>
        {/* Mapbox container */}
        <div style={{flex:1,position:"relative",borderRadius:12,overflow:"hidden",border:"1px solid rgba(79,152,163,.25)"}}>
          <div ref={mapRef} style={{width:"100%",height:"100%"}} />
          {!mapLoaded&&(
            <div style={{position:"absolute",inset:0,background:"#060f1e",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
              <div style={{width:40,height:40,border:"3px solid rgba(79,152,163,.2)",borderTop:"3px solid #4f98a3",borderRadius:"50%",animation:"spin 1s linear infinite"}} />
              <div style={{fontSize:12,color:"#8b9aae"}}>Loading Mapbox HK Live Map…</div>
            </div>
          )}
          {/* Drone popup */}
          {selDrone&&(
            <div style={{position:"absolute",bottom:16,left:16,background:"rgba(6,15,30,.95)",border:"1px solid rgba(79,152,163,.4)",borderRadius:10,padding:"12px 16px",minWidth:200,zIndex:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:13,fontWeight:700,color:"#5ab8d0",fontFamily:"ui-monospace,monospace"}}>{selDrone.id}</span>
                <button onClick={()=>setSelDrone(null)} style={{background:"none",border:"none",color:"#8b9aae",cursor:"pointer",fontSize:14}}>✕</button>
              </div>
              <div style={{fontSize:11,color:"#8b9aae",marginBottom:8}}>{selDrone.mission}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
                {[["ALT",selDrone.alt.toFixed(0)+"m"],["BAT",selDrone.bat.toFixed(0)+"%"],["STATUS",selDrone.status],["LNG",selDrone.lng.toFixed(4)]].map(([k,v])=>(
                  <div key={k}><div style={{fontSize:9.5,color:"#5a7aa8",textTransform:"uppercase"}}>{k}</div><div style={{fontSize:12,fontWeight:600,color:"#e0e8f2",fontFamily:"ui-monospace,monospace"}}>{v}</div></div>
                ))}
              </div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>showToast(`RTH → ${selDrone.id}`)} style={{...btnSm,background:"rgba(239,68,68,.15)",color:"#ef4444",border:"1px solid rgba(239,68,68,.3)"}}>RTH</button>
                <button onClick={()=>showToast(`${selDrone.id} hovering`)} style={btnSm}>Hover</button>
                <button onClick={()=>showToast(`${selDrone.id} stream`)} style={btnSm}>Stream</button>
              </div>
            </div>
          )}
        </div>

        {/* Right rail */}
        <div style={{width:300,display:"flex",flexDirection:"column",gap:10,overflowY:"auto"}}>
          {/* Layer Controls */}
          <div style={panelStyle}>
            <div style={panelTitle}>Layer Controls</div>
            <div style={{fontSize:11,color:"#8b9aae",marginBottom:10}}>
              {Object.values(layers).filter(Boolean).length}/8 visible
              <span style={{float:"right",color:"#5ab8d0",cursor:"pointer"}} onClick={()=>setLayers({buildings:true,dronePath:true,anomalies:true,windVector:true,sunRay:true,groundGrid:true,labels:true,skillZones:true})}>All on</span>
            </div>
            {(Object.keys(layers) as LayerKey[]).map(k=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:12,color:layers[k]?"#cfd8e3":"#5a7aa8"}}>{LAYER_LABELS[k]}</span>
                <div onClick={()=>toggleLayer(k)} style={{width:36,height:20,borderRadius:999,background:layers[k]?"#4f98a3":"rgba(255,255,255,.1)",cursor:"pointer",position:"relative",transition:"background .2s"}}>
                  <div style={{position:"absolute",top:3,left:layers[k]?18:3,width:14,height:14,borderRadius:"50%",background:"#fff",transition:"left .2s"}} />
                </div>
              </div>
            ))}
          </div>

          {/* Buildings & Zones */}
          <div style={panelStyle}>
            <div style={panelTitle}>Buildings & Zones</div>
            <div style={{fontSize:11,color:"#8b9aae",marginBottom:10}}>{HK_BUILDINGS.length} structures · {drones.filter(d=>d.status==="active").length} active scans</div>
            {HK_BUILDINGS.map(b=>{
              const zones=skillZones.filter(z=>z.buildingId===b.id);
              return (
                <div key={b.id} onClick={()=>flyTo(b)}
                  style={{padding:"8px 10px",marginBottom:5,background:selBuilding?.id===b.id?"rgba(79,152,163,.15)":"rgba(255,255,255,.03)",border:`1px solid ${selBuilding?.id===b.id?"rgba(79,152,163,.5)":"#1a1f26"}`,borderRadius:8,cursor:"pointer"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:12,fontWeight:600,color:"#cfd8e3"}}>{b.name}</div>
                    <div style={{display:"flex",gap:4}}>{zones.map(z=><div key={z.id} title={z.name} style={{width:8,height:8,borderRadius:"50%",background:z.color}} />)}</div>
                  </div>
                  <div style={{fontSize:10.5,color:"#8b9aae",marginTop:2}}>{b.floors}F · {b.height}m · {b.use}</div>
                </div>
              );
            })}
          </div>

          {/* Active Skill Zones */}
          <div style={panelStyle}>
            <div style={panelTitle}>Active Skill Zones</div>
            {skillZones.length===0?(
              <div style={{fontSize:11.5,color:"#5a7aa8"}}>No skills deployed yet</div>
            ):(
              skillZones.map(z=>(
                <div key={z.id} style={{padding:"7px 9px",marginBottom:5,background:"rgba(255,255,255,.03)",border:"1px solid #1a1f26",borderRadius:7}}>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:z.color,boxShadow:`0 0 6px ${z.color}`,flexShrink:0}} />
                    <div style={{fontSize:11.5,color:"#cfd8e3",fontWeight:600}}>{z.name}</div>
                  </div>
                  <div style={{fontSize:10.5,color:"#8b9aae",marginTop:2,marginLeft:15}}>→ {z.buildingId}</div>
                </div>
              ))
            )}
          </div>

          {/* Quick Deploy */}
          <div style={panelStyle}>
            <div style={panelTitle}>Quick Deploy Skill</div>
            <div style={{fontSize:11,color:"#8b9aae",marginBottom:8}}>Click building first, then deploy</div>
            {["Facade Crack Detector","Thermal Anomaly Scanner","SLAM Navigator","Structural Health Monitor","Emergency Response AI","Wind Compensation AI"].map(s=>(
              <button key={s} onClick={()=>deploySkill(s,selBuilding?.id??"ICC")}
                style={{width:"100%",padding:"6px 10px",marginBottom:5,background:"rgba(255,255,255,.04)",border:"1px solid #1a1f26",borderRadius:7,color:"#cfd8e3",fontSize:11,fontWeight:500,cursor:"pointer",textAlign:"left"}}>
                ⚡ {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floor Exploder */}
      {selBuilding&&(
        <div style={{position:"absolute",left:16,top:130,width:260,background:"rgba(6,15,30,.97)",border:"1px solid rgba(79,152,163,.4)",borderRadius:12,padding:16,zIndex:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"#5ab8d0"}}>{selBuilding.name}</div>
              <div style={{fontSize:10.5,color:"#8b9aae",marginTop:1}}>{selBuilding.id} · {selBuilding.floors}F · {selBuilding.height}m</div>
            </div>
            <button onClick={()=>setSelBuilding(null)} style={{background:"none",border:"none",color:"#8b9aae",cursor:"pointer",fontSize:16}}>✕</button>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:11,color:"#8b9aae"}}>Floor Exploder — drag to reveal</span>
              <span style={{fontSize:12,fontWeight:700,color:"#5ab8d0",fontFamily:"ui-monospace,monospace"}}>B/F {visibleFloors}</span>
            </div>
            <input type="range" min={1} max={selBuilding.floors} value={floorSlider}
              onChange={e=>setFloorSlider(parseInt(e.target.value))}
              style={{width:"100%",accentColor:"#4f98a3"}} />
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#5a7aa8",marginTop:2}}>
              <span>B/F 1</span><span>B/F {selBuilding.floors}</span>
            </div>
          </div>
          <div style={{maxHeight:200,overflowY:"auto",display:"flex",flexDirection:"column",gap:3}}>
            {Array.from({length:Math.min(visibleFloors,20)},(_,i)=>{
              const floor=visibleFloors-i;
              const hasAnomaly=floor%13===0||floor%17===0;
              const hasSkill=skillZones.some(z=>z.buildingId===selBuilding.id)&&i<3;
              return (
                <div key={floor} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 8px",background:i===0?"rgba(79,152,163,.15)":"rgba(255,255,255,.02)",border:`1px solid ${i===0?"rgba(79,152,163,.3)":"#1a1f26"}`,borderRadius:5}}>
                  <span style={{fontSize:11,fontFamily:"ui-monospace,monospace",color:i===0?"#5ab8d0":"#8b9aae"}}>F{String(floor).padStart(3,"0")}</span>
                  <div style={{display:"flex",gap:5,alignItems:"center"}}>
                    {hasAnomaly&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:999,background:"rgba(239,68,68,.15)",color:"#ef4444",border:"1px solid rgba(239,68,68,.3)"}}>ANOMALY</span>}
                    {hasSkill&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:999,background:"rgba(79,152,163,.15)",color:"#5ab8d0",border:"1px solid rgba(79,152,163,.3)"}}>SKILL</span>}
                    <span style={{fontSize:10,color:"#5a7aa8"}}>{(selBuilding.height/selBuilding.floors*floor).toFixed(0)}m</span>
                  </div>
                </div>
              );
            })}
            {visibleFloors>20&&<div style={{fontSize:10.5,color:"#5a7aa8",textAlign:"center",padding:4}}>+{visibleFloors-20} more floors</div>}
          </div>
          <div style={{display:"flex",gap:6,marginTop:10}}>
            <button onClick={()=>showToast(`MBIS data for ${selBuilding.name} loaded`)} style={{...btnSm,flex:1}}>MBIS Data</button>
            <button onClick={()=>showToast(`CAD export started`)} style={{...btnSm,flex:1}}>Export CAD</button>
          </div>
        </div>
      )}

      {toast&&<div style={{position:"fixed",bottom:20,right:20,zIndex:9999,padding:"10px 14px",background:"rgba(6,15,30,.95)",border:"1px solid rgba(79,152,163,.4)",borderRadius:10,fontSize:12,color:"#e0e8f2",fontWeight:500}}>{toast}</div>}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .mapboxgl-ctrl-logo,.mapboxgl-ctrl-attrib{display:none!important}`}</style>
    </div>
  );
}

const panelStyle:React.CSSProperties={background:"linear-gradient(180deg,rgba(218,226,236,.06),rgba(202,213,224,.03))",border:"1px solid #1a1f26",borderRadius:11,padding:"12px 14px"};
const panelTitle:React.CSSProperties={fontSize:12,fontWeight:700,color:"#5ab8d0",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10};
const pill:React.CSSProperties={padding:"3px 10px",background:"rgba(79,152,163,.1)",border:"1px solid rgba(79,152,163,.2)",borderRadius:6,fontSize:11,fontFamily:"ui-monospace,monospace",color:"#5ab8d0"};
const btnBase:React.CSSProperties={padding:"5px 12px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",border:"none"};
const btnT:React.CSSProperties={...btnBase,background:"linear-gradient(135deg,#2e6b74,#4f98a3)",color:"#fff"};
const btnG:React.CSSProperties={...btnBase,background:"rgba(255,255,255,.06)",border:"1px solid #1a1f26",color:"#cfd8e3"};
const btnSm:React.CSSProperties={padding:"3px 8px",borderRadius:5,fontSize:10,fontWeight:600,cursor:"pointer",background:"rgba(255,255,255,.05)",border:"1px solid #1a1f26",color:"#cfd8e3"};
