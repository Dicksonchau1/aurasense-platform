export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center', maxWidth: 560, padding: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, margin: 0 }}>ATLAS</h1>
        <p style={{ color: '#666', marginTop: '8px' }}>Neuromorphic drone inspection platform</p>
        <nav style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/dashboard" style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: 6, textDecoration: 'none', color: '#111' }}>Dashboard</a>
          <a href="/portal" style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: 6, textDecoration: 'none', color: '#111' }}>Customer Portal</a>
          <a href="/internal/account-manager" style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: 6, textDecoration: 'none', color: '#111' }}>Account Manager</a>
          <a href="/rehearse/drone" style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: 6, textDecoration: 'none', color: '#111' }}>Rehearse</a>
          <a href="/pricing" style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: 6, textDecoration: 'none', color: '#111' }}>Pricing</a>
        </nav>
      </div>
    </main>
  );
}
