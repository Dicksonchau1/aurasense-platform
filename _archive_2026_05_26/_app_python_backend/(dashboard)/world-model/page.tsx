"use client";
// World Model Page
import { useWorldModel } from '../../../hooks/useWorldModel';

export default function WorldModel() {
  const { models, loading, error } = useWorldModel();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">World Model</h1>
      <div className="card p-6 mb-8">
        {/* 3D Terrain/Zone Visualization Placeholder */}
        <div className="h-80 bg-gray-100 rounded mb-4 flex items-center justify-center">3D Terrain/Zone Visualization</div>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        <div className="card p-4 mb-4">
          <b>Zones/Obstacles List</b>
          <ul className="mt-2">
            {models.map(model => (
              <li key={model.id}>
                <b>{model.name}</b> (updated {model.updated_at})<br />
                Zones: {model.zones}
              </li>
            ))}
          </ul>
        </div>
        <button className="btn btn-primary">Edit World</button>
      </div>
    </div>
  );
}