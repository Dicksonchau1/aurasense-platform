'use client';

import { Drone } from '@/lib/supabase-client';

interface DroneRegistryProps {
  drone: Drone;
}

export default function DroneRegistry({ drone }: DroneRegistryProps) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Drone Specifications</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <p className="text-slate-400 text-sm">Drone Name</p>
              <p className="text-lg font-medium">{drone.name}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Model</p>
              <p className="text-lg font-medium">{drone.model}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Serial Number</p>
              <p className="text-lg font-medium font-mono">{drone.serial_number}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Firmware Version</p>
              <p className="text-lg font-medium">{drone.firmware_version}</p>
            </div>
          </div>

          {/* Current Status */}
          <div className="space-y-4">
            <div>
              <p className="text-slate-400 text-sm">Status</p>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`w-3 h-3 rounded-full ${
                    drone.status === 'flying'
                      ? 'bg-green-500'
                      : drone.status === 'armed'
                        ? 'bg-yellow-500'
                        : 'bg-slate-500'
                  }`}
                />
                <p className="text-lg font-medium capitalize">{drone.status}</p>
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Battery Voltage</p>
              <p className="text-lg font-medium">{drone.battery_voltage.toFixed(2)}V</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">GPS Status</p>
              <p className="text-lg font-medium">{drone.gps_status}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Last Heartbeat</p>
              <p className="text-lg font-medium">{new Date(drone.last_heartbeat).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ArduPilot Specs */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold mb-4">ArduPilot Specifications</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-700/50 rounded p-4">
            <p className="text-slate-400 text-sm mb-1">IMU Sensors</p>
            <p className="text-base font-medium">3-Axis Accelerometer</p>
            <p className="text-base font-medium">3-Axis Gyroscope</p>
            <p className="text-base font-medium">3-Axis Magnetometer</p>
          </div>

          <div className="bg-slate-700/50 rounded p-4">
            <p className="text-slate-400 text-sm mb-1">Barometric Sensor</p>
            <p className="text-base font-medium">Altitude Range: 0-5000m</p>
            <p className="text-base font-medium">Accuracy: ±1m</p>
            <p className="text-base font-medium">Update Rate: 50Hz</p>
          </div>

          <div className="bg-slate-700/50 rounded p-4">
            <p className="text-slate-400 text-sm mb-1">GPS/GNSS</p>
            <p className="text-base font-medium">Multi-constellation</p>
            <p className="text-base font-medium">RTK Ready</p>
            <p className="text-base font-medium">Accuracy: ±2cm</p>
          </div>

          <div className="bg-slate-700/50 rounded p-4">
            <p className="text-slate-400 text-sm mb-1">Optical Flow</p>
            <p className="text-base font-medium">Downward Camera</p>
            <p className="text-base font-medium">Range: 0.3-5m</p>
            <p className="text-base font-medium">Update Rate: 100Hz</p>
          </div>

          <div className="bg-slate-700/50 rounded p-4">
            <p className="text-slate-400 text-sm mb-1">Rangefinder</p>
            <p className="text-base font-medium">LiDAR/Sonar</p>
            <p className="text-base font-medium">Range: 0.2-40m</p>
            <p className="text-base font-medium">Accuracy: ±5cm</p>
          </div>

          <div className="bg-slate-700/50 rounded p-4">
            <p className="text-slate-400 text-sm mb-1">Power Management</p>
            <p className="text-base font-medium">Battery Monitor</p>
            <p className="text-base font-medium">Voltage: 7.4-51V</p>
            <p className="text-base font-medium">Current: 0-200A</p>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Current Location</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-slate-400 text-sm">Latitude</p>
            <p className="text-lg font-mono font-medium">{drone.location_lat.toFixed(6)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Longitude</p>
            <p className="text-lg font-mono font-medium">{drone.location_lon.toFixed(6)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Altitude</p>
            <p className="text-lg font-medium">{drone.altitude_m.toFixed(2)}m</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Heading</p>
            <p className="text-lg font-medium">{drone.heading_deg.toFixed(0)}°</p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-slate-700/50 rounded text-sm text-slate-300">
          <p>Map integration would display real-time drone position here</p>
        </div>
      </div>
    </div>
  );
}
