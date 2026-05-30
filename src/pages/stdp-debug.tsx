// Stub STDP Debug Panel
function StdpDebugPanel() {
  return <div>STDP Debug Panel (stub)</div>;
}

export default function StdpDebugPage() {
  return (
    <div style={{ maxWidth: 900, margin: '40px auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px #0001' }}>
      <StdpDebugPanel />
    </div>
  );
}
