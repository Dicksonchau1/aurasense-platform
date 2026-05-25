import { useEffect, useState } from "react";
import { logError, fetchWithRetry, getAuthErrorMessage } from "./errorUtils";

export interface Drone {
  id: string;
  model: string;
  status: string;
  battery: number;
  region: string;
}

export function useDrones() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchWithRetry("/api/registry/drones")
      .then(async res => {
        if (!res.ok) {
          const authMsg = getAuthErrorMessage(res.status);
          if (authMsg) setError(authMsg);
          else setError(`Failed to load drones: HTTP ${res.status}`);
          logError(`Drones API error: ${res.status}`, "useDrones");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setDrones(data?.units || []);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        logError(e, "useDrones");
        setLoading(false);
      });
  }, []);

  return { drones, loading, error };
}