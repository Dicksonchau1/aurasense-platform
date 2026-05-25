import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAgents, createAgent } from '../lib/agents';

// STUB: Update and delete agent hooks for build
export function useUpdateAgent() {
  return { mutate: () => { throw new Error('useUpdateAgent not implemented'); } };
}

export function useDeleteAgent() {
  return { mutate: () => { throw new Error('useDeleteAgent not implemented'); } };
}

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}
