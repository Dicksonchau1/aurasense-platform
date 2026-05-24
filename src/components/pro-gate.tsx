'use client'
import { useMembershipDrawer } from '@/components/membership-drawer'
import { Lock } from 'lucide-react'

interface ProGateProps {
  feature: string
  children: React.ReactNode
  isPro?: boolean
}

export function ProGate({ feature, children, isPro = false }: ProGateProps) {
  const drawer = useMembershipDrawer()
  if (isPro) return <>{children}</>
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <Lock className="w-6 h-6" style={{ color: 'var(--lock-red)' }} />
      </div>
      <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--text)' }}>
        {feature} — Pro Only
      </h2>
      <p className="text-sm mb-6 max-w-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
        Upgrade to Rehearse Pro to access {feature.toLowerCase()}, audit logs, API credentials, and the full NEPA runtime dashboard.
      </p>
      <button
        onClick={() => drawer.open(feature)}
        className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ background: 'var(--accent-green)', color: '#000' }}>
        Unlock Pro — HK$108/month
      </button>
      <p className="text-xs mt-3" style={{ color: 'var(--muted)' }}>
        POST /api/nepa/membership/trial
      </p>
    </div>
  )
}
