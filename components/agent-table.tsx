import { Agent } from '@/lib/types';

function badge(status: Agent['status']) {
  if (status === 'online') return 'bg-emerald-500/15 text-emerald-300';
  if (status === 'busy') return 'bg-amber-500/15 text-amber-300';
  return 'bg-slate-700 text-slate-300';
}

export function AgentTable({ agents }: { agents: Agent[] }) {
  return (
    <div className="mobile-stack-table overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
      <table className="min-w-full divide-y divide-white/5 text-sm">
        <thead className="bg-white/[0.02]">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-slate-500">Name</th>
            <th className="px-4 py-3 text-left font-medium text-slate-500">Role</th>
            <th className="px-4 py-3 text-left font-medium text-slate-500">Model</th>
            <th className="px-4 py-3 text-left font-medium text-slate-500">Throughput</th>
            <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
            <th className="px-4 py-3 text-left font-medium text-slate-500">Last seen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {agents.map((agent) => (
            <tr key={agent.id} className="hover:bg-white/[0.02]">
              <td className="px-4 py-3 font-medium text-white">{agent.name}</td>
              <td className="px-4 py-3 text-slate-300">{agent.role}</td>
              <td className="px-4 py-3 text-slate-300">{agent.model || 'N/A'}</td>
              <td className="px-4 py-3 text-slate-300">{agent.throughputPerMin ?? '-'} / min</td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${badge(agent.status)}`}>
                  {agent.status}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-300">{new Date(agent.lastSeenAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
