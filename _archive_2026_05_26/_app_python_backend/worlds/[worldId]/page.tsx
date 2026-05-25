'use client';

import { MissionCreateForm } from '@/components/mission-create-form';
import { useBuilding } from '@/hooks/use-building';
import { useMissionsByBuilding } from '@/hooks/use-missions-by-building';
import MissionsManager from '@/components/missions/MissionsManager';

export default function WorldDetailPage({ params }: { params: { worldId: string } }) {
  const { building, loading, error } = useBuilding(params.worldId);
  const { missions, loading: missionsLoading, error: missionsError } = useMissionsByBuilding(params.worldId);

  if (loading) {
    return <section className="atlas-panel p-6 text-sm text-slate-400">Loading building workspace...</section>;
  }

  if (error || !building) {
    return <section className="atlas-panel p-6 text-sm text-rose-300">{error || 'Building not found.'}</section>;
  }

  return (
    <section className="space-y-6">
      <div className="atlas-panel p-6 sm:p-8">
        <p className="atlas-label">Building workspace</p>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{building.name_en}</h1>
        <p className="mt-2 text-sm text-slate-400">{building.name_zh}</p>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <div className="atlas-kpi"><p className="atlas-label">MBIS ID</p><p className="mt-3 text-xl font-semibold text-white">{building.mbis_id}</p></div>
          <div className="atlas-kpi"><p className="atlas-label">District</p><p className="mt-3 text-xl font-semibold text-white">{building.district}</p></div>
          <div className="atlas-kpi"><p className="atlas-label">Faces</p><p className="mt-3 text-xl font-semibold text-white">{building.faces.length}</p></div>
          <div className="atlas-kpi"><p className="atlas-label">Height</p><p className="mt-3 text-xl font-semibold text-white">{building.height_m} m</p></div>
        </div>
      </div>

      <MissionCreateForm mbisId={building.mbis_id} />


      <div className="atlas-panel p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Missions for this building</h2>
        {missionsLoading && <div className="text-slate-400">Loading missions...</div>}
        {missionsError && <div className="text-rose-300">Error loading missions: {missionsError}</div>}
        {!missionsLoading && !missionsError && missions.length === 0 && (
          <div className="text-slate-400">No missions found for this building.</div>
        )}
        {!missionsLoading && !missionsError && missions.length > 0 && (
          <ul className="divide-y divide-white/10">
            {missions.map((mission) => (
              <li key={mission.id} className="py-3">
                <a
                  href={`/worlds/${params.worldId}/missions/${mission.id}`}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:bg-white/[0.04] rounded-xl px-2 py-1 transition"
                >
                  <div>
                    <span className="font-semibold text-white">{mission.label || mission.id}</span>
                    <span className="ml-2 text-xs text-slate-400">{mission.state}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Created: {new Date(mission.created_at).toLocaleString()}
                    {mission.completed_at && (
                      <span> &middot; Completed: {new Date(mission.completed_at).toLocaleString()}</span>
                    )}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Embedded full Missions CRUD manager for global/advanced operations */}
      <div className="atlas-panel p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-white mb-4">All Missions (Admin/Global)</h2>
        <MissionsManager />
      </div>

      <div className="atlas-panel p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-white">Facade faces</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {building.faces.map((face) => (
            <div key={face.face_id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-white">{face.face_id}</p>
                <span className="text-xs text-slate-400">{face.azimuth_deg}°</span>
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-400">
                <p>Area: <span className="text-white">{face.area_m2} m²</span></p>
                <p>Panels: <span className="text-white">{face.panel_grid.cols} × {face.panel_grid.rows}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
