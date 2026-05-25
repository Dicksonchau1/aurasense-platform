// Mission Planning Page
import { useMissions } from '../../../hooks/useMissions';

export default function MissionPlanner() {
  const { missions, loading, error } = useMissions();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Mission Planner</h1>
      <div className="card p-6 mb-8">{/* 3D map, waypoint editor, assign drone, simulate/deploy */}</div>
      <div className="card p-6">
        <h2 className="font-semibold mb-4">Missions</h2>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th>Mission ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Assigned Drone</th>
              <th>Start</th>
              <th>End</th>
            </tr>
          </thead>
          <tbody>
            {missions.map(mission => (
              <tr key={mission.id}>
                <td>{mission.id}</td>
                <td>{mission.name}</td>
                <td>{mission.status}</td>
                <td>{mission.assigned_drone}</td>
                <td>{mission.start_time}</td>
                <td>{mission.end_time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card p-4 mt-6">Assign Drone</div>
      <div className="flex gap-4 mt-4">
        <button className="btn btn-primary">Simulate</button>
        <button className="btn btn-primary">Deploy</button>
      </div>
    </div>
  );
}