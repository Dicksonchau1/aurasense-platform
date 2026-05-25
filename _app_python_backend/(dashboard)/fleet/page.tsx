import { useDrones } from '../../../hooks/useDrones';
import { useAgents } from '../../src/components/agents/AgentsManager';

export default function FleetOverview() {
  const { drones, loading, error } = useDrones();
  let agents: any[] = [];
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    agents = (typeof useAgents === 'function' ? useAgents()?.data : []) || [];
  } catch (e) {
    agents = [];
  }

  // Find co-resident substrate_run_ids
  const substrateMap: Record<string, any[]> = {};
  agents.forEach((agent: any) => {
    if (agent.substrate_run_id) {
      if (!substrateMap[agent.substrate_run_id]) substrateMap[agent.substrate_run_id] = [];
      substrateMap[agent.substrate_run_id].push(agent);
    }
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Fleet Overview</h1>
      <div className="card p-6 mb-8">
        {(loading) && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>NERM</th>
              <th>Battery</th>
              <th>Location</th>
              <th>Type</th>
              <th>Co-Resident</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Show agents as active rows */}
            {agents && agents.length > 0 && agents.map((agent: any) => (
              <tr key={agent.id} className="bg-green-50">
                <td>{agent.name}</td>
                <td><span className="badge bg-green-100 text-green-700">Active</span></td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
                <td>Agent</td>
                <td>
                  {agent.substrate_run_id && substrateMap[agent.substrate_run_id]?.length > 1 ? (
                    <span className="text-xs text-blue-700">{substrateMap[agent.substrate_run_id].length - 1} co-resident</span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td>
                  <button className="btn btn-sm btn-ghost">Details</button>
                </td>
              </tr>
            ))}
            {/* Show drones as usual */}
            {drones.map(drone => (
              <tr key={drone.id}>
                <td>{drone.id}</td>
                <td><span className="badge bg-green-100 text-green-700">{drone.status}</span></td>
                <td>{drone.nerm}</td>
                <td>{drone.battery}%</td>
                <td>{drone.location}</td>
                <td>Drone</td>
                <td><span className="text-xs text-gray-400">—</span></td>
                <td>
                  <button className="btn btn-sm btn-ghost">Land</button>
                  <button className="btn btn-sm btn-ghost">Return</button>
                  <button className="btn btn-sm btn-ghost">Urgency</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card p-6">{/* 3D mini-map or maplibre/three.js here */}</div>
    </div>
  );
}
// Fleet Overview Page

import { useDrones } from '../../../hooks/useDrones';
import { useAgents } from '../../src/components/agents/AgentsManager';

export default function FleetOverview() {
  const { drones, loading, error } = useDrones();
  let agents: any[] = [];
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    agents = (typeof useAgents === 'function' ? useAgents()?.data : []) || [];
  } catch (e) {
    agents = [];
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Fleet Overview</h1>
      <div className="card p-6 mb-8">
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>NERM</th>
              <th>Battery</th>
              <th>Location</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Show agents as active rows */}
            {agents && agents.length > 0 && agents.map((agent: any) => (
              <tr key={agent.id} className="bg-green-50">
                <td>{agent.name}</td>
                <td><span className="badge bg-green-100 text-green-700">Active</span></td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
                <td>Agent</td>
                <td>
                  <button className="btn btn-sm btn-ghost">Details</button>
                </td>
              </tr>
            ))}
            {/* Show drones as usual */}
            {drones.map(drone => (
              <tr key={drone.id}>
                <td>{drone.id}</td>
                <td><span className="badge bg-green-100 text-green-700">{drone.status}</span></td>
                <td>{drone.nerm}</td>
                <td>{drone.battery}%</td>
                <td>{drone.location}</td>
                <td>Drone</td>
                <td>
                  <button className="btn btn-sm btn-ghost">Land</button>
                  <button className="btn btn-sm btn-ghost">Return</button>
                  <button className="btn btn-sm btn-ghost">Urgency</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card p-6">{/* 3D mini-map or maplibre/three.js here */}</div>
    </div>
  );
}
