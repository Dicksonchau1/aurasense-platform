'use client';

import { useState } from 'react';
import { FlightMode } from '@/lib/supabase-client';

interface FlightModeSelectorProps {
  droneId: string;
  modes: FlightMode[];
}

const ARDUPILOT_MODES_INFO: Record<string, { description: string; icon: string }> = {
  STABILIZE: { description: 'Manual control with self-leveling', icon: '🎮' },
  ACRO: { description: 'Full manual acrobatic mode', icon: '🔄' },
  ALT_HOLD: { description: 'Maintains altitude automatically', icon: '📏' },
  AUTO: { description: 'Autonomous mission execution', icon: '🗺️' },
  GUIDED: { description: 'Waypoint navigation via commands', icon: '🧭' },
  LOITER: { description: 'Hovers in place', icon: '⏸️' },
  RTH: { description: 'Return to home location', icon: '🏠' },
  CIRCLE: { description: 'Circles around a point', icon: '⭕' },
  LAND: { description: 'Autonomous landing', icon: '📍' },
  DRIFT: { description: 'Manual with automatic leveling', icon: '🌊' },
  SPORT: { description: 'High performance manual mode', icon: '⚡' },
  FLIP: { description: 'Performs flip maneuver', icon: '🤸' },
  AUTOTUNE: { description: 'Automatic PID tuning', icon: '🔧' },
  POSHOLD: { description: 'Position hold with manual override', icon: '📌' },
  BRAKE: { description: 'Rapid deceleration', icon: '🛑' },
  THROW: { description: 'Launch from hand throw', icon: '🤾' },
  GUIDED_NOGPS: { description: 'Guided mode without GPS', icon: '📡' },
  SMART_RTH: { description: 'Intelligent return to home', icon: '🤖' },
};

export default function FlightModeSelector({ droneId, modes }: FlightModeSelectorProps) {
  const [selecting, setSelecting] = useState<string | null>(null);
  const [arming, setArming] = useState(false);

  const activeMode = modes.find((m) => m.is_active);

  const handleSelectMode = async (modeName: string) => {
    try {
      setSelecting(modeName);

      const res = await fetch(`/api/drones/${droneId}/flight-modes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode_name: modeName,
          armed: activeMode?.armed || false,
        }),
      });

      if (!res.ok) throw new Error('Failed to set flight mode');
    } catch (error) {
      console.error('Flight mode error:', error);
    } finally {
      setSelecting(null);
    }
  };

  const handleArm = async () => {
    try {
      setArming(true);

      const res = await fetch(`/api/drones/${droneId}/flight-modes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode_name: activeMode?.mode_name || 'STABILIZE',
          armed: !activeMode?.armed,
        }),
      });

      if (!res.ok) throw new Error('Failed to arm/disarm');
    } catch (error) {
      console.error('Arm error:', error);
    } finally {
      setArming(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Mode & Arm Status */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Flight Mode Control</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <p className="text-slate-400 text-sm mb-2">Current Mode</p>
            <p className="text-2xl font-bold">{activeMode?.mode_name || 'UNKNOWN'}</p>
            <p className="text-sm text-slate-400 mt-2">
              {activeMode?.mode_name && ARDUPILOT_MODES_INFO[activeMode.mode_name]?.description}
            </p>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <p className="text-slate-400 text-sm mb-2">Arm Status</p>
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full ${activeMode?.armed ? 'bg-red-500' : 'bg-green-500'}`}
              />
              <p className="text-2xl font-bold">{activeMode?.armed ? 'ARMED' : 'DISARMED'}</p>
            </div>
            <button
              onClick={handleArm}
              disabled={arming}
              className={`mt-3 w-full py-2 px-4 rounded font-medium transition ${
                activeMode?.armed
                  ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                  : 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
              } text-white`}
            >
              {arming ? 'Processing...' : activeMode?.armed ? 'Disarm' : 'Arm'}
            </button>
          </div>
        </div>
      </div>

      {/* Flight Modes Grid */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Available Flight Modes</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(ARDUPILOT_MODES_INFO).map(([modeName, info]) => (
            <button
              key={modeName}
              onClick={() => handleSelectMode(modeName)}
              disabled={selecting === modeName}
              className={`p-4 rounded-lg border-2 transition text-left ${
                activeMode?.mode_name === modeName
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
              } disabled:opacity-50`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{info.icon}</span>
                {activeMode?.mode_name === modeName && (
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Active</span>
                )}
              </div>
              <h4 className="font-semibold text-sm">{modeName}</h4>
              <p className="text-xs text-slate-400 mt-1">{info.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Information */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Flight Mode Guide</h3>

        <div className="space-y-4 text-sm">
          <div className="bg-slate-700/50 rounded p-4">
            <h4 className="font-semibold mb-2">Manual Modes</h4>
            <p className="text-slate-300">
              STABILIZE, ACRO, DRIFT, SPORT: Require pilot input. Use for manual flight and training.
            </p>
          </div>

          <div className="bg-slate-700/50 rounded p-4">
            <h4 className="font-semibold mb-2">Assisted Modes</h4>
            <p className="text-slate-300">
              ALT_HOLD, LOITER, POSHOLD: Autopilot assists with stability and positioning while pilot
              maintains control.
            </p>
          </div>

          <div className="bg-slate-700/50 rounded p-4">
            <h4 className="font-semibold mb-2">Autonomous Modes</h4>
            <p className="text-slate-300">
              AUTO, GUIDED, RTH, LAND: Full autopilot control. Drone executes pre-programmed missions or
              commands.
            </p>
          </div>

          <div className="bg-slate-700/50 rounded p-4">
            <h4 className="font-semibold mb-2">Special Modes</h4>
            <p className="text-slate-300">
              AUTOTUNE: Automatically tunes PID parameters. THROW: Launches from hand throw. CIRCLE:
              Orbits a point.
            </p>
          </div>
        </div>
      </div>

      {/* Safety Notes */}
      <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
        <p className="text-red-400 font-semibold mb-2">⚠️ Safety Notes</p>
        <ul className="text-sm text-red-300 space-y-1 list-disc list-inside">
          <li>Always ensure clear airspace before arming</li>
          <li>Verify GPS lock before autonomous missions</li>
          <li>Check battery level before flight</li>
          <li>Maintain line of sight in manual modes</li>
          <li>Test all modes on ground before flight</li>
        </ul>
      </div>
    </div>
  );
}
