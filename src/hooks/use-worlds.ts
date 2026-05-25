import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWorlds, createWorld, updateWorld, deleteWorld } from '../lib/worlds';
export function useUpdateWorld() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateWorld(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worlds'] });
    },
  });
}

export function useDeleteWorld() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteWorld(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worlds'] });
    },
  });
}

export function useWorlds() {
  return useQuery({
    queryKey: ['worlds'],
    queryFn: fetchWorlds,
  });
}

export function useCreateWorld() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorld,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worlds'] });
    },
  });
}
