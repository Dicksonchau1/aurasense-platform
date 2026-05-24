-- ============================================================
-- Nurse Rehearse Sandbox schema
-- ============================================================

create table if not exists rehearse_sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  started_at      timestamptz not null default now(),
  ended_at        timestamptz,
  specialty       text not null default 'psych',     -- psych | community | icu | general
  question_id     text,
  duration_ms     integer,
  posture_avg     numeric(5,2),
  framing_avg     numeric(5,2),
  gaze_avg        numeric(5,2),
  envelope_avg    numeric(5,2),
  consistency_avg numeric(5,2),
  transcript      text,
  ai_feedback     jsonb,
  recording_url   text,
  created_at      timestamptz not null default now()
);

create index if not exists rehearse_sessions_user_idx
  on rehearse_sessions (user_id, started_at desc);

create table if not exists rehearse_questions (
  id          text primary key,
  specialty   text not null,
  prompt      text not null,
  rubric      jsonb,
  difficulty  integer not null default 2,           -- 1..5
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- Seed: psych + community rehab + ICU + general banks
-- ============================================================
insert into rehearse_questions (id, specialty, prompt, rubric, difficulty) values
  ('psych-01', 'psych',
    'A patient with paranoid schizophrenia refuses depot medication and is becoming hostile. Walk me through your assessment and de-escalation.',
    '{"focus":["safety","therapeutic communication","capacity","MHO 136"],"weight":{"safety":0.4,"communication":0.3,"legal":0.3}}'::jsonb, 4),
  ('psych-02', 'psych',
    'A teenager presents to the CMHC with first-episode psychosis and suicidal ideation. What is your immediate plan?',
    '{"focus":["risk triage","family engagement","EASY referral"]}'::jsonb, 4),
  ('psych-03', 'psych',
    'Describe how you would conduct a mental state examination in 5 minutes.',
    '{"focus":["ASEPTIC framework","documentation"]}'::jsonb, 2),
  ('psych-04', 'psych',
    'A colleague discloses that they have started self-medicating with patient supplies. What do you do?',
    '{"focus":["duty of care","Nursing Council code","escalation"]}'::jsonb, 5),

  ('community-01', 'community',
    'You visit an elderly stroke patient at home and notice the carer is overwhelmed and dismissive. How do you intervene?',
    '{"focus":["carer burden","CGAT referral","safeguarding"]}'::jsonb, 3),
  ('community-02', 'community',
    'A patient with COPD on home oxygen continues to smoke. How do you handle the safety risk and the autonomy issue?',
    '{"focus":["motivational interviewing","fire risk","documentation"]}'::jsonb, 4),
  ('community-03', 'community',
    'Walk through your falls-risk assessment for a newly discharged hip-replacement patient.',
    '{"focus":["STRATIFY","home environment","OT referral"]}'::jsonb, 2),
  ('community-04', 'community',
    'How do you build rapport with a patient who speaks only Cantonese and distrusts Western medicine?',
    '{"focus":["cultural competence","language broker","family involvement"]}'::jsonb, 3),

  ('icu-01', 'icu',
    'Your ventilated patient suddenly desaturates to 82%. Walk me through DOPES.',
    '{"focus":["airway","breathing","SBAR call"]}'::jsonb, 4),
  ('icu-02', 'icu',
    'How do you titrate noradrenaline in septic shock?',
    '{"focus":["MAP target","fluid balance","Surviving Sepsis"]}'::jsonb, 5),

  ('general-01', 'general',
    'Tell me about a time you advocated for a patient against a senior doctor.',
    '{"focus":["assertiveness","SBAR","outcome"]}'::jsonb, 3),
  ('general-02', 'general',
    'Why this hospital, why now, why nursing?',
    '{"focus":["motivation","values","specificity"]}'::jsonb, 1),
  ('general-03', 'general',
    'How do you handle a medication error you caused?',
    '{"focus":["honesty","incident reporting","learning"]}'::jsonb, 3)
on conflict (id) do nothing;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table rehearse_sessions enable row level security;
alter table rehearse_questions enable row level security;

drop policy if exists "rehearse_sessions_own" on rehearse_sessions;
create policy "rehearse_sessions_own" on rehearse_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "rehearse_questions_read" on rehearse_questions;
create policy "rehearse_questions_read" on rehearse_questions
  for select using (active = true);
