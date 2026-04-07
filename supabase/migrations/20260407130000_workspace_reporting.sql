-- Shared reporting tables for dashboard pages that previously used mock data

CREATE TABLE IF NOT EXISTS workspace_snapshots (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace   text NOT NULL,
  slug        text NOT NULL,
  title       text,
  summary     text,
  payload     jsonb NOT NULL DEFAULT '{}'::jsonb,
  captured_at timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workspace_snapshots_workspace_idx
  ON workspace_snapshots (workspace, slug, captured_at DESC);

CREATE TABLE IF NOT EXISTS workspace_series (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace    text NOT NULL,
  slug         text NOT NULL,
  series_key   text NOT NULL,
  label        text,
  period_label text NOT NULL,
  value_num    numeric,
  value_text   text,
  sort_order   integer NOT NULL DEFAULT 0,
  meta         jsonb NOT NULL DEFAULT '{}'::jsonb,
  captured_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workspace_series_workspace_idx
  ON workspace_series (workspace, slug, captured_at DESC, sort_order ASC);

CREATE TABLE IF NOT EXISTS workspace_records (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace    text NOT NULL,
  record_type  text NOT NULL,
  code         text,
  title        text NOT NULL,
  subtitle     text,
  status       text,
  owner_label  text,
  primary_date timestamptz,
  meta         jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order   integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workspace_records_workspace_idx
  ON workspace_records (workspace, record_type, created_at DESC, sort_order ASC);

ALTER TABLE workspace_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_snapshots_select_all" ON workspace_snapshots
  FOR SELECT USING (true);
CREATE POLICY "workspace_series_select_all" ON workspace_series
  FOR SELECT USING (true);
CREATE POLICY "workspace_records_select_all" ON workspace_records
  FOR SELECT USING (true);

CREATE POLICY "workspace_snapshots_write_admin" ON workspace_snapshots
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'campaign-manager')
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'campaign-manager')
  );

CREATE POLICY "workspace_series_write_admin" ON workspace_series
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'campaign-manager')
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'campaign-manager')
  );

CREATE POLICY "workspace_records_write_admin" ON workspace_records
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'campaign-manager')
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'campaign-manager')
  );

ALTER PUBLICATION supabase_realtime ADD TABLE workspace_snapshots;
ALTER PUBLICATION supabase_realtime ADD TABLE workspace_series;
ALTER PUBLICATION supabase_realtime ADD TABLE workspace_records;
