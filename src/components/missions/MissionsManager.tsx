"use client"
import { useMissions, useCreateMission, useUpdateMission, useDeleteMission } from '../../hooks/use-missions';
import { useState } from 'react';

export default function MissionsManager() {
  const { data: missions, isLoading } = useMissions();
  const createMission = useCreateMission();
  const updateMission = useUpdateMission();
  const deleteMission = useDeleteMission();
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });

  if (isLoading) return <div>Loading missions...</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Missions</h2>
      <form
        className="mb-4 flex flex-col gap-2"
        onSubmit={e => {
          e.preventDefault();
          if (editing !== null) {
            updateMission.mutate({ id: editing, data: form });
          } else {
            createMission.mutate(form);
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
          disabled={createMission.isLoading || updateMission.isLoading}
        >
          {editing !== null ? 'Update Mission' : 'Create Mission'}
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
        {missions?.map((mission: any) => (
          <li key={mission.id} className="py-2 flex items-center justify-between">
            <div>
              <div className="font-semibold">{mission.name}</div>
              <div className="text-sm text-gray-600">{mission.description}</div>
            </div>
            <div className="flex gap-2">
              <button
                className="text-blue-600 underline"
                onClick={() => {
                  setEditing(mission.id);
                  setForm({ name: mission.name, description: mission.description });
                }}
              >Edit</button>
              <button
                className="text-red-600 underline"
                onClick={() => deleteMission.mutate(mission.id)}
                disabled={deleteMission.isLoading}
              >Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
