'use client';
'use client';


import { WorldCard } from '@/components/world-card';
import { useWorlds } from '@/hooks/use-worlds';
import WorldsManager from '@/components/worlds/WorldsManager';
export default function WorldsPage() {

  const { data, loading, error } = useWorlds();

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">Worlds</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Live registry of AuraSense environments and edge nodes.</p>
      </div>

      {loading ? <div className="atlas-panel p-5 text-sm text-slate-400">Loading worlds...</div> : null}
      {error ? <div className="atlas-panel p-5 text-sm text-rose-300">{error}</div> : null}

      <div className="atlas-grid md:grid-cols-2 xl:grid-cols-3">
        {data?.map((world: import('@/lib/types').World) => (
          <WorldCard key={world.id} world={world} />
        ))}
      </div>

      {/* Embedded full Worlds CRUD manager for admin/global operations */}
      <div className="atlas-panel p-5 sm:p-6 mt-8">
        <h2 className="text-lg font-semibold text-white mb-4">All Worlds (Admin/Global)</h2>
        <WorldsManager />
      </div>
    </section>
  );
}
