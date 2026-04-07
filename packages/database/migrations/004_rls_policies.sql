-- VoterCore: Row Level Security Policies
-- Run AFTER 002_tables.sql
-- Requires Supabase Auth to be configured

-- Helper function to extract role from JWT
create or replace function auth.user_role()
returns text as $$
  select coalesce(
    auth.jwt() -> 'user_metadata' ->> 'role',
    'anonymous'
  );
$$ language sql stable;

-- ─── Enable RLS on all tables ──────────────────────────────────────────────
alter table candidates enable row level security;
alter table raw_posts enable row level security;
alter table analyzed_posts enable row level security;
alter table field_reports enable row level security;
alter table voter_contacts enable row level security;
alter table messages_sent enable row level security;
alter table ab_tests enable row level security;
alter table war_room_alerts enable row level security;
alter table candidates_history enable row level security;
alter table media_hits enable row level security;
alter table events enable row level security;
alter table n8n_logs enable row level security;

-- ─── Candidates ────────────────────────────────────────────────────────────
-- All authenticated users can view candidates
create policy "candidates_select" on candidates
  for select to authenticated using (true);

-- Only admins and campaign managers can modify
create policy "candidates_modify" on candidates
  for all to authenticated using (
    auth.user_role() in ('super-admin', 'campaign-manager')
  ) with check (
    auth.user_role() in ('super-admin', 'campaign-manager')
  );

-- ─── Raw Posts ─────────────────────────────────────────────────────────────
-- All authenticated can read
create policy "raw_posts_select" on raw_posts
  for select to authenticated using (true);

-- Only service role inserts (via FastAPI) — no user policy needed for INSERT
-- Service role bypasses RLS

-- ─── Analyzed Posts ────────────────────────────────────────────────────────
create policy "analyzed_posts_select" on analyzed_posts
  for select to authenticated using (true);

-- ─── Field Reports ─────────────────────────────────────────────────────────
-- Ground agents can insert their own reports
create policy "field_reports_insert" on field_reports
  for insert to authenticated with check (
    agent_id = auth.uid()
  );

-- Ground agents see their ward's reports; admins/managers see all
create policy "field_reports_select" on field_reports
  for select to authenticated using (
    auth.user_role() in ('super-admin', 'campaign-manager', 'research')
    or agent_id = auth.uid()
  );

-- ─── Voter Contacts ───────────────────────────────────────────────────────
-- CRM access for relevant roles
create policy "voter_contacts_select" on voter_contacts
  for select to authenticated using (
    auth.user_role() in ('super-admin', 'campaign-manager', 'call-center', 'comms')
  );

create policy "voter_contacts_insert" on voter_contacts
  for insert to authenticated with check (
    auth.user_role() in ('super-admin', 'campaign-manager', 'call-center', 'comms')
  );

create policy "voter_contacts_update" on voter_contacts
  for update to authenticated using (
    auth.user_role() in ('super-admin', 'campaign-manager', 'call-center')
  ) with check (
    auth.user_role() in ('super-admin', 'campaign-manager', 'call-center')
  );

-- ─── Messages Sent ────────────────────────────────────────────────────────
create policy "messages_sent_select" on messages_sent
  for select to authenticated using (
    auth.user_role() in ('super-admin', 'campaign-manager', 'comms')
  );

-- ─── A/B Tests ─────────────────────────────────────────────────────────────
create policy "ab_tests_select" on ab_tests
  for select to authenticated using (
    auth.user_role() in ('super-admin', 'campaign-manager', 'comms')
  );

-- ─── War Room Alerts ───────────────────────────────────────────────────────
-- All authenticated users can view alerts
create policy "war_room_alerts_select" on war_room_alerts
  for select to authenticated using (true);

-- Admins/managers can update alert status
create policy "war_room_alerts_update" on war_room_alerts
  for update to authenticated using (
    auth.user_role() in ('super-admin', 'campaign-manager')
  ) with check (
    auth.user_role() in ('super-admin', 'campaign-manager')
  );

-- ─── Candidates History ───────────────────────────────────────────────────
create policy "candidates_history_select" on candidates_history
  for select to authenticated using (true);

-- ─── Media Hits ────────────────────────────────────────────────────────────
create policy "media_hits_select" on media_hits
  for select to authenticated using (true);

-- ─── Events ────────────────────────────────────────────────────────────────
create policy "events_select" on events
  for select to authenticated using (true);

create policy "events_modify" on events
  for all to authenticated using (
    auth.user_role() in ('super-admin', 'campaign-manager', 'comms')
  ) with check (
    auth.user_role() in ('super-admin', 'campaign-manager', 'comms')
  );

-- ─── n8n Logs ──────────────────────────────────────────────────────────────
create policy "n8n_logs_select" on n8n_logs
  for select to authenticated using (
    auth.user_role() in ('super-admin', 'campaign-manager')
  );
