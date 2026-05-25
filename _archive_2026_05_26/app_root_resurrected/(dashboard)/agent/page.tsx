import { useAgents } from '../../src/hooks/use-agents';
import { useState } from 'react';

export default function AgentDetail() {
  // For demo, pick the first agent as the current one
  let agents: any[] = [];
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    agents = (typeof useAgents === 'function' ? useAgents()?.data : []) || [];
  } catch (e) {
    agents = [];
  }
  const [currentId] = agents.length > 0 ? [agents[0].id] : [''];
  const currentAgent = agents.find(a => a.id === currentId);
  const coResidents = currentAgent && currentAgent.substrate_run_id
    ? agents.filter(a => a.substrate_run_id === currentAgent.substrate_run_id && a.id !== currentAgent.id)
    : [];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Agent / Drone Detail</h1>
      <div className="card p-6 mb-8">
        {/* 3D Model Viewer Placeholder */}
        <div className="h-64 bg-gray-100 rounded mb-4 flex items-center justify-center">3D Model Viewer</div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="card p-4">Name: {currentAgent?.name || '—'}</div>
          <div className="card p-4">Status: Active</div>
          <div className="card p-4">Substrate Run ID: {currentAgent?.substrate_run_id || '—'}</div>
          <div className="card p-4">Type: {currentAgent?.type || '—'}</div>
        </div>
        <div className="card p-4 mb-4">Mission History Timeline</div>
        <div className="card p-4 mb-4">Send Command Panel</div>
        {/* Co-resident agents panel */}
        <div className="card p-4 mt-4">
          <h2 className="text-lg font-semibold mb-2">Co-resident Agents</h2>
          {coResidents.length > 0 ? (
            <ul>
              {coResidents.map(agent => (
                <li key={agent.id} className="mb-1 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                  <span className="font-medium">{agent.name}</span>
                  <span className="text-xs text-gray-500">Active</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-xs text-gray-400">No other agents co-resident</div>
          )}
        </div>
      </div>
    </div>
  );
}
// Agent/Drone Detail Page
import { useAgents } from '../../src/hooks/use-agents';
import { useState } from 'react';

export default function AgentDetail() {
  // For demo, pick the first agent as the current one
  let agents: any[] = [];
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    agents = (typeof useAgents === 'function' ? useAgents()?.data : []) || [];
  } catch (e) {
    agents = [];
  }
  const [currentId] = agents.length > 0 ? [agents[0].id] : [''];
  const currentAgent = agents.find(a => a.id === currentId);
  const coResidents = agents.filter(a => a.id !== currentId);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Agent / Drone Detail</h1>
      <div className="card p-6 mb-8">
        {/* 3D Model Viewer Placeholder */}
        <div className="h-64 bg-gray-100 rounded mb-4 flex items-center justify-center">3D Model Viewer</div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="card p-4">Speed: 12 m/s</div>
          <div className="card p-4">Battery: 87%</div>
          <div className="card p-4">NERM: OK</div>
          <div className="card p-4">Status: Active</div>
        </div>
        <div className="card p-4 mb-4">Mission History Timeline</div>
        <div className="card p-4 mb-4">Send Command Panel</div>
        {/* Co-resident agents panel */}
        <div className="card p-4 mt-4">
          <h2 className="text-lg font-semibold mb-2">Co-resident Agents</h2>
          {coResidents.length > 0 ? (
            <ul>
              {coResidents.map(agent => (
                <li key={agent.id} className="mb-1 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                  <span className="font-medium">{agent.name}</span>
                  <span className="text-xs text-gray-500">Active</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-xs text-gray-400">No other agents co-resident</div>
          )}
        </div>
      </div>
    </div>
  );
}