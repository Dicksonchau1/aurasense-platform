'use client'
import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Zap, X, Send, Activity, Upload } from 'lucide-react'
import { useMembershipDrawer } from '@/components/membership-drawer'

interface Message {
  id: string
  role: 'agent' | 'user'
  text: string
  endpoint?: string
  frame?: string
  attachment?: string
  ts: string
}

const QUICK = [
  { label: 'World Model',   q: 'Explain the world model in 2 sentences.' },
  { label: 'STDP',          q: 'What is STDP and why no backprop?' },
  { label: 'Run Inference', q: 'How do I run inference on a frame?' },
  { label: 'Show Alerts',   q: 'Show me the alert queue.' },
]

const INFERENCE_ENDPOINTS = [
  { label: 'Visual Inference',    endpoint: '/api/nepa/inference/visual',    method: 'POST' },
  { label: 'Spatiotemporal STDP', endpoint: '/api/nepa/inference/stdp',      method: 'POST' },
  { label: 'World Model Predict', endpoint: '/api/nepa/world-model/predict', method: 'POST' },
]

// Marketing site exposes the OpenRouter agent at this URL with CORS allow-list
const AGENT_URL = 'https://www.aurasensehk.com/api/agent/chat'

let _frameCaptureCallback: ((region: string) => void) | null = null
export function registerFrameCapture(cb: (region: string) => void) {
  _frameCaptureCallback = cb
}
export function captureFrameRegion(region: string) {
  _frameCaptureCallback?.(region)
}

function nowTs() {
  return new Date().toLocaleTimeString('en-HK', { hour: '2-digit', minute: '2-digit' })
}

export function NavBar() {
  const pathname = usePathname()
  const drawer = useMembershipDrawer()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'agent',
      text: 'NEPA agent online. Ask anything about your deployment, upload an MP4, or click any frame on the hero / drone feed.',
      endpoint: '/api/agent/health',
      ts: nowTs(),
    },
  ])
  const [input, setInput] = useState('')
  const [pulse, setPulse] = useState(false)
  const [pendingFrame, setPendingFrame] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [thinking, setThinking] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 1800)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open, thinking])

  // Frame capture handler — listens to clicks on hero / drone / rehearse pages
  useEffect(() => {
    let cancelled = false
    import('@/lib/nepa-bus').then(({ registerFrameHandler }) => {
      if (cancelled) return
      registerFrameHandler(async (frame: any, source: string) => {
        setOpen(true)
        const label = frame.region?.label ?? 'FULL'
        const userMsg: Message = {
          id: Date.now().toString(),
          role: 'user',
          text: `Analyse frame · ${source} · ${label} · ${frame.width}×${frame.height}`,
          frame: `${source}:${label}`,
          attachment: frame.dataUrl,
          ts: nowTs(),
        }
        setMessages(prev => [...prev, userMsg])

        const fd = new FormData()
        fd.append('image', frame.blob, `frame_${frame.ts}.jpg`)
        fd.append('source', source)
        fd.append('region', label)
        try {
          const res = await fetch('/api/nepa/inference/frame', { method: 'POST', body: fd })
          const json = await res.json()
          const d = json?.data ?? {}
          const top = (d.detections ?? [])
            .slice(0, 3)
            .map((x: any) => `${x.class}(${(x.score * 100) | 0}%)`)
            .join(', ')
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + '_a',
              role: 'agent',
              text: `Inference complete · ${(d.detections ?? []).length} signals · ${top || 'no anomalies'} · pred-err ${
                d.world_model?.prediction_error ?? '—'
              } · ${d.runtime ?? 'runtime'}`,
              endpoint: '/api/nepa/inference/frame',
              ts: nowTs(),
            },
          ])
        } catch {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + '_e',
              role: 'agent',
              text: 'Inference failed — endpoint unreachable.',
              ts: nowTs(),
            },
          ])
        }
      })
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function send(text?: string) {
    const msg = (text || input).trim()
    if (!msg) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: msg,
      ts: nowTs(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setPendingFrame(null)
    setThinking(true)

    // Conversation history for the agent (last 8 messages, excluding system intro)
    const history = messages
      .slice(-8)
      .filter(m => m.id !== '0')
      .map(m => ({
        role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.text,
      }))
    history.push({ role: 'user', content: msg })

    try {
      const res = await fetch(AGENT_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history, sessionId: 'playground' }),
      })
      const j = await res.json()
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + '_a',
          role: 'agent',
          text: j.content || j.error || 'No response.',
          endpoint: '/api/agent/chat',
          ts: nowTs(),
        },
      ])
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + '_e',
          role: 'agent',
          text: 'Agent unreachable: ' + (err as Error).message,
          ts: nowTs(),
        },
      ])
    } finally {
      setThinking(false)
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: `Uploaded ${file.name}`,
      attachment: file.name,
      ts: nowTs(),
    }
    setMessages(prev => [...prev, userMsg])

    INFERENCE_ENDPOINTS.forEach(ep => {
      const fd = new FormData()
      fd.append('video', file)
      fetch(ep.endpoint, { method: 'POST', body: fd }).catch(() => {})
    })

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + '_a',
          role: 'agent',
          text: `Received ${file.name}. Dispatched to /api/nepa/inference/visual + /stdp + /world-model/predict in parallel. Results stream into the audit chain.`,
          endpoint: '/api/nepa/inference/visual',
          ts: nowTs(),
        },
      ])
      setUploading(false)
    }, 800)
    if (fileRef.current) fileRef.current.value = ''
  }

  const NAV = [
    { href: '/',         label: 'Home'     },
    { href: '/drone',    label: 'Drone'    },
    { href: '/rehearse', label: 'Rehearse' },
    { href: '/facility', label: 'Facility', soon: true },
    { href: '/portal',   label: 'Portal',   soon: true },
  ]

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-40 flex items-center px-4 h-12"
        style={{
          background: 'rgba(7,14,26,0.96)',
          borderBottom: '1px solid rgba(16,185,129,0.12)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Link href="/" className="flex items-center gap-2 mr-6">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}
          >
            <Zap className="w-3 h-3" style={{ color: '#10b981' }} />
          </div>
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#10b981' }}>
            AuraSense
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {NAV.map(({ href, label, soon }) => {
            const active = pathname === href
            if (soon) {
              return (
                <span
                  key={href}
                  className="px-3 py-1 rounded-lg text-xs opacity-30 cursor-default flex items-center gap-1.5"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  {label}
                  <span className="text-[8px] rounded px-1" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    SOON
                  </span>
                </span>
              )
            }
            return (
              <Link
                key={href}
                href={href}
                className="px-3 py-1 rounded-lg text-xs transition-all"
                style={{
                  background: active ? 'rgba(16,185,129,0.12)' : 'transparent',
                  color: active ? '#10b981' : 'rgba(255,255,255,0.45)',
                  border: active ? '1px solid rgba(16,185,129,0.25)' : '1px solid transparent',
                }}
              >
                {label}
              </Link>
            )
          })}
        </div>

        <div className="flex-1" />

        <button
          onClick={() => drawer.open('NEPA Pro')}
          className="mr-4 px-3 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-opacity hover:opacity-80"
          style={{
            background: 'rgba(16,185,129,0.1)',
            color: '#10b981',
            border: '1px solid rgba(16,185,129,0.25)',
          }}
        >
          Upgrade Pro
        </button>

        <button
          onClick={() => setOpen(o => !o)}
          aria-label="Open NEPA Agent"
          className="relative w-9 h-9 rounded-full transition-transform hover:scale-110 active:scale-95"
          style={{
            background:
              'radial-gradient(circle at 35% 35%, rgba(16,185,129,0.6) 0%, rgba(7,14,26,0.9) 60%, rgba(16,185,129,0.15) 100%)',
            boxShadow: pulse
              ? '0 0 0 3px rgba(16,185,129,0.25), 0 0 20px rgba(16,185,129,0.4)'
              : '0 0 0 2px rgba(16,185,129,0.15), 0 0 10px rgba(16,185,129,0.2)',
            border: '1px solid rgba(16,185,129,0.4)',
            transition: 'box-shadow 0.8s ease',
          }}
        >
          <div
            className="absolute top-1.5 left-2 w-2 h-1 rounded-full pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.35)', filter: 'blur(1px)' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="w-4 h-4" style={{ color: '#10b981' }} />
          </div>
          <div
            className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 animate-pulse"
            style={{ background: '#10b981', borderColor: '#070e1a' }}
          />
        </button>
      </nav>

      {/* CHAT-ONLY POPUP */}
      {open && (
        <div
          className="fixed top-14 right-4 z-50 rounded-xl shadow-2xl flex flex-col overflow-hidden"
          style={{
            background: '#0a1628',
            border: '1px solid rgba(16,185,129,0.25)',
            width: '420px',
            maxHeight: 'calc(100dvh - 5rem)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(16,185,129,0.12)', background: 'rgba(16,185,129,0.04)' }}
          >
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}
            >
              <Activity className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold" style={{ color: '#10b981' }}>
                NEPA Agent
              </p>
              <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Claude · OpenRouter · Tools
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#10b981' }} />
              <span className="text-[9px] font-mono" style={{ color: '#10b981' }}>
                LIVE
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="ml-1 hover:opacity-60"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-3 py-3 space-y-3"
            style={{ minHeight: '280px', maxHeight: '420px' }}
          >
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[85%]">
                  <div
                    className="px-3 py-2 rounded-xl text-xs leading-relaxed"
                    style={{
                      background: m.role === 'user' ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)',
                      border:
                        m.role === 'user'
                          ? '1px solid rgba(16,185,129,0.25)'
                          : '1px solid rgba(255,255,255,0.06)',
                      color: m.role === 'user' ? '#10b981' : 'rgba(255,255,255,0.85)',
                    }}
                  >
                    {m.frame && (
                      <div
                        className="mb-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded inline-block"
                        style={{ background: 'rgba(16,185,129,0.18)', color: '#10b981' }}
                      >
                        FRAME · {m.frame}
                      </div>
                    )}
                    {m.attachment && m.attachment.startsWith('data:image') ? (
                      <img
                        src={m.attachment}
                        alt="frame"
                        className="mb-1.5 rounded-md block"
                        style={{ maxWidth: '180px', border: '1px solid rgba(16,185,129,0.25)' }}
                      />
                    ) : m.attachment ? (
                      <div
                        className="mb-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded inline-flex items-center gap-1"
                           style={{ background: 'rgba(16,185,129,0.18)', color: '#10b981' }}
                      >
                        <Upload className="w-2.5 h-2.5" /> {m.attachment}
                      </div>
                    ) : null}
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    {m.endpoint && (
                      <p className="mt-1.5 text-[9px] font-mono opacity-60">→ {m.endpoint}</p>
                    )}
                  </div>
                  <p className="text-[8px] mt-1 px-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    {m.ts}
                  </p>
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <div
                  className="px-3 py-2 rounded-xl text-xs flex items-center gap-2"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.65)',
                  }}
                >
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#10b981' }} />
                  Thinking…
                </div>
              </div>
            )}
            {uploading && (
              <div className="flex justify-start">
                <div
                  className="px-3 py-2 rounded-xl text-xs flex items-center gap-2"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.65)',
                  }}
                >
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#10b981' }} />
                  Dispatching to inference endpoints…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick chips */}
          <div
            className="px-3 py-2 flex gap-1.5 flex-wrap flex-shrink-0"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
          >
            {QUICK.map(q => (
              <button
                key={q.q}
                onClick={() => send(q.q)}
                disabled={thinking}
                className="px-2 py-1 rounded-md text-[9px] font-medium transition-all hover:opacity-80 disabled:opacity-40"
                style={{
                  background: 'rgba(16,185,129,0.08)',
                  color: '#10b981',
                  border: '1px solid rgba(16,185,129,0.18)',
                }}
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Input + upload */}
          <div
            className="px-3 py-3 flex items-center gap-2 flex-shrink-0"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.2)' }}
          >
            <input
              ref={fileRef}
              type="file"
              accept="video/mp4,video/*"
              onChange={handleUpload}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              aria-label="Upload video"
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all hover:opacity-80"
              style={{
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.25)',
                color: '#10b981',
              }}
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !thinking) send()
              }}
              disabled={thinking}
              placeholder={
                thinking
                  ? 'Agent is thinking…'
                  : pendingFrame
                    ? `Frame ${pendingFrame} ready…`
                    : 'Ask NEPA…'
              }
              className="flex-1 px-3 py-2 rounded-lg text-xs outline-none disabled:opacity-50"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'white',
              }}
            />
            <button
              onClick={() => send()}
              disabled={thinking || !input.trim()}
              aria-label="Send"
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all hover:opacity-80 disabled:opacity-40"
              style={{
                background: 'rgba(16,185,129,0.18)',
                border: '1px solid rgba(16,185,129,0.35)',
                color: '#10b981',
              }}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
