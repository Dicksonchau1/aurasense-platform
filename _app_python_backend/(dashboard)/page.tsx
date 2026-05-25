// Dashboard Home Page
export default function DashboardHome() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">ATLAS OS Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card"><h3>Active Drones</h3><div className="kpi">12</div></div>
        <div className="card"><h3>Missions Today</h3><div className="kpi">5</div></div>
        <div className="card"><h3>Alerts</h3><div className="kpi">2</div></div>
        <div className="card"><h3>Uptime</h3><div className="kpi">99.9%</div></div>
      </div>
      <div className="card p-6">
        <h3 className="font-semibold mb-4">Recent Activity</h3>
        <ul className="space-y-2">
          <li>Drone A completed mission Alpha</li>
          <li>Drone B returned to base</li>
        </ul>
      </div>
      <button className="btn btn-primary mt-8">Start Mission</button>
    </div>
  );
}
