'use client'
import React, { useState, useRef, useEffect } from 'react'
import { X, Send, Zap, AlertTriangle, Activity } from 'lucide-react'
import { cn } from '@/lib/cn'

interface Message {
  id: string
  role: 'agent' | 'user'
  text: string
  endpoint?: string
  ts: string
}

const QUICK_ACTIONS = [
  { label: 'Agent Status',    endpoint: '/api/nepa/status'           },
  { label: 'Active Missions', endpoint: '/api/nepa/missions/active'  },
  { label: 'Anomaly Feed',    endpoint: '/api/nepa/anomalies/live'   },
  { label: 'NERM Mode',       endpoint: '/api/nepa/nerm/status'      },
  { label: 'Drone Registry',  endpoint: '/api/registry/drones'       },
]

const INITIAL_MESSAGES: Message[] = [
  {
    id: '0',
    role: 'agent',
    text: 'NEPA runtime online. All subsystems nominal. How can I assist?',
    endpoint: '/api/nepa/status',
    ts: new Date().toLocaleTimeString('en-HK', { hour: '2-digit', minute: '2-digit' }),
  },
]

function agentReply(input: string): Message {
  const lower = input.toLowerCase()
  let text = 'Routing to NEPA runtime…'
  let endpoint = '/api/nepa/status'

  if (lower.includes('drone') || lower.includes('uav'))  { text = 'Fetching drone registry. 4 units indexed.';           endpoint = '/api/registry/drones' }
  else if (lower.includes('mission'))                    { text = 'Active missions: 2 in-flight, 1 queued.';             endpoint = '/api/nepa/missions/active' }
  else if (lower.includes('anomal'))                     { text = 'Anomaly feed live. Last event: UAV-003 low battery.'; endpoint = '/api/nepa/anomalies/live' }
  else if (lower.includes('nerm'))                       { text = 'NERM mode: STANDBY. Ultra-low latency codec ready.';  endpoint = '/api/nepa/nerm/status' }
  else if (lower.includes('overlay'))                    { text = 'Overlay config loaded. BBox + Depth active.';         endpoint = '/api/nepa/overlay/config' }
  else if (lower.includes('status'))                     { text = 'All NEPA subsystems nominal. Runtime: healthy.';      endpoint = '/api/nepa/status' }
  else if (lower.includes('billing') || lower.includes('plan')) { text = 'Billing and plan details available at /api/nepa/membership/plans.'; endpoint = '/api/nepa/membership/plans' }

  return {
    id: Date.now().toString(),
    role: 'agent',
    text,
    endpoint,
    ts: new Date().toLocaleTimeString('en-HK', { hour: '2-digit', minute: '2-digit' }),
  }
}

export function NepaAgent() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [pulse, setPulse] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, open])
  useEffect(() => { const t = setInterval(() => setPulse(p => !p), 2000); return () => clearInterval(t) }, [])

  function send(text?: string) {
    const msg = text || input.trim()
    if (!msg) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: msg, ts: new Date().toLocaleTimeString('en-HK', { hour: '2-digit', minute: '2-digit' }) }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTimeout(() => setMessages(prev => [...prev, agentReply(msg)]), 600)
  }

  return (
    <>
      {/* Floating avatar button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d2137 100%)', border: '1px solid rgba(16,185,129,0.4)' }}
        aria-label="Open NEPA Agent">
        {/* Avatar face */}
        <div className="relative w-9 h-9">
          {/* Outer ring pulse */}
          <div className={cn('absolute inset-0 rounded-full border transition-opacity duration-1000',
            pulse ? 'opacity-100' : 'opacity-30')}
            style={{ borderColor: 'var(--accent-green)', boxShadow: pulse ? '0 0 12px rgba(16,185,129,0.5)' : 'none' }} />
          {/* Inner icon */}
          <div className="absolute inset-1 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.12)' }}>
            <Zap className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
          </div>
          {/* Status dot */}
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
            style={{ background: 'var(--accent-green)', borderColor: '#0a1628' }} />
        </div>
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 rounded-xl shadow-2xl flex flex-col overflow-hidden"
          style={{ background: '#0a1628', border: '1px solid rgba(16,185,129,0.25)', maxHeight: '520px' }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b"
            style={{ borderColor: 'rgba(16,185,129,0.15)', background: 'rgba(16,185,129,0.05)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}>
              <Zap className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold" style={{ color: 'var(--accent-green)' }}>NEPA Agent</p>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Neuromorphic Perception Orchestration</p>
            </div>
            <div className="flex items-center gap-1.5 mr-2">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent-green)' }} />
              <span className="text-[10px]" style={{ color: 'var(--accent-green)' }}>ONLINE</span>
            </div>
            <button onClick={() => setOpen(false)} className="hover:opacity-60 transition-opacity"
              style={{ color: 'rgba(255,255,255,0.4)' }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick actions */}
          <div className="flex gap-1.5 p-3 overflow-x-auto flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {QUICK_ACTIONS.map(a => (
              <button key={a.endpoint} onClick={() => send(a.label)}
                className="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-medium transition-opacity hover:opacity-80"
                style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent-green)', border: '1px solid rgba(16,185,129,0.2)' }}>
                {a.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-3 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={cn('flex gap-2', msg.role === 'user' && 'flex-row-reverse')}>
                {msg.role === 'agent' && (
                  <div className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <Activity className="w-3 h-3" style={{ color: 'var(--accent-green)' }} />
                  </div>
                )}
                <div className="max-w-[220px]">
                  <div className="rounded-xl px-3 py-2 text-xs leading-relaxed"
                    style={msg.role === 'agent'
                      ? { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.06)' }
                      : { background: 'rgba(16,185,129,0.15)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    {msg.text}
                  </div>
                  {msg.endpoint && (
                    <a href={msg.endpoint} target="_blank" rel="noopener noreferrer"
                      className="block text-[10px] mt-1 font-mono hover:opacity-80 transition-opacity"
                      style={{ color: 'rgba(16,185,129,0.6)' }}>
                      → {msg.endpoint}
                    </a>
                  )}
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>{msg.ts}</p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ask NEPA…"
                className="flex-1 rounded-lg px-3 py-2 text-xs outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' }}
              />
              <button onClick={() => send()}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-80"
                style={{ background: 'var(--accent-green)', color: '#000' }}>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
