-- Migration: Create audit_frames table and audit_chain_tips view

CREATE TABLE public.audit_frames (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    deployment_id text NOT NULL,
    run_id text NOT NULL,
    frame_id text NOT NULL UNIQUE,
    tick integer NOT NULL,
    content jsonb NOT NULL,
    geometric_anchor jsonb NOT NULL,
    structural_anchor jsonb NOT NULL,
    regime_anchor jsonb NOT NULL,
    audit_hash text NOT NULL,
    chain_hash text NOT NULL,
    previous_chain_hash text NOT NULL,
    captured_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_audit_frames_run_id_tick ON public.audit_frames (run_id, tick);
CREATE INDEX idx_audit_frames_deployment_run_captured ON public.audit_frames (deployment_id, run_id, captured_at);
CREATE UNIQUE INDEX idx_audit_frames_run_chain_hash ON public.audit_frames (run_id, chain_hash);

-- Enable Row Level Security
ALTER TABLE public.audit_frames ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY select_all ON public.audit_frames FOR SELECT USING (true);
CREATE POLICY insert_service_role ON public.audit_frames FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- View for latest chain tip per (deployment_id, run_id)
CREATE OR REPLACE VIEW public.audit_chain_tips AS
SELECT DISTINCT ON (deployment_id, run_id)
    deployment_id,
    run_id,
    chain_hash,
    tick,
    captured_at
FROM public.audit_frames
ORDER BY deployment_id, run_id, tick DESC, captured_at DESC;
