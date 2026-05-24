import Link from 'next/link'

export const dynamic = 'force-static'

type Row = { name: string; price: string; seats: string; notes: string }

const NURSING: Row[] = [
  { name: 'Student',    price: 'Free (.edu.hk email)',          seats: '1',   notes: 'Coursework scenarios, 60-day history' },
  { name: 'Educator',   price: 'HK$148 / mo',                   seats: '1',   notes: 'Full Rehearse-Nurse, instructor mode' },
  { name: 'Cohort',     price: 'HK$1,180 / mo',                 seats: '10',  notes: 'Class dashboard, anonymised analytics' },
  { name: 'Department', price: 'HK$4,800 / mo',                 seats: '50',  notes: 'Custom HRI policies, multi-instructor co-sign' },
  { name: 'Hospital',   price: 'HK$28,000 / mo + HK$45k setup', seats: '∞',   notes: 'On-prem option, SLA, HKHA audit format' },
]

const ENTERPRISE: Row[] = [
  { name: 'Sandbox Pro', price: 'HK$880 / mo',                          seats: '1u / 1 sim',  notes: 'Sweep + Rehearse + WindSeer (Perlin only)' },
  { name: 'Operator',    price: 'HK$3,800 / mo',                        seats: '1u / 3 real', notes: 'Mission Planner, fleet ops, signed inspections' },
  { name: 'Squadron',    price: 'HK$18,000 / mo + HK$60k setup',        seats: '10u / 15',    notes: 'Atlas, WindSeer-Kowloon CFD, multi-mission scheduling' },
  { name: 'Enterprise',  price: 'HK$60,000+ / mo (custom)',             seats: 'Custom',      notes: 'On-prem, SFSVC bundle, dedicated CFD tiles, EMSD audit' },
  { name: 'Pilot',       price: 'HK$0 / 60 days',                       seats: '1 drone',     notes: 'For EMSD / HKSTP / Cyberport pilots' },
]

const ADDONS: Row[] = [
  { name: 'WindSeer-Kowloon CFD',        price: 'HK$15k + HK$3k/mo',  seats: '—', notes: 'Pre-computed CFD tiles for Kowloon rooftops' },
  { name: 'WindSeer-HK Island',          price: 'HK$25k + HK$5k/mo',  seats: '—', notes: 'HK Island + Central + Mid-Levels' },
  { name: 'WindSeer-Custom Region',      price: 'HK$60k+ setup',      seats: '—', notes: 'Macau, Shenzhen, anywhere with DSM' },
  { name: 'SFSVC Drone Inspection',      price: 'HK$120k + HK$25k/mo',seats: '—', notes: 'Turnkey: 3 drones + Jetson + Hailo + training' },
  { name: '24/7 SLA + On-Call',          price: 'HK$15k / mo',        seats: '—', notes: '1-hour response, dedicated Slack channel' },
  { name: 'Custom HRI policy',           price: 'HK$20k one-time',    seats: '—', notes: 'Your specific inspection logic' },
  { name: 'EMSD certification consult',  price: 'HK$80k one-time',    seats: '—', notes: 'Help you pass HKCAD / EMSD audits' },
]

const cell = { padding: '12px 14px', fontSize: 13, color: '#e2e8f0', verticalAlign: 'top' as const }
const head = { ...cell, fontSize: 11, color: '#8899aa', textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontWeight: 600 }

function Table({ rows, accent }: { rows: Row[]; accent: string }) {
  return (
    <div style={{
      overflowX: 'auto', borderRadius: 12,
      border: '1px solid #1f2d42', background: '#111827',
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #1f2d42', background: '#0d1117' }}>
            <th style={{ ...head, textAlign: 'left' }}>Plan</th>
            <th style={{ ...head, textAlign: 'left' }}>Price (HKD)</th>
            <th style={{ ...head, textAlign: 'left' }}>Seats / limit</th>
            <th style={{ ...head, textAlign: 'left' }}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.name} style={{ borderTop: i === 0 ? 'none' : '1px solid #1a2332' }}>
              <td style={{ ...cell, color: accent, fontWeight: 600 }}>{r.name}</td>
              <td style={{ ...cell, fontFamily: 'ui-monospace,SFMono-Regular,monospace' }}>{r.price}</td>
              <td style={{ ...cell, color: '#8899aa', fontFamily: 'ui-monospace,SFMono-Regular,monospace' }}>{r.seats}</td>
              <td style={{ ...cell, color: '#8899aa' }}>{r.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Section({ kicker, title, lede, accent, children }: { kicker: string; title: string; lede: string; accent: string; children: React.ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{
          fontSize: 11, fontFamily: 'ui-monospace,SFMono-Regular,monospace',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: accent, fontWeight: 700, marginBottom: 6,
        }}>{kicker}</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', margin: 0, letterSpacing: '-0.02em' }}>{title}</h2>
        <p style={{ fontSize: 14, color: '#8899aa', margin: '6px 0 0', maxWidth: '60ch' }}>{lede}</p>
      </div>
      {children}
    </section>
  )
}

export default function PricingPage() {
  return (
    <main style={{
      maxWidth: 1100, margin: '0 auto', padding: '48px 24px 96px',
      display: 'flex', flexDirection: 'column', gap: 48,
      color: '#e2e8f0', background: '#0d1117', minHeight: '100vh',
    }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{
          fontSize: 11, fontFamily: 'ui-monospace,SFMono-Regular,monospace',
          letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4a5568',
        }}>AuraSense — Pricing</div>
        <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>
          One platform, three surfaces, pricing that meets your org.
        </h1>
        <p style={{ fontSize: 15, color: '#8899aa', maxWidth: '70ch', margin: 0 }}>
          Sign in with your work email. We route you to the right product, no tier picker.
          Free for consumers, institutional plans for healthcare &amp; education, enterprise plans
          for inspection, infrastructure, and government.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <Link href="/login" style={{
            padding: '10px 18px', borderRadius: 8, background: '#22d3ee', color: '#0d1117',
            fontSize: 14, fontWeight: 600, textDecoration: 'none',
          }}>Get started</Link>
          <a href="mailto:sales@aurasensehk.com" style={{
            padding: '10px 18px', borderRadius: 8, border: '1px solid #2a3a52',
            color: '#e2e8f0', fontSize: 14, fontWeight: 500, textDecoration: 'none',
          }}>Talk to sales</a>
        </div>
      </header>

      <Section
        kicker="Tier 1 · Free"
        title="Public Playground"
        lede="Consumer webmail signs in here. Watermarked outputs, 3 sessions/day, no saved history. Designed for press demos, QR-code scans, and viral funnel."
        accent="#22d3ee"
      >
        <Table accent="#22d3ee" rows={[
          { name: 'Free Demo', price: 'HK$0', seats: '1', notes: 'WHO Handwash · sandbox drone view · Atlas sample building (watermarked)' },
        ]} />
      </Section>

      <Section
        kicker="Tier 2 · Healthcare / Education"
        title="Aura-Rehearse-Nurse"
        lede="HKHA, university medical schools, and private hospital domains land here. Cryptographic audit chain, instructor co-sign, neuro-rehab module, HKHA audit format."
        accent="#10b981"
      >
        <Table accent="#10b981" rows={NURSING} />
      </Section>

      <Section
        kicker="Tier 3 · Enterprise / Government"
        title="Aura-Fleet + Atlas + SFSVC"
        lede="EMSD, BD, HKCAD, MTR, major contractors and drone vendors land here. Mission planner, HKCAD-compliant flight plans, WindSeer CFD, signed inspection reports."
        accent="#a78bfa"
      >
        <Table accent="#a78bfa" rows={ENTERPRISE} />
      </Section>

      <Section
        kicker="Add-ons"
        title="À la carte for Tier 3"
        lede="Stack any of these on top of Squadron or Enterprise. Pricing in HKD."
        accent="#f59e0b"
      >
        <Table accent="#f59e0b" rows={ADDONS} />
      </Section>

      <footer style={{
        marginTop: 24, paddingTop: 24, borderTop: '1px solid #1f2d42',
        display: 'flex', flexDirection: 'column', gap: 6,
        fontSize: 12, color: '#4a5568',
      }}>
        <span>All prices in HKD, exclusive of taxes. Annual prepay −10%. Pilots subject to scope review.</span>
        <span>Need a domain added to the institutional or enterprise allow-list? <a href="mailto:sales@aurasensehk.com" style={{ color: '#22d3ee' }}>Email sales.</a></span>
      </footer>
export const dynamic = 'force-dynamic'

export default function PricingPage() {
  const plans = [
    { name: 'Starter', price: 'Free', current: true },
    { name: 'Student', price: 'HK$88/mo' },
    { name: 'Pro', price: 'HK$388/mo' },
    { name: 'Team', price: 'HK$1288/mo' },
    { name: 'Enterprise', price: 'Custom' },
  ]
  return (
    <main style={{ minHeight: '100vh', background: '#070e1a', color: '#e6edf3', padding: 32, fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700 }}>AuraSense Pricing</h1>
        <p style={{ color: '#8b949e', marginTop: 8 }}>Upgrade to unlock Attas dashboard and unlimited rehearse sessions.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 32 }}>
          {plans.map(p => (
            <div key={p.name} style={{ background: '#0d1117', border: p.current ? '1px solid #10b981' : '1px solid #30363d', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 11, color: '#8b949e', textTransform: 'uppercase' }}>{p.name}</div>
              <div style={{ fontSize: 22, fontWeight: 700, margin: '8px 0' }}>{p.price}</div>
              <button style={{ width: '100%', padding: '8px', borderRadius: 6, background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', fontSize: 12 }}>
                {p.current ? 'Current' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 32, fontSize: 11, color: '#8b949e', textAlign: 'center' }}>
          Contact dickson@aurasensehk.com for enterprise.
        </p>
      </div>
    </main>
  )
}
