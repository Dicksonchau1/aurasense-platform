
import React, { useEffect, useRef, useState } from 'react';
// Simple sparkline component
const Sparkline: React.FC<{ data: number[] }> = ({ data }) => (
  <svg width={100} height={24} style={{ background: '#f5f5f5' }}>
    {data.length > 1 && data.map((v, i, arr) => (
      i === 0 ? null : (
        <line
          key={i}
          x1={((i - 1) / (arr.length - 1)) * 100}
          y1={24 - arr[i - 1] / 100 * 24}
          x2={(i / (arr.length - 1)) * 100}
          y2={24 - v / 100 * 24}
          stroke="#1976d2"
          strokeWidth={2}
        />
      )
    ))}
  </svg>
);

interface SwapEvent {
  event_id: string;
  robot_id: string;
  bay_id: string;
  event_type: string;
  ts: string;
  chain_hash: string;
}

const WS_URL = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_SWAP_EVENT_WS_URL || 'ws://localhost:8765') : '';

const PowerDashboardPage: React.FC = () => {
  const [events, setEvents] = useState<SwapEvent[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!WS_URL) return;
    const ws = new window.WebSocket(WS_URL);
    wsRef.current = ws;
    ws.onmessage = (msg) => {
      try {
        const event: SwapEvent = JSON.parse(msg.data);
        setEvents((prev) => [event, ...prev.slice(0, 49)]); // keep last 50 events
      } catch (e) {
        // ignore
      }
    };
    ws.onerror = (err) => {
      // Optionally handle error
    };
    return () => {
      ws.close();
    };
  }, []);


  // Real data state
  const [robots, setRobots] = useState<{ id: string; soc: number[] }[]>([]);
  const [bays, setBays] = useState<{ id: string; state: string; queue: number }[]>([]);
  const [inventory, setInventory] = useState<{ serial: string; health: number; location: string }[]>([]);

  useEffect(() => {
    fetch('/api/power/robots').then(r => r.json()).then(setRobots).catch(() => {});
    fetch('/api/power/bays').then(r => r.json()).then(setBays).catch(() => {});
    fetch('/api/power/inventory').then(r => r.json()).then(setInventory).catch(() => {});
    const interval = setInterval(() => {
      fetch('/api/power/robots').then(r => r.json()).then(setRobots).catch(() => {});
      fetch('/api/power/bays').then(r => r.json()).then(setBays).catch(() => {});
      fetch('/api/power/inventory').then(r => r.json()).then(setInventory).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Fleet Power Dashboard</h1>
      <h2>Per-Robot SOC Sparklines</h2>
      <div style={{ display: 'flex', gap: 24 }}>
        {robots.map(r => (
          <div key={r.id} style={{ textAlign: 'center' }}>
            <div>{r.id}</div>
            <Sparkline data={r.soc} />
            <div>Current: {r.soc.length ? r.soc[r.soc.length - 1] : '-'}%</div>
          </div>
        ))}
      </div>

      <h2>Bay Occupancy</h2>
      <table style={{ width: '100%', marginBottom: 24 }}>
        <thead>
          <tr>
            <th>Bay</th>
            <th>State</th>
            <th>Queue</th>
          </tr>
        </thead>
        <tbody>
          {bays.map(b => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.state}</td>
              <td>{b.queue}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Battery Inventory</h2>
      <table style={{ width: '100%', marginBottom: 24 }}>
        <thead>
          <tr>
            <th>Serial</th>
            <th>Health %</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map(bat => (
            <tr key={bat.serial}>
              <td>{bat.serial}</td>
              <td>{bat.health}</td>
              <td>{bat.location}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Live Swap Events (last 50)</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Time</th>
            <th>Robot</th>
            <th>Bay</th>
            <th>Type</th>
            <th>Chain Hash</th>
          </tr>
        </thead>
        <tbody>
          {events.map(ev => (
            <tr key={ev.event_id}>
              <td>{new Date(ev.ts).toLocaleTimeString()}</td>
              <td>{ev.robot_id}</td>
              <td>{ev.bay_id}</td>
              <td>{ev.event_type}</td>
              <td style={{ fontSize: '0.7em', wordBreak: 'break-all' }}>{ev.chain_hash.slice(0, 12)}…</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PowerDashboardPage;
