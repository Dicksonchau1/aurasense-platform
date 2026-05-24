'use client'
import React, { useRef, useState } from 'react'
import { Globe2, Play, Volume2, VolumeX, Upload } from 'lucide-react'

const INFERENCE_ENDPOINTS = [
  { label: 'Visual Inference',    endpoint: '/api/nepa/inference/visual',    method: 'POST' },
  { label: 'Spatiotemporal STDP', endpoint: '/api/nepa/inference/stdp',      method: 'POST' },
  { label: 'World Model Predict', endpoint: '/api/nepa/world-model/predict', method: 'POST' },
]

export function WorldModelSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center gap-2 mb-4">
        <Globe2 className="w-5 h-5" style={{ color: '#10b981' }} />
        <h2 className="text-2xl font-bold" style={{ color: 'white' }}>World Model</h2>
        <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
          STDP · LATENT DYNAMICS
        </span>
      </div>

      <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.7)' }}>
        The world model learns a latent prior over scene dynamics. STDP layers supply sparse, event-driven spikes that update the prior online — no labels, no backprop. Prediction error becomes the anomaly signal.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
        {/* Video */}
        <div className="relative rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(16,185,129,0.2)', background: '#000', aspectRatio: '16/9' }}>
          <video
            ref={videoRef}
            src="/hero/world-model-stdp.mp4"
            autoPlay loop playsInline
            muted={muted}
            onError={(e) => {
              const v = e.currentTarget
              if (!v.src.endsWith('/hero/scene-builder.mp4')) v.src = '/hero/scene-builder.mp4'
            }}
            className="w-full h-full object-cover"
          />
          <button onClick={() => setMuted(m => !m)}
            className="absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981' }}>
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-mono"
            style={{ background: 'rgba(16,185,129,0.18)', color: '#10b981', border: '1px solid rgba(16,185,129,0.35)' }}>
            WORLD MODEL · STDP
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { k: 'Latency',  v: '8.2ms' },
              { k: 'Sparsity', v: '94%'   },
              { k: 'Energy',   v: '0.3W'  },
            ].map(s => (
              <div key={s.k} className="px-3 py-2 rounded-lg text-center"
                style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)' }}>
                <p className="text-[8px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.k}</p>
                <p className="text-sm font-mono font-bold" style={{ color: '#10b981' }}>{s.v}</p>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            {INFERENCE_ENDPOINTS.map(ep => (
              <div key={ep.endpoint} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Play className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#10b981' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>{ep.label}</p>
                  <p className="text-[10px] font-mono opacity-50" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {ep.method} {ep.endpoint}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
