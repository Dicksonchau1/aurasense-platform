CREATE TABLE free_run_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id text NOT NULL,
  session_count int NOT NULL DEFAULT 0,
  total_contributions int NOT NULL DEFAULT 0,
  hours_elapsed double precision NOT NULL DEFAULT 0,
  current_h3_cell text,
  mean_uncertainty_latest double precision,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX free_run_status_run_id_idx ON free_run_status(run_id);
ALTER TABLE free_run_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY free_run_status_read ON free_run_status FOR SELECT USING (true);
CREATE POLICY free_run_status_write ON free_run_status
  FOR ALL USING (auth.role() = 'service_role');
