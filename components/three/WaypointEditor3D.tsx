// WaypointEditor3D.tsx
// Step 3: Interactive 3D waypoint planning and visualization scaffold

import React from 'react';

export interface WaypointEditor3DProps {
  waypoints: { id: string; position: [number, number, number] }[];
  onAddWaypoint?: (pos: [number, number, number]) => void;
  onMoveWaypoint?: (id: string, pos: [number, number, number]) => void;
  onDeleteWaypoint?: (id: string) => void;
}

export const WaypointEditor3D: React.FC<WaypointEditor3DProps> = ({ waypoints, onAddWaypoint, onMoveWaypoint, onDeleteWaypoint }) => {
  // TODO: Integrate with Three.js scene, allow adding/moving/deleting waypoints interactively
  // Placeholder UI
  return (
    <div style={{ padding: 16, background: '#181c20', borderRadius: 8 }}>
      <h4 style={{ color: '#fff' }}>Waypoints</h4>
      <ul style={{ color: '#fff' }}>
        {waypoints.map(wp => (
          <li key={wp.id}>
            {wp.id}: ({wp.position.join(', ')})
            {onDeleteWaypoint && <button onClick={() => onDeleteWaypoint(wp.id)} style={{ marginLeft: 8 }}>Delete</button>}
          </li>
        ))}
      </ul>
      {onAddWaypoint && <button onClick={() => onAddWaypoint([0,0,0])}>Add Waypoint (placeholder)</button>}
    </div>
  );
};
