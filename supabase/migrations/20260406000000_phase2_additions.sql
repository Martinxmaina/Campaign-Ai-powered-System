-- VoterCore Phase 2 additions
-- Run this in Supabase SQL Editor → New Query → Run

-- ── Audit Logs ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid,
  user_email  text,
  role        text,
  action      text NOT NULL,   -- create / update / delete / view / export / login / logout
  module      text NOT NULL,   -- candidates / war-room / finance / field / admin / ...
  record_id   text,
  details     jsonb,
  ip_address  text,
  result      text NOT NULL DEFAULT 'success',  -- success / error
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_module_idx     ON audit_logs (module);
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx    ON audit_logs (user_id);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
-- Super-admins and finance can read all logs
CREATE POLICY "audit_logs_select" ON audit_logs
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'finance', 'campaign-manager')
  );
-- Any authenticated user can insert their own logs
CREATE POLICY "audit_logs_insert" ON audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);


-- ── Notifications ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  body        text,
  type        text NOT NULL DEFAULT 'info',  -- info / warning / critical / success
  link        text,
  read        boolean NOT NULL DEFAULT false,
  user_id     uuid,   -- null = broadcast to all authenticated users
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx   ON notifications (user_id);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications (created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_read_idx       ON notifications (read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_select" ON notifications
  FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "notifications_update" ON notifications
  FOR UPDATE USING (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "notifications_insert" ON notifications
  FOR INSERT WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'campaign-manager')
    OR auth.uid() IS NOT NULL
  );


-- ── Political Parties ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS political_parties (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  short_name    text NOT NULL UNIQUE,
  color         text,             -- Tailwind bg class e.g. bg-red-600
  hex_color     text,             -- hex value e.g. #dc2626 for SVG use
  logo_url      text,
  description   text,
  coalition     text,             -- e.g. Kenya Kwanza, Azimio
  founded_year  integer,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE political_parties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parties_select_all" ON political_parties FOR SELECT USING (true);
CREATE POLICY "parties_insert_admin" ON political_parties
  FOR INSERT WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'campaign-manager')
  );
CREATE POLICY "parties_update_admin" ON political_parties
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'campaign-manager')
  );

-- Seed known Kenyan parties
INSERT INTO political_parties (name, short_name, color, hex_color, coalition, description, founded_year)
VALUES
  ('United Democratic Alliance', 'UDA',       'bg-red-600',     '#dc2626', 'Kenya Kwanza', 'Ruling party — William Ruto''s vehicle', 2020),
  ('Jubilee Party',              'Jubilee',    'bg-blue-700',    '#1d4ed8', NULL,           'Former ruling party of Uhuru Kenyatta', 2016),
  ('Orange Democratic Movement', 'ODM',        'bg-orange-500',  '#f97316', 'Azimio',       'Raila Odinga''s party', 2005),
  ('Democratic Congress Party',  'DCP',        'bg-green-600',   '#16a34a', NULL,           'Democratic Congress Party', 2013),
  ('Wiper Democratic Movement',  'Wiper',      'bg-emerald-600', '#059669', 'Azimio',       'Kalonzo Musyoka''s party', 2012),
  ('Forum for Restoration of Democracy — Kenya', 'Ford Kenya', 'bg-yellow-500', '#eab308', 'Azimio', 'Moses Wetangula''s party', 1992),
  ('Amani National Congress',    'ANC',        'bg-indigo-600',  '#4f46e5', 'Kenya Kwanza', 'Musalia Mudavadi''s party', 2012),
  ('Independent',                'Independent','bg-slate-500',   '#64748b', NULL,           'Independent candidates', NULL),
  ('To Be Determined',           'TBD',        'bg-slate-300',   '#cbd5e1', NULL,           'Party not yet confirmed', NULL)
ON CONFLICT (short_name) DO NOTHING;


-- ── Political Seats ───────────────────────────────────────────────────────────
-- Tracks ALL elected seats: President, Governor, Senator, MP, Women Rep, MCA
CREATE TABLE IF NOT EXISTS political_seats (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seat_type            text NOT NULL,  -- president / deputy_president / governor / deputy_governor / senator / women_rep / mp / mca
  level                text NOT NULL,  -- national / county / constituency / ward
  county               text DEFAULT 'Nyandarua',
  constituency         text,           -- e.g. "Ol Kalou"
  ward                 text,           -- for MCA seats
  candidate_name       text,
  candidate_photo_url  text,
  party_id             uuid REFERENCES political_parties(id) ON DELETE SET NULL,
  vote_count           integer NOT NULL DEFAULT 0,
  vote_share           numeric(5,2) NOT NULL DEFAULT 0,
  status               text NOT NULL DEFAULT 'declared',  -- declared / projected / tbc / unofficial
  notes                text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS political_seats_seat_type_idx    ON political_seats (seat_type);
CREATE INDEX IF NOT EXISTS political_seats_constituency_idx ON political_seats (constituency);
CREATE INDEX IF NOT EXISTS political_seats_party_id_idx     ON political_seats (party_id);

ALTER TABLE political_seats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seats_select_all" ON political_seats FOR SELECT USING (true);
CREATE POLICY "seats_insert_admin" ON political_seats
  FOR INSERT WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'campaign-manager', 'research')
  );
CREATE POLICY "seats_update_admin" ON political_seats
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'campaign-manager')
  );


-- ── Election Events (Countdown) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS election_events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name   text NOT NULL,
  event_date   timestamptz NOT NULL,
  description  text,
  type         text NOT NULL DEFAULT 'election',  -- election / deadline / rally / primary / registration
  is_primary   boolean NOT NULL DEFAULT false,    -- the main countdown shown system-wide
  created_by   uuid,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Only one event can be primary — enforce with a partial unique index
CREATE UNIQUE INDEX IF NOT EXISTS election_events_primary_idx
  ON election_events (is_primary)
  WHERE is_primary = true;

ALTER TABLE election_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_select_all" ON election_events FOR SELECT USING (true);
CREATE POLICY "events_insert_admin" ON election_events
  FOR INSERT WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'campaign-manager')
  );
CREATE POLICY "events_update_admin" ON election_events
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'campaign-manager')
  );
CREATE POLICY "events_delete_admin" ON election_events
  FOR DELETE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'campaign-manager')
  );


-- ── Candidates: add social media columns ─────────────────────────────────────
ALTER TABLE candidates
  ADD COLUMN IF NOT EXISTS twitter_handle    text,
  ADD COLUMN IF NOT EXISTS facebook_url      text,
  ADD COLUMN IF NOT EXISTS instagram_handle  text,
  ADD COLUMN IF NOT EXISTS youtube_url       text,
  ADD COLUMN IF NOT EXISTS tiktok_url        text;


-- ── Enable Realtime on new tables ─────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE election_events;
