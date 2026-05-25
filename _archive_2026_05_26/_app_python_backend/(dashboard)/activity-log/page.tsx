// Activity Log Page
import { useActivityLog } from '../../../hooks/useActivityLog';

export default function ActivityLog() {
  const { log, loading, error } = useActivityLog();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Activity Log</h1>
      <div className="card p-6 mb-8">
        <div className="flex justify-between mb-4">
          <input className="form-input w-1/2" placeholder="Search events..." />
          <button className="btn btn-primary">Export CSV</button>
        </div>
        <h2 className="font-semibold mb-4">Recent Events</h2>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        <table className="min-w-full text-sm">
          <thead>
            <tr>
            <th>Time</th>
            <th>Type</th>
            <th>Description</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          {log.map(entry => (
            <tr key={entry.id}>
              <td>{entry.created_at}</td>
              <td>{entry.event_type}</td>
              <td>{entry.description}</td>
              <td>{entry.user_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}