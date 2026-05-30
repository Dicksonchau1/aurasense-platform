'use client';

import { Telemetry } from '@/lib/supabase-client';

interface TelemetryViewerProps {
  droneId: string;
  telemetry: Telemetry[];
}

export default function TelemetryViewer({ droneId, telemetry }: TelemetryViewerProps) {
  const latest = telemetry[0];

  if (!latest) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <p className="text-slate-400 text-center py-8">No telemetry data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Position & Attitude */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Position & Attitude</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-700/50 rounded p-4">
            <p className="text-slate-400 text-sm">Latitude</p>
            <p className="text-lg font-mono font-medium">{latest.latitude.toFixed(6)}</p>
          </div>
          <div className="bg-slate-700/50 rounded p-4">
            <p className="text-slate-400 text-sm">Longitude</p>
            <p className="text-lg font-mono font-medium">{latest.longitude.toFixed(6)}</p>
          </div>
          <div className="bg-slate-700/50 rounded p-4">
            <p className="text-slate-400 text-sm">Altitude</p>
            <p className="text-lg font-medium">{latest.altitude_m.toFixed(2)}m</p>
          </div>
          <div className="bg-slate-700/50 rounded p-4">
            <p className="text-slate-400 text-sm">Roll</p>
            <p className="text-lg font-medium">{latest.roll_deg.toFixed(2)}°</p>
          </div>
          <div className="bg-slate-700/50 rounded p-4">
            <p className="text-slate-400 text-sm">Pitch</p>
            <p className="text-lg font-medium">{latest.pitch_deg.toFixed(2)}°</p>
          </div>
          <div className="bg-slate-700/50 rounded p-4">
            <p className="text-slate-400 text-sm">Yaw</p>
            <p className="text-lg font-medium">{latest.yaw_deg.toFixed(2)}°</p>
          </div>
        </div>
      </div>

      {/* Velocity */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Velocity</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-700/50 rounded p-4">
            <p className="text-slate-400 text-sm">Velocity X</p>
            <p className="text-lg font-medium">{latest.velocity_x.toFixed(2)} m/s</p>
          </div>
          <div className="bg-slate-700/50 rounded p-4">
            <p className="text-slate-400 text-sm">Velocity Y</p>
            <p className="text-lg font-medium">{latest.velocity_y.toFixed(2)} m/s</p>
          </div>
          <div className="bg-slate-700/50 rounded p-4">
            <p className="text-slate-400 text-sm">Velocity Z</p>
            <p className="text-lg font-medium">{latest.velocity_z.toFixed(2)} m/s</p>
          </div>
        </div>
      </div>

      {/* Battery */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Battery Status</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-700/50 rounded p-4">
            <p className="text-slate-400 text-sm">Voltage</p>
            <p className="text-lg font-medium">{latest.battery_voltage.toFixed(2)}V</p>
          </div>
          <div className="bg-slate-700/50 rounded p-4">
            <p className="text-slate-400 text-sm">Current</p>
            <p className="text-lg font-medium">{latest.battery_current.toFixed(2)}A</p>
          </div>
          <div className="bg-slate-700/50 rounded p-4">
            <p className="text-slate-400 text-sm">Percentage</p>
            <p className="text-lg font-medium">{latest.battery_percentage}%</p>
          </div>
        </div>
      </div>

      {/* GPS */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold mb-4">GPS/GNSS Status</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-700/50 rounded p-4">
            <p className="text-slate-400 text-sm">Satellites</p>
            <p className="text-lg font-medium">{latest.gps_satellites}</p>
          </div>
          <div className="bg-slate-700/50 rounded p-4">
            <p className="text-slate-400 text-sm">HDOP</p>
            <p className="text-lg font-medium">{latest.gps_hdop.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* IMU Data */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold mb-4">IMU Sensors</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Accelerometer (m/s²)</h4>
            <div className="space-y-2">
              <div className="flex justify-between bg-slate-700/50 rounded p-2">
                <span className="text-slate-400">X</span>
                <span className="font-mono">{latest.accel_x.toFixed(3)}</span>
              </div>
              <div className="flex justify-between bg-slate-700/50 rounded p-2">
                <span className="text-slate-400">Y</span>
                <span className="font-mono">{latest.accel_y.toFixed(3)}</span>
              </div>
              <div className="flex justify-between bg-slate-700/50 rounded p-2">
                <span className="text-slate-400">Z</span>
                <span className="font-mono">{latest.accel_z.toFixed(3)}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Gyroscope (rad/s)</h4>
            <div className="space-y-2">
              <div className="flex justify-between bg-slate-700/50 rounded p-2">
                <span className="text-slate-400">X</span>
                <span className="font-mono">{latest.gyro_x.toFixed(3)}</span>
              </div>
              <div className="flex justify-between bg-slate-700/50 rounded p-2">
                <span className="text-slate-400">Y</span>
                <span className="font-mono">{latest.gyro_y.toFixed(3)}</span>
              </div>
              <div className="flex justify-between bg-slate-700/50 rounded p-2">
                <span className="text-slate-400">Z</span>
                <span className="font-mono">{latest.gyro_z.toFixed(3)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold mb-4">System Status</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-700/50 rounded p-4">
            <p className="text-slate-400 text-sm">System Time</p>
            <p className="text-lg font-mono font-medium">{latest.system_time_ms}ms</p>
          </div>
          <div className="bg-slate-700/50 rounded p-4">
            <p className="text-slate-400 text-sm">CPU Load</p>
            <p className="text-lg font-medium">{latest.cpu_load}%</p>
          </div>
        </div>
      </div>

      {/* Timestamp */}
      <div className="text-sm text-slate-400 text-center">
        Last update: {new Date(latest.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
