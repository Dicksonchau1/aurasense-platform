// Mission Simulation Page
import { useMissionSimulations } from '../../../hooks/useMissionSimulations';

export default function MissionSimulation() {
  const { simulations, loading, error } = useMissionSimulations();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Mission Simulation</h1>
      <div className="card p-6 mb-8">
        {/* 3D Scene Placeholder */}
        <div className="h-96 bg-gray-100 rounded mb-4 flex items-center justify-center">3D Scene</div>
        <div className="flex gap-4 mb-4">
          <button className="btn btn-primary">Play</button>
          <button className="btn btn-primary">Pause</button>
          <button className="btn btn-primary">Step</button>
        </div>
        <div className="card p-4">
          <h2 className="font-semibold mb-2">Mission Simulations</h2>
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}
          <ul className="space-y-2">
            {simulations.map(sim => (
              <li key={sim.id} className="border-b pb-2">
                <div><b>Mission:</b> {sim.mission_id}</div>
                <div><b>Status:</b> {sim.status}</div>
                <div><b>Started:</b> {sim.started_at}</div>
                <div><b>Ended:</b> {sim.ended_at}</div>
                <div><b>Log:</b> {sim.log}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}