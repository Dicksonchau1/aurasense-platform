export const metadata = { title: 'Attas Dashboard · AuraSense' }
export const dynamic = 'force-dynamic'

export default function AttasPage() {
  return (
    <main style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0e15' }}>
      <iframe
        src="/attas/aurasense-attas-aligned.html"
        style={{ width: '100%', height: '100%', border: 'none' }}
        allow="geolocation"
        title="Attas Mission Dashboard"
      />
    </main>
  )
}
