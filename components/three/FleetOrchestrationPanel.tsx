// FleetOrchestrationPanel.tsx
// Step 4: Fleet management, NERM state, orchestration controls scaffold

import React from 'react';

export interface DroneOrchestration {
  id: string;
  status: string;
  nermState?: string;
}

export interface FleetOrchestrationPanelProps {
  drones: DroneOrchestration[];
  onLand?: (id: string) => void;
  onReturn?: (id: string) => void;
  onUrgency?: (id: string) => void;
}

export const FleetOrchestrationPanel: React.FC<FleetOrchestrationPanelProps> = ({ drones, onLand, onReturn, onUrgency }) => {
  return (
    <div style={{ padding: 16, background: '#181c20', borderRadius: 8 }}>
      <h4 style={{ color: '#fff' }}>Fleet Orchestration</h4>
      <ul style={{ color: '#fff' }}>
        {drones.map(drone => (
          <li key={drone.id}>
            {drone.id} — {drone.status} {drone.nermState && `(NERM: ${drone.nermState})`}
            {onLand && <button onClick={() => onLand(drone.id)} style={{ marginLeft: 8 }}>Land</button>}
            {onReturn && <button onClick={() => onReturn(drone.id)} style={{ marginLeft: 8 }}>Return</button>}
            {onUrgency && <button onClick={() => onUrgency(drone.id)} style={{ marginLeft: 8 }}>Urgency</button>}
          </li>
        ))}
      </ul>
    </div>
  );
};
