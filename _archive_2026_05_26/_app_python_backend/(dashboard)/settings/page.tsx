// Settings Page
import { useSettings } from '../../../hooks/useSettings';

export default function Settings() {
  const { settings, loading, error } = useSettings();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="card p-6 mb-8">
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {settings && (
          <>
            <div className="card p-4 mb-4">API Key: <span className="font-mono">{settings.api_key}</span></div>
            <div className="card p-4 mb-4">Organization: {settings.org_name}</div>
            <div className="card p-4 mb-4">Integrations: {settings.integrations}</div>
          </>
        )}
        <button className="btn btn-primary">Add Key</button>
      </div>
    </div>
  );
}