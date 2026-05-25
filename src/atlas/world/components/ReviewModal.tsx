'use client';
import { useState } from 'react';
import type { Rollout, Scores } from '../nepa/client';
import type { Approval } from '../nepa/policy';
import type { Trajectory } from '../nepa/client';

export type ReviewPayload = {
  trajectory: Trajectory;
  rollout: Rollout;
  scores: Scores;
  approval: Approval;
  missionId: string;
  sessionId: string;
  siteId: string;
};

export function ReviewModal({
  payload, currentUser, onDecide, onClose,
}:{
  payload: ReviewPayload;
  currentUser: { id: string; email: string };
  onDecide: (d: { decision:'approved'|'rejected'|'escalated'; justification: string }) => Promise<void>;
  onClose: () => void;
}) {
  const [decision, setDecision] = useState<'approved'|'rejected'|'escalated'|null>(null);
  const [justification, setJustification] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const minChars = 40;

  const canSubmit = decision !== null && justification.trim().length >= minChars && !submitting;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-[860px] max-h-[90vh] overflow-y-auto p-6">
        <header className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Trajectory Review Required</h2>
            <p className="text-sm text-neutral-500">
              Mission <code>{payload.missionId}</code> · Session <code>{payload.sessionId}</code>
            </p>
          </div>
          <span className="px-2 py-1 rounded text-xs font-mono bg-amber-100 text-amber-800">
            tier={payload.approval.tier}
          </span>
        </header>

        <section className="grid grid-cols-2 gap-4 mb-4">
          <ScoreCard label="Coverage"          v={payload.scores.coverage}         good={(x)=>x>=0.85}/>
          <ScoreCard label="Defect Likelihood" v={payload.scores.defectLikelihood} good={(x)=>x>=0.6}/>
          <ScoreCard label="Collision Risk"    v={payload.scores.collisionRisk}    good={(x)=>x<=0.02} invert/>
          <ScoreCard label="Smoothness"        v={payload.scores.smoothness}       good={(x)=>x>=0.5}/>
          <ScoreCard label="Energy (J)"        v={payload.scores.energy} raw />
          <ScoreCard label="Composite"         v={payload.scores.composite}        good={(x)=>x>=0.7}/>
        </section>

        <section className="mb-4">
          <h3 className="text-sm font-semibold mb-2">Why review was triggered</h3>
          <ul className="list-disc pl-5 text-sm text-neutral-700">
            {payload.approval.reasons.map((r,i)=> <li key={i}>{r}</li>)}
          </ul>
          <p className="text-xs text-neutral-500 mt-1">policy: {payload.approval.policyVersion}</p>
        </section>

        <section className="mb-4">
          <h3 className="text-sm font-semibold mb-2">Decision</h3>
          <div className="flex gap-2">
            {(['approved','rejected','escalated'] as const).map(d => (
              <button key={d}
                onClick={()=>setDecision(d)}
                className={`px-3 py-2 rounded border text-sm
                  ${decision===d ? 'border-black bg-black text-white' : 'border-neutral-300'}`}>
                {d}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-4">
          <h3 className="text-sm font-semibold mb-1">Justification (required, ≥{minChars} chars)</h3>
          <textarea
            value={justification}
            onChange={e=>setJustification(e.target.value)}
            rows={4}
            className="w-full border rounded p-2 text-sm font-mono"
            placeholder="Explain operational context, accepted risk, mitigations, and reference to mission brief."
          />
          <p className="text-xs text-neutral-500 mt-1">
            {justification.trim().length} / {minChars}+ chars · approver: {currentUser.email}
          </p>
        </section>

        <footer className="flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded border text-sm">Cancel</button>
          <button
            disabled={!canSubmit}
            onClick={async ()=>{
              if (!decision) return;
              setSubmitting(true);
              try { await onDecide({ decision, justification: justification.trim() }); }
              finally { setSubmitting(false); }
            }}
            className="px-3 py-2 rounded bg-black text-white text-sm disabled:opacity-40">
            {submitting ? 'Submitting…' : 'Submit decision'}
          </button>
        </footer>
      </div>
    </div>
  );
}

function ScoreCard({ label, v, good, invert, raw }:{
  label:string; v:number; good?:(x:number)=>boolean; invert?:boolean; raw?:boolean;
}) {
  const ok = good ? good(v) : true;
  const color = raw ? 'text-neutral-700' : ok ? 'text-emerald-700' : 'text-red-700';
  const bg    = raw ? 'bg-neutral-50' : ok ? 'bg-emerald-50' : 'bg-red-50';
  return (
    <div className={`rounded p-3 ${bg}`}>
      <div className="text-xs text-neutral-500">{label}</div>
      <div className={`text-2xl font-mono ${color}`}>{raw ? v.toFixed(0) : (v*100).toFixed(1)+'%'}</div>
    </div>
  );
}