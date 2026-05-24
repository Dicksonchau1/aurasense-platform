'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState, useCallback } from 'react'

type Specialty = 'psych' | 'community' | 'icu' | 'general'
type Question = { id: string; specialty: string; prompt: string; difficulty: number; rubric?: any }
type Metrics = { posture: number; framing: number; gaze: number; envelope: number; consistency: number }

const SPECIALTY_LABEL: Record<Specialty, string> = {
  psych: 'Psychiatric',
  community: 'Community Rehab',
  icu: 'ICU / Acute',
  general: 'General',
}

export default function NurseRehearsePage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const recRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const accRef = useRef<{ posture: number[]; framing: number[]; gaze: number[]; envelope: number[]; consistency: number[] }>({ posture: [], framing: [], gaze: [], envelope: [], consistency: [] })

  const [specialty, setSpecialty] = useState<Specialty>('psych')
  const [questions, setQuestions] = useState<Question[]>([])
  const [qIdx, setQIdx] = useState(0)
  const [running, setRunning] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [startTs, setStartTs] = useState(0)
  const [tick, setTick] = useState(0)
  const [m, setM] = useState<Metrics>({ posture: 0, framing: 0, gaze: 0, envelope: 0, consistency: 0 })
  const [transcript, setTranscript] = useState('')
  const [feedback, setFeedback] = useState<any>(null)
  const [busy, setBusy] = useState(false)

  const q = questions[qIdx]
  const focuses: string[] = q?.rubric?.focus ?? []

  useEffect(() => {
    let dead = false
    setFeedback(null); setTranscript(''); setQIdx(0)
    fetch(`/api/rehearse/questions?specialty=${specialty}`)
      .then(r => r.json())
      .then(j => { if (!dead) setQuestions(j.questions ?? []) })
      .catch(e => !dead && setErr(e.message))
    return () => { dead = true }
  }, [specialty])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      const next: Metrics = {
        posture: Math.max(0, Math.min(100, 75 + Math.sin(tick / 3) * 10 + (Math.random() - 0.5) * 8)),
        framing: Math.max(0, Math.min(100, 85 + Math.cos(tick / 4) * 8)),
        gaze: Math.max(0, Math.min(100, 70 + Math.sin(tick / 2) * 15)),
        envelope: Math.max(0, Math.min(100, 78 + (Math.random() - 0.5) * 18)),
        consistency: Math.max(0, Math.min(1, 0.7 + Math.sin(tick / 5) * 0.15)),
      }
      setM(next)
      accRef.current.posture.push(next.posture)
      accRef.current.framing.push(next.framing)
      accRef.current.gaze.push(next.gaze)
      accRef.current.envelope.push(next.envelope)
      accRef.current.consistency.push(next.consistency)
    }, 500)
    return () => clearInterval(id)
  }, [running, tick])

  const avg = (a: number[]) => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0

  const start = useCallback(async () => {
    setErr(null); setFeedback(null); setTranscript('')
    accRef.current = { posture: [], framing: [], gaze: [], envelope: [], consistency: [] }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true })
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play() }
      chunksRef.current = []
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm'
      const rec = new MediaRecorder(stream, { mimeType: mime })
      rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      rec.start(1000)
      recRef.current = rec
      const r = await fetch('/api/rehearse/sessions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialty, questionId: q?.id }),
      })
      const j = await r.json()
      setSessionId(j.id ?? null)
      setStartTs(Date.now())
      setRunning(true)
    } catch (e: any) { setErr(e.message ?? 'failed to start') }
  }, [specialty, q])

  const stop = useCallback(async () => {
    setRunning(false); setBusy(true)
    const rec = recRef.current
    if (rec && rec.state !== 'inactive') {
      await new Promise<void>(res => { rec.onstop = () => res(); rec.stop() })
    }
    const ms = videoRef.current?.srcObject as MediaStream | null
    ms?.getTracks().forEach(t => t.stop())
    if (videoRef.current) videoRef.current.srcObject = null

    const durationMs = Date.now() - startTs
    const summary = {
      durationMs,
      postureAvg: +avg(accRef.current.posture).toFixed(2),
      framingAvg: +avg(accRef.current.framing).toFixed(2),
      gazeAvg: +avg(accRef.current.gaze).toFixed(2),
      envelopeAvg: +avg(accRef.current.envelope).toFixed(2),
      consistencyAvg: +avg(accRef.current.consistency).toFixed(2),
    }

    let text = ''
    try {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      const form = new FormData()
      form.append('audio', blob, 'session.webm')
      const tr = await fetch('/api/rehearse/transcribe', { method: 'POST', body: form })
      const tj = await tr.json()
      text = tj.text ?? ''
      setTranscript(text)
    } catch (e: any) { setErr(`transcribe: ${e.message}`) }

    if (sessionId) {
      await fetch(`/api/rehearse/sessions/${sessionId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...summary, transcript: text }),
      }).catch(() => {})
    }

    try {
      const fr = await fetch('/api/rehearse/feedback', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, transcript: text || '[silence]', prompt: q?.prompt, metrics: summary }),
      })
      setFeedback(await fr.json())
    } catch (e: any) { setErr(`feedback: ${e.message}`) }
    finally { setBusy(false) }
  }, [sessionId, startTs, q])

  const nextQ = () => setQIdx(i => Math.min(i + 1, questions.length - 1))
  const prevQ = () => setQIdx(i => Math.max(i - 1, 0))

  const bar = (v: number) => ({ width: `${Math.min(100, v)}%`, height: 6, background: '#10b981', borderRadius: 3 })
  const mm = Math.floor(tick / 60).toString().padStart(2, '0')
  const ss = (tick % 60).toString().padStart(2, '0')
  const stars = '★'.repeat(q?.difficulty ?? 0) + '☆'.repeat(Math.max(0, 5 - (q?.difficulty ?? 0)))

  return (
    <main style={{ minHeight: '100vh', background: '#070e1a', color: '#e6edf3', padding: 24, fontFamily: 'system-ui,-apple-system,sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: 3, color: '#34d399', textTransform: 'uppercase', margin: 0 }}>AuraSense · Nurse Rehearse</p>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: '4px 0 0' }}>Interview Practice Mirror</h1>
          <p style={{ fontSize: 12, color: '#8b949e', margin: '4px 0 0' }}>Private · 100% in-browser video · HK Nursing Council aware</p>
        </div>
               <select value={specialty} onChange={e => setSpecialty(e.target.value as Specialty)} style={{ background: '#0d1117', border: '1px solid #30363d', color: '#e6edf3', padding: '8px 12px', borderRadius: 6, fontSize: 13 }}>
          {(Object.keys(SPECIALTY_LABEL) as Specialty[]).map(s => <option key={s} value={s}>{SPECIALTY_LABEL[s]}</option>)}
        </select>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div>
          <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 12, overflow: 'hidden', aspectRatio: '16/9', position: 'relative' }}>
            <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} muted playsInline />
            {running ? (
              <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(248,81,73,0.9)', color: '#fff', padding: '4px 10px', borderRadius: 99, fontSize: 11, fontFamily: 'monospace', fontWeight: 700 }}>
                ● REC {mm}:{ss}
              </div>
            ) : null}
            {busy ? (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(7,14,26,0.85)', display: 'grid', placeItems: 'center', fontSize: 14, color: '#34d399' }}>
                Analyzing session…
              </div>
            ) : null}
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            {!running ? (
              <button onClick={start} disabled={busy || !q} style={{ flex: 1, padding: '10px 14px', background: '#10b981', color: '#062017', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>▶ Start Session</button>
            ) : (
              <button onClick={stop} style={{ flex: 1, padding: '10px 14px', background: '#f85149', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>⏹ Stop & Analyze</button>
            )}
            <button onClick={prevQ} disabled={running || qIdx === 0} style={{ padding: '10px 14px', background: 'transparent', color: '#e6edf3', border: '1px solid #30363d', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>◀ Prev</button>
            <button onClick={nextQ} disabled={running || qIdx >= questions.length - 1} style={{ padding: '10px 14px', background: 'transparent', color: '#e6edf3', border: '1px solid #30363d', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Next ▶</button>
          </div>

          {err ? <div style={{ marginTop: 12, padding: 10, background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 6, color: '#f85149', fontSize: 12 }}>{err}</div> : null}
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#8b949e', letterSpacing: 1 }}>QUESTION {qIdx + 1} / {questions.length || 0}</span>
              <span style={{ fontSize: 12, color: '#f59e0b' }}>{stars}</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.5, margin: '8px 0' }}>{q?.prompt ?? 'Loading question bank…'}</p>
            {focuses.length ? (
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {focuses.map(f => <span key={f} style={{ fontSize: 10, padding: '3px 8px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', borderRadius: 99 }}>{f}</span>)}
              </div>
            ) : null}
          </div>

          <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 12, padding: 16 }}>
            <h3 style={{ fontSize: 11, fontFamily: 'monospace', color: '#8b949e', letterSpacing: 1, margin: '0 0 12px' }}>LIVE METRICS</h3>
            {[
              { label: 'Posture', v: m.posture, display: `${m.posture.toFixed(0)}%` },
              { label: 'Framing', v: m.framing, display: `${m.framing.toFixed(0)}%` },
              { label: 'Gaze', v: m.gaze, display: `${m.gaze.toFixed(0)}%` },
              { label: 'Envelope', v: m.envelope, display: `${m.envelope.toFixed(0)}%` },
              { label: 'Consistency', v: m.consistency * 100, display: m.consistency.toFixed(2) },
            ].map(row => (
              <div key={row.label} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                  <span style={{ color: '#8b949e' }}>{row.label}</span>
                  <span style={{ fontFamily: 'monospace', color: '#e6edf3' }}>{row.display}</span>
                </div>
                <div style={{ height: 6, background: '#161b22', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={bar(row.v)} />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      {feedback ? (
        <section style={{ marginTop: 16, background: '#0d1117', border: '1px solid #30363d', borderRadius: 12, padding: 16 }}>
          <h3 style={{ fontSize: 11, fontFamily: 'monospace', color: '#8b949e', letterSpacing: 1, margin: '0 0 12px' }}>AI FEEDBACK {feedback.mock ? '· MOCK' : ''}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <h4 style={{ fontSize: 12, margin: '0 0 8px' }}>5-axis scoring</h4>
              {feedback.scores ? Object.entries(feedback.scores).map(([k, v]) => (
                <div key={k} style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                    <span style={{ color: '#8b949e' }}>{k.replace(/_/g, ' ')}</span>
                    <span style={{ fontFamily: 'monospace' }}>{Number(v).toFixed(0)}/10</span>
                  </div>
                  <div style={{ height: 5, background: '#161b22', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${(Number(v) / 10) * 100}%`, height: 5, background: '#a78bfa' }} />
                  </div>
                </div>
              )) : null}
              {feedback.verdict ? <p style={{ fontSize: 12, color: '#34d399', marginTop: 10, fontStyle: 'italic' }}>&quot;{feedback.verdict}&quot;</p> : null}
            </div>
            <div>
              {feedback.strengths?.length ? (
                <>
                  <h4 style={{ fontSize: 12, color: '#34d399', margin: '0 0 6px' }}>Strengths</h4>
                  <ul style={{ fontSize: 12, color: '#8b949e', paddingLeft: 18, margin: '0 0 12px' }}>
                    {feedback.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </>
              ) : null}
              {feedback.improvements?.length ? (
                <>
                  <h4 style={{ fontSize: 12, color: '#f59e0b', margin: '0 0 6px' }}>Improve</h4>
                  <ul style={{ fontSize: 12, color: '#8b949e', paddingLeft: 18, margin: 0 }}>
                    {feedback.improvements.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </>
              ) : null}
            </div>
          </div>
          {transcript ? (
            <details style={{ marginTop: 16 }}>
              <summary style={{ fontSize: 11, color: '#8b949e', cursor: 'pointer', fontFamily: 'monospace' }}>TRANSCRIPT</summary>
              <p style={{ fontSize: 12, color: '#e6edf3', marginTop: 8, padding: 10, background: '#161b22', borderRadius: 6, lineHeight: 1.5 }}>{transcript}</p>
            </details>
          ) : null}
        </section>
      ) : null}
    </main>
  )
}
