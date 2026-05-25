"use client";
import { useWorlds, useCreateWorld, useUpdateWorld, useDeleteWorld } from '../../hooks/use-worlds';
import { useState } from 'react';

export default function WorldsManager() {
  const { data: worlds, isLoading } = useWorlds();
  const createWorld = useCreateWorld();
  const updateWorld = useUpdateWorld();
  const deleteWorld = useDeleteWorld();
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });

  if (isLoading) return <div>Loading worlds...</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Worlds</h2>
      <form
        className="mb-4 flex flex-col gap-2"
        onSubmit={e => {
          e.preventDefault();
          if (editing !== null) {
            updateWorld.mutate({ id: editing, data: form });
          } else {
            createWorld.mutate(form);
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
          disabled={createWorld.isLoading || updateWorld.isLoading}
        >
          {editing !== null ? 'Update World' : 'Create World'}
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
        {worlds?.map((world: any) => (
          <li key={world.id} className="py-2 flex items-center justify-between">
            <div>
              <div className="font-semibold">{world.name}</div>
              <div className="text-sm text-gray-600">{world.description}</div>
            </div>
            <div className="flex gap-2">
              <button
                className="text-blue-600 underline"
                onClick={() => {
                  setEditing(world.id);
                  setForm({ name: world.name, description: world.description });
                }}
              >Edit</button>
              <button
                className="text-red-600 underline"
                onClick={() => deleteWorld.mutate(world.id)}
                disabled={deleteWorld.isLoading}
              >Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
