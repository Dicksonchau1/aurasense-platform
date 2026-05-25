'use client';
import { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { supabase } from '@/lib/supabase';

export default function ReplayPage({ promotionId }:{ promotionId:string }) {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    (async () => {
      const { data: promo } = await supabase
        .from('mission_promotions')
        .select('*, scene_snapshots(*), approval_reviews(*)')
        .eq('id', promotionId).single();
      setData(promo);
    })();
  }, [promotionId]);
  if (!data) return <div className="p-6">Loading…</div>;

  return (
    <div className="grid grid-cols-[1fr_360px] h-screen">
      <Canvas shadows camera={{ position: [12, 10, 12], fov: 55 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[20,30,10]} intensity={1.0} castShadow />
        <Physics paused={false} timeStep={1/60} gravity={[0,-9.81,0]}>
          <SnapshotScene url={data.scene_snapshots.scene_url} />
          <ReplayDrone trajectory={data.trajectory} />
        </Physics>
      </Canvas>
      <ReplayPanel data={data} />
    </div>
  );
}

function SnapshotScene({ url }:{ url:string }) {
  const { scene } = useGLTF(url);
  return scene.children.map((c, i) => (
    <RigidBody key={i} type="fixed" colliders="trimesh"><primitive object={c}/></RigidBody>
  ));
}

function ReplayDrone({ trajectory }:{ trajectory:{ actions: any[]; dt: number }}) {
  // Deterministic: feed trajectory.actions into the physics loop one per step,
  // same fixed dt as promotion-time. Rapier with fixed seed reproduces exactly.
  // Implementation mirrors DroneRigidBody but reads actions from trajectory[i++].
  return null; // (full body identical to DroneRigidBody, indexed playback)
}

function ReplayPanel({ data }:{ data:any }) {
  return (
    <aside className="border-l p-4 overflow-y-auto text-sm">
      <h3 className="font-semibold mb-2">Promotion {data.id.slice(0,8)}</h3>
      <p>Approved by: <code>{data.human_approver_email ?? data.approver_id}</code></p>
      <p>At: {new Date(data.promoted_at).toLocaleString()}</p>
      <p>Status: <code>{data.status}</code></p>
      <h4 className="mt-3 font-semibold">Justification</h4>
      <p className="whitespace-pre-wrap">{data.human_justification ?? '—'}</p>
      <h4 className="mt-3 font-semibold">Approval reasons</h4>
      <ul className="list-disc pl-5">
        {data.approval.reasons.map((r:string,i:number)=> <li key={i}>{r}</li>)}
      </ul>
      <h4 className="mt-3 font-semibold">Scene snapshot</h4>
      <p>Hash: <code className="break-all">{data.scene_snapshots.scene_hash}</code></p>
    </aside>
  );
}