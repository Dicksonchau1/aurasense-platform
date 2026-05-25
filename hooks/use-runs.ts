import useSWR from 'swr';

export function useRuns() {
  const { data, error, isLoading } = useSWR('/aurasense-platform/api/nepa/missions/active', async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch runs');
    return res.json();
  });
  return {
    runs: data,
    isLoading,
    isError: !!error,
  };
}
