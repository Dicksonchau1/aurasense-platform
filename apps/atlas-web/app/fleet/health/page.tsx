import React, { useEffect, useState } from 'react';

interface RobotHealth {
  robotId: string;
  healthScore: number;
  rul: number;
  recommendedAction: string;
}

export default function FleetHealthPage() {
  const [robots, setRobots] = useState<RobotHealth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/fleet/health');
        const data = await res.json();
        setRobots(data.robots || []);
      } catch {
        setRobots([]);
      }
      setLoading(false);
      timer = setTimeout(fetchData, 5000);
    };
    fetchData();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <h1>Fleet Health</h1>
      {loading && <p>Loading...</p>}
      <table>
        <thead>
          <tr>
            <th>Robot ID</th>
            <th>Health Score</th>
            <th>RUL (hrs)</th>
            <th>Recommended Action</th>
          </tr>
        </thead>
        <tbody>
          {robots.map(r => (
            <tr key={r.robotId}>
              <td>{r.robotId}</td>
              <td>{r.healthScore.toFixed(2)}</td>
              <td>{r.rul.toFixed(1)}</td>
              <td>{r.recommendedAction}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
