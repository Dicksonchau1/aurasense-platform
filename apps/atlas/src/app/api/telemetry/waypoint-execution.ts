import { NextApiRequest, NextApiResponse } from 'next';

// In-memory state for waypoint execution
let waypointsCompleted = 0;
let timeline: any[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json({
      title: 'Waypoint Execution',
      subtitle: '',
      kpis: [
        { label: 'Waypoints Completed', value: String(waypointsCompleted) },
      ],
      chips: [],
      rows: [],
      timeline,
      warnings: [],
      lastAck: null,
      meta: {},
    });
  } else if (req.method === 'POST') {
    const { action, waypoint } = req.body;
    if (action === 'execute') {
      waypointsCompleted += 1;
      timeline.push({ event: `Waypoint Executed: ${waypoint}`, timestamp: new Date().toISOString() });
    } else if (action === 'abort') {
      timeline.push({ event: `Waypoint Aborted: ${waypoint}`, timestamp: new Date().toISOString() });
    }
    res.status(200).json({
      title: 'Waypoint Execution',
      subtitle: '',
      kpis: [
        { label: 'Waypoints Completed', value: String(waypointsCompleted) },
      ],
      chips: [],
      rows: [],
      timeline,
      warnings: [],
      lastAck: null,
      meta: {},
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
