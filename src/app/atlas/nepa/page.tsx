'use client';

import React from 'react'
import { useStdpSnapshot } from '@/lib/atlas/hooks-nepa'
import { usePipelineStatus } from '@/lib/atlas/hooks-pipeline'
import { useWorldModelSnapshot } from '@/lib/atlas/hooks-worldmodel'
import { useArduPilotLink, useArduPilotModes, useArduPilotCalibration } from '@/lib/atlas/hooks-ardupilot'

function StdpActivityPanel() {
  const { data, loading, error } = useStdpSnapshot();
  // For sparkline, keep a short history in state
  const [history, setHistory] = React.useState<number[]>([]);
  React.useEffect(() => {
    if (data?.spike_rate_hz != null) {
      setHistory(h => {
        const next = [...h, data.spike_rate_hz];
        return next.length > 32 ? next.slice(next.length - 32) : next;
      });
    }
  }, [data?.spike_rate_hz]);

  return (
    <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-5 flex flex-col h-full min-h-[220px]">
      <div className="font-mono text-xs text-emerald-400 mb-2 tracking-widest">STDP ACTIVITY</div>
      {loading ? (
        <div className="text-zinc-500 text-xs">LoadingÃ¢â‚¬Â¦</div>
      ) : error ? (
        <div className="text-red-400 text-xs">{error}</div>
      ) : data ? (
        <>
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="flex flex-col items-center">
              <div className="text-lg font-mono text-emerald-300">{data.spike_rate_hz?.toFixed(1) ?? 'Ã¢â‚¬â€œ'}</div>
              <div className="text-[10px] text-zinc-400">Spike Hz</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-lg font-mono text-emerald-300">{data.sparsity != null ? (data.sparsity * 100).toFixed(1) : 'Ã¢â‚¬â€œ'}%</div>
              <div className="text-[10px] text-zinc-400">Sparsity</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-lg font-mono text-emerald-300">{data.plasticity_events ?? 'Ã¢â‚¬â€œ'}</div>
              <div className="text-[10px] text-zinc-400">Plasticity</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-lg font-mono text-emerald-300">{data.energy_w?.toFixed(2) ?? 'Ã¢â‚¬â€œ'}</div>
              <div className="text-[10px] text-zinc-400">Energy (W)</div>
            </div>
          </div>
          {/* Sparkline for spike rate */}
          <div className="flex-1 flex flex-col justify-end">
            <svg width="100%" height="48" viewBox="0 0 128 48" className="w-full h-12">
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                points={history.length > 1
                  ? history.map((v, i) => {
                      const x = (i / (history.length - 1)) * 128;
                      // Normalize y: invert so higher Hz is higher up
                      const min = Math.min(...history);
                      const max = Math.max(...history);
                      const y = max > min ? 48 - ((v - min) / (max - min)) * 44 - 2 : 24;
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    }).join(' ')
                  : ''}
              />
            </svg>
            <div className="text-[10px] text-zinc-500 text-right">Spike Hz (last 32)</div>
          </div>
        </>
      ) : (
        <div className="text-zinc-500 text-xs">No data</div>
      )}
    </div>
  );
}

// Placeholder components for the other panes
function PipelineMonitorPane() {
  const { data, loading, error } = usePipelineStatus();
  return (
    <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-5 flex flex-col h-full min-h-[220px]">
      <div className="font-mono text-xs text-cyan-400 mb-2 tracking-widest">PIPELINE MONITOR</div>
      {loading ? (
        <div className="text-zinc-500 text-xs">LoadingÃ¢â‚¬Â¦</div>
      ) : error ? (
        <div className="text-red-400 text-xs">{error}</div>
      ) : data ? (
        <>
          <ul className="flex-1 space-y-1 mb-2">
            {data.stages.map((stage) => (
              <li key={stage.name} className="flex items-center gap-2 text-xs text-zinc-200">
                <span className={`inline-block w-2 h-2 rounded-full ${stage.status==='healthy'?'bg-emerald-400 animate-pulse':'bg-red-400'}`} />
                <span className="font-mono">{stage.name}</span>
                <span className="ml-auto text-zinc-400">{stage.throughput_hz.toFixed(1)} Hz</span>
                <span className="ml-2 text-zinc-500">{stage.latency_ms.toFixed(2)} ms</span>
              </li>
            ))}
          </ul>
          <div className="text-[10px] text-zinc-500 text-right">Total latency: {data.total_latency_ms.toFixed(2)} ms</div>
        </>
      ) : (
        <div className="text-zinc-500 text-xs">No data</div>
      )}
    </div>
  );
}

function WorldModelVisualiserPane() {
  const { data, loading, error } = useWorldModelSnapshot();
  return (
    <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-5 flex flex-col h-full min-h-[220px]">
      <div className="font-mono text-xs text-fuchsia-400 mb-2 tracking-widest">WORLD MODEL</div>
      {loading ? (
        <div className="text-zinc-500 text-xs">LoadingÃ¢â‚¬Â¦</div>
      ) : error ? (
        <div className="text-red-400 text-xs">{error}</div>
      ) : data ? (
        <>
          <div className="flex-1 flex flex-col items-center justify-center mb-2">
            <div className="w-24 h-24 bg-gradient-to-br from-fuchsia-800/40 to-fuchsia-400/10 rounded-lg mb-2 flex items-center justify-center">
              <span className="text-3xl text-fuchsia-300 font-mono">Ã°Å¸Â§Â </span>
            </div>
            <div className="text-xs text-zinc-400">Occupancy: {data.occupancy_grid?.length ?? 0} cells</div>
            <div className="text-xs text-zinc-400">Pred. error: {data.prediction_error_history?.at(-1)?.toFixed(3) ?? 'Ã¢â‚¬â€œ'}</div>
            <div className="text-xs text-zinc-400">Latent dim: {data.latent_projection?.length ?? 0}</div>
          </div>
        </>
      ) : (
        <div className="text-zinc-500 text-xs">No data</div>
      )}
    </div>
  );
}

function ArduPilotIntegrationConsolePane() {
  const [tab, setTab] = React.useState<'link'|'modes'|'calibration'>('link');
  // Hooks for each tab
  const link = useArduPilotLink();
  const modes = useArduPilotModes();
  const calibration = useArduPilotCalibration();
  return (
    <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-5 flex flex-col h-full min-h-[220px]">
      <div className="font-mono text-xs text-yellow-400 mb-2 tracking-widest">ARDUPILOT CONSOLE</div>
      <div className="flex gap-2 mb-2">
        <button className={`px-2 py-1 rounded text-xs font-mono ${tab==='link'?'bg-yellow-700/40 text-yellow-200':'bg-zinc-800 text-zinc-400'}`} onClick={()=>setTab('link')}>Link</button>
        <button className={`px-2 py-1 rounded text-xs font-mono ${tab==='modes'?'bg-yellow-700/40 text-yellow-200':'bg-zinc-800 text-zinc-400'}`} onClick={()=>setTab('modes')}>Modes</button>
        <button className={`px-2 py-1 rounded text-xs font-mono ${tab==='calibration'?'bg-yellow-700/40 text-yellow-200':'bg-zinc-800 text-zinc-400'}`} onClick={()=>setTab('calibration')}>Calibration</button>
      </div>
      <div className="flex-1">
        {tab === 'link' && (
          link.loading ? <div className="text-xs text-zinc-500">LoadingÃ¢â‚¬Â¦</div> :
          link.error ? <div className="text-xs text-red-400">{link.error}</div> :
          link.data ? (
            <div className="space-y-1 text-xs">
              <div>Status: <span className={link.data.connected ? 'text-emerald-400' : 'text-red-400'}>{link.data.connected ? 'Connected' : 'Disconnected'}</span></div>
              <div>Vehicle ID: <span className="text-zinc-300">{link.data.vehicle_id}</span></div>
              <div>Last heartbeat: <span className="text-zinc-300">{new Date(link.data.last_heartbeat).toLocaleTimeString()}</span></div>
              <div>RSSI: <span className="text-zinc-300">{link.data.rssi}</span></div>
              <div>Voltage: <span className="text-zinc-300">{link.data.voltage} V</span></div>
            </div>
          ) : <div className="text-xs text-zinc-500">No data</div>
        )}
        {tab === 'modes' && (
          modes.loading ? <div className="text-xs text-zinc-500">LoadingÃ¢â‚¬Â¦</div> :
          modes.error ? <div className="text-xs text-red-400">{modes.error}</div> :
          modes.data ? (
            <ul className="space-y-1 text-xs">
              {modes.data.map((m, i) => (
                <li key={m.mode} className={m.active ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>
                  {m.mode} {m.active && <span className="ml-1">(active)</span>}
                </li>
              ))}
            </ul>
          ) : <div className="text-xs text-zinc-500">No data</div>
        )}
        {tab === 'calibration' && (
          calibration.loading ? <div className="text-xs text-zinc-500">LoadingÃ¢â‚¬Â¦</div> :
          calibration.error ? <div className="text-xs text-red-400">{calibration.error}</div> :
          calibration.data ? (
            <div className="space-y-1 text-xs">
              <div>In progress: <span className={calibration.data.in_progress ? 'text-yellow-400' : 'text-zinc-300'}>{calibration.data.in_progress ? 'Yes' : 'No'}</span></div>
              <div>Step: <span className="text-zinc-300">{calibration.data.step}</span></div>
              <div>Progress: <span className="text-zinc-300">{calibration.data.progress}%</span></div>
            </div>
          ) : <div className="text-xs text-zinc-500">No data</div>
        )}
      </div>
    </div>
  );
}

export default function NepaWorkspacePage() {
  return (
    <main className="min-h-dvh p-8 bg-black text-white">
      <div className="grid grid-cols-2 grid-rows-2 gap-6 min-h-[600px]">
        <PipelineMonitorPane />
        <WorldModelVisualiserPane />
        <StdpActivityPanel />
        <ArduPilotIntegrationConsolePane />
      </div>
    </main>
  );
}
