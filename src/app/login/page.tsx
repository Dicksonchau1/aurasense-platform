'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
<<<<<<< Updated upstream
    setLoading(true); setError('')
    const sb = createClient()
    const { error: err } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setSent(true)
  }

  async function signInWithGoogle() {
    setError('')
    const sb = createClient()
    const { error: err } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (err) setError(err.message)
  }

  return (
    <div style={{
      minHeight: 'calc(100dvh - 3rem)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: '#111111', border: '1px solid #262626',
        borderRadius: 16, padding: '32px 28px',
      }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f5f5f5', margin: 0 }}>
            Sign in to AuraSense
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '6px 0 0' }}>
            One sign-up, three surfaces. We route you to the right one based on your work email.
          </p>
        </div>

        {sent ? (
          <div style={{
            padding: '16px', borderRadius: 10,
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
          }}>
            <p style={{ fontSize: 14, color: '#10b981', margin: 0 }}>
              ✓ Magic link sent to <strong>{email}</strong>. Check your inbox.
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '8px 0 0' }}>
              Tier on arrival: <strong style={{ color: hint?.accent }}>{hint?.label ?? tierLabel('free')}</strong>
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={sendMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                  Work email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@hospital.org.hk"
                  autoComplete="email"
                  style={{
                    background: '#0a0a0a',
                    border: `1px solid ${hint ? hint.accent + '55' : '#333'}`,
                    borderRadius: 8, padding: '10px 12px',
                    color: '#f5f5f5', fontSize: 14, outline: 'none',
                    transition: 'border-color 180ms ease',
                  }}
                />
              </div>

              {hint && HintIcon && (
                <div style={{
                  display: 'flex', gap: 10, padding: '10px 12px',
                  borderRadius: 8,
                  background: `${hint.accent}10`,
                  border: `1px solid ${hint.accent}33`,
                }}>
                  <HintIcon size={16} color={hint.accent} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{
                      fontSize: 11, fontFamily: 'ui-monospace,SFMono-Regular,monospace',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: hint.accent, fontWeight: 700,
                    }}>
                      → {hint.label}
                    </span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.4 }}>
                      {hint.lede}
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <p style={{ fontSize: 12, color: '#ef4444', margin: 0 }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '11px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                  background: loading ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.15)',
                  border: '1px solid rgba(16,185,129,0.35)', color: '#10b981',
                  cursor: loading || !email ? 'not-allowed' : 'pointer',
                  opacity: !email ? 0.6 : 1,
                }}
              >
                <Mail className="w-4 h-4" />
                {loading ? 'Sending…' : 'Send magic link'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#262626' }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>or</span>
              <div style={{ flex: 1, height: 1, background: '#262626' }} />
            </div>

            <button
              onClick={signInWithGoogle}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '11px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                background: '#18181b', border: '1px solid #333', color: '#f5f5f5',
                cursor: 'pointer',
              }}
            >
              <Globe className="w-4 h-4" />
              Continue with Google
            </button>
          </>
        )}

        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 20, textAlign: 'center' }}>
          By signing in you agree to our{' '}
          <a href="/terms" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline' }}>Terms</a>
          {' '}and{' '}
          <a href="/privacy" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline' }}>Privacy Policy</a>.
          {' '}See <a href="/pricing" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline' }}>pricing</a>.
        </p>
      </div>
    </div>
  )
}
=======
    setErr(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push(searchParams.get('redirect') ?? '/')
      router.refresh()
    } catch (e: any) {
      setErr(e?.message ?? 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #111827 100%)',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(17,24,39,0.92)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Sign in</div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
            Access AuraSense platform services.
          </p>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 14 }}>
          <label style={{ display: 'grid', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Email</span>
            <div style={{ position: 'relative' }}>
              <Mail
                className="w-4 h-4"
                style={{ position: 'absolute', left: 12, top: 12, color: 'rgba(255,255,255,0.45)' }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#fff',
                  outline: 'none',
                }}
              />
            </div>
          </label>

          <label style={{ display: 'grid', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Password</span>
            <div style={{ position: 'relative' }}>
              <Lock
                className="w-4 h-4"
                style={{ position: 'absolute', left: 12, top: 12, color: 'rgba(255,255,255,0.45)' }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#fff',
                  outline: 'none',
                }}
              />
            </div>
          </label>

          {err ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                borderRadius: 10,
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.35)',
                color: '#fecaca',
                fontSize: 13,
              }}
            >
              <AlertCircle className="w-4 h-4" />
              <span>{err}</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '11px 12px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              background: loading ? '#1f2937' : '#10b981',
              border: '1px solid rgba(16,185,129,0.45)',
              color: '#04130f',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, textDecoration: 'underline' }}>
            Back to home
          </Link>
        </div>
      </div>
    </main>
  )
}
>>>>>>> Stashed changes
