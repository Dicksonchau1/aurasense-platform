'use client';

import { useState } from 'react';
import { Sensor } from '@/lib/supabase-client';

interface SensorCalibrationProps {
  droneId: string;
  sensors: Sensor[];
}

export default function SensorCalibration({ droneId, sensors }: SensorCalibrationProps) {
  const [calibrating, setCalibrating] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});

  const handleCalibrate = async (sensorId: string, action: 'start' | 'advance' | 'abort') => {
    try {
      setCalibrating(sensorId);

      const res = await fetch(`/api/drones/${droneId}/sensors/${sensorId}/calibrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error('Calibration failed');

      const data = await res.json();
      if (data.calibration_state) {
        setProgress((prev) => ({
          ...prev,
          [sensorId]: data.calibration_state.progress_percent,
        }));
      }
    } catch (error) {
      console.error('Calibration error:', error);
    } finally {
      setCalibrating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold mb-4">ArduPilot Sensor Calibration</h3>

        {sensors.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p>No sensors found for this drone</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sensors.map((sensor) => (
              <div key={sensor.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold capitalize">{sensor.sensor_type}</h4>
                    <p className="text-sm text-slate-400">
                      Status: <span className="capitalize">{sensor.status}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Confidence</p>
                    <p className="text-lg font-semibold">{(sensor.confidence * 100).toFixed(0)}%</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-slate-600 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all duration-300"
                      style={{ width: `${progress[sensor.id] || 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {progress[sensor.id] || 0}% complete
                  </p>
                </div>

                {/* Calibration Info */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div>
                    <p className="text-slate-400">Calibrations</p>
                    <p className="font-medium">{sensor.calibration_count}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Last Calibrated</p>
                    <p className="font-medium">
                      {sensor.last_calibrated
                        ? new Date(sensor.last_calibrated).toLocaleDateString()
                        : 'Never'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {sensor.status === 'idle' && (
                    <button
                      onClick={() => handleCalibrate(sensor.id, 'start')}
                      disabled={calibrating === sensor.id}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded transition"
                    >
                      {calibrating === sensor.id ? 'Starting...' : 'Start Calibration'}
                    </button>
                  )}

                  {sensor.status === 'calibrating' && (
                    <>
                      <button
                        onClick={() => handleCalibrate(sensor.id, 'advance')}
                        disabled={calibrating === sensor.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded transition"
                      >
                        {calibrating === sensor.id ? 'Advancing...' : 'Next Step'}
                      </button>
                      <button
                        onClick={() => handleCalibrate(sensor.id, 'abort')}
                        disabled={calibrating === sensor.id}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded transition"
                      >
                        Abort
                      </button>
                    </>
                  )}

                  {sensor.status === 'calibrated' && (
                    <div className="flex-1 bg-green-900/30 border border-green-600 text-green-400 font-medium py-2 px-4 rounded text-center">
                      ✓ Calibrated
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calibration Guide */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Calibration Guide</h3>

        <div className="space-y-4 text-sm">
          <div className="bg-slate-700/50 rounded p-4">
            <h4 className="font-semibold mb-2">Accelerometer Calibration</h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li>Place drone on level surface</li>
              <li>Click "Start Calibration"</li>
              <li>Keep drone still during calibration</li>
              <li>Wait for completion (typically 5-10 seconds)</li>
            </ol>
          </div>

          <div className="bg-slate-700/50 rounded p-4">
            <h4 className="font-semibold mb-2">Compass Calibration</h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li>Move drone in figure-8 pattern</li>
              <li>Rotate drone on all axes</li>
              <li>Ensure away from magnetic interference</li>
              <li>Complete full rotation pattern</li>
            </ol>
          </div>

          <div className="bg-slate-700/50 rounded p-4">
            <h4 className="font-semibold mb-2">Gyroscope Calibration</h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li>Place drone on level surface</li>
              <li>Do not move drone during calibration</li>
              <li>Calibration is automatic on startup</li>
              <li>Typically takes 2-3 seconds</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
