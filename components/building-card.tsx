import Link from 'next/link';
import { MBISBuilding } from '@/lib/rehearse-types';

export function BuildingCard({ building }: { building: MBISBuilding }) {
  return (
    <Link href={`/worlds/${building.mbis_id}`} className="atlas-panel-soft block p-5 transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.04]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{building.name_en}</h3>
          <p className="mt-1 text-sm text-slate-400">{building.name_zh}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-slate-300">{building.district}</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-400">
        <div>
          <p className="atlas-label">MBIS ID</p>
          <p className="mt-2 font-medium text-white">{building.mbis_id}</p>
        </div>
        <div>
          <p className="atlas-label">Faces</p>
          <p className="mt-2 font-medium text-white">{building.faces.length}</p>
        </div>
        <div>
          <p className="atlas-label">Height</p>
          <p className="mt-2 font-medium text-white">{building.height_m} m</p>
        </div>
        <div>
          <p className="atlas-label">Floors</p>
          <p className="mt-2 font-medium text-white">{building.floors}</p>
        </div>
      </div>
    </Link>
  );
}
