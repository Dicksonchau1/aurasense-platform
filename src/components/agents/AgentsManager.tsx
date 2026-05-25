"use client";
import { useAgents, useCreateAgent, useUpdateAgent, useDeleteAgent } from '../../hooks/use-agents';
import { useState } from 'react';

export default function AgentsManager() {
  const { data: agents, isLoading } = useAgents();
  const createAgent = useCreateAgent();
  const updateAgent = useUpdateAgent();
  const deleteAgent = useDeleteAgent();
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });

  if (isLoading) return <div>Loading agents...</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Agents</h2>
      <form
        className="mb-4 flex flex-col gap-2"
        onSubmit={e => {
          e.preventDefault();
          if (editing !== null) {
            updateAgent.mutate({ id: editing, data: form });
          } else {
            createAgent.mutate(form);
          }
          setForm({ name: '', description: '' });
          setEditing(null);
        }}
      >
        <input
          className="border p-2 rounded"
          placeholder="Name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
        <input
          className="border p-2 rounded"
          placeholder="Description"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
          type="submit"
          disabled={createAgent.isLoading || updateAgent.isLoading}
        >
          {editing !== null ? 'Update Agent' : 'Create Agent'}
        </button>
        {editing !== null && (
          <button
            type="button"
            className="text-gray-500 underline"
            onClick={() => {
              setEditing(null);
              setForm({ name: '', description: '' });
            }}
          >Cancel Edit</button>
        )}
      </form>
      <ul className="divide-y">
        {agents?.map((agent: any) => (
          <li key={agent.id} className="py-2 flex items-center justify-between">
            <div>
              <div className="font-semibold">{agent.name}</div>
              <div className="text-sm text-gray-600">{agent.description}</div>
            </div>
            <div className="flex gap-2">
              <button
                className="text-blue-600 underline"
                onClick={() => {
                  setEditing(agent.id);
                  setForm({ name: agent.name, description: agent.description });
                }}
              >Edit</button>
              <button
                className="text-red-600 underline"
                onClick={() => deleteAgent.mutate(agent.id)}
                disabled={deleteAgent.isLoading}
              >Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
