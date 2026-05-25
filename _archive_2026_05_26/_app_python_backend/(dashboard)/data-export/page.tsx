// Data Export Page
import { useDataExports } from '../../../hooks/useDataExports';

export default function DataExport() {
  const { exports, loading, error } = useDataExports();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Data Export</h1>
      <div className="card p-6 mb-8">
        <button className="btn btn-primary mb-4">Export All Data</button>
        <div className="card p-4">
          <b>Download History</b>
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}
          <ul className="mt-2">
            {exports.map(exp => (
              <li key={exp.id}>
                <a href={exp.file_url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Download</a>
                {' '}({exp.created_at}) by {exp.user_id}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}