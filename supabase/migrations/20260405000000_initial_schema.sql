-- VoterCore: Enable required PostgreSQL extensions
-- Run this FIRST in Supabase SQL Editor

create extension if not exists vector;        -- pgvector for embeddings
create extension if not exists pg_trgm;       -- trigram index for fuzzy text search
create extension if not exists unaccent;      -- accent-insensitive search
-- VoterCore: Core tables
-- Run AFTER 001_extensions.sql

-- ─── Candidates ────────────────────────────────────────────────────────────
create table candidates (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  party               text,
  constituency        text default 'Ol Kalou',
  aliases             text[],
  photo_url           text,
  bio                 text,
  win_prob            numeric(5,2) default 0,
  sentiment_positive  numeric(5,2) default 0,
  sentiment_negative  numeric(5,2) default 0,
  sentiment_neutral   numeric(5,2) default 0,
  mention_count_7d    integer default 0,
  share_of_voice      numeric(5,2) default 0,
  momentum            text default 'stable' check (momentum in ('rising', 'stable', 'declining')),
  threat_level        text default 'low' check (threat_level in ('critical', 'high', 'medium', 'low', 'minimal')),
  is_our_candidate    boolean default false,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ─── Raw Posts (scraped content before analysis) ───────────────────────────
create table raw_posts (
  id           uuid primary key default gen_random_uuid(),
  platform     text not null check (platform in ('twitter', 'facebook', 'youtube', 'tiktok', 'instagram', 'news')),
  external_id  text,
  author       text,
  content      text not null,
  url          text,
  title        text,
  likes        integer default 0,
  comments     integer default 0,
  shares       integer default 0,
  posted_at    timestamptz,
  scraped_at   timestamptz default now(),
  unique(platform, external_id)
);

-- ─── Analyzed Posts (Claude AI analysis output) ────────────────────────────
create table analyzed_posts (
  id                    uuid primary key references raw_posts(id) on delete cascade,
  language              text,
  translation           text,
  sentiment             text check (sentiment in ('positive', 'negative', 'neutral')),
  sentiment_score       numeric(4,3),
  intent                text check (intent in ('vote_intent', 'criticism', 'support', 'neutral', 'spam', 'coordination')),
  candidates_mentioned  text[],
  parties_mentioned     text[],
  issues                text[],
  key_insight           text,
  relevance_score       numeric(4,3),
  is_bot_suspected      boolean default false,
  embedding             vector(1536),
  analyzed_at           timestamptz default now()
);

-- ─── Field Reports (ground team submissions) ───────────────────────────────
create table field_reports (
  id           uuid primary key default gen_random_uuid(),
  agent_id     uuid references auth.users(id),
  ward         text not null,
  location     text,
  report_type  text not null check (report_type in ('voter_sentiment', 'opposition_sighting', 'event_attended', 'voter_contact', 'alert')),
  candidate_id uuid references candidates(id),
  mood_score   integer check (mood_score between 1 and 5),
  notes        text,
  photo_url    text,
  priority     text default 'normal' check (priority in ('critical', 'high', 'normal', 'low')),
  is_synced    boolean default false,
  created_at   timestamptz default now()
);

-- ─── Voter Contacts (CRM) ─────────────────────────────────────────────────
create table voter_contacts (
  id            uuid primary key default gen_random_uuid(),
  phone         text,
  name          text,
  ward          text,
  age_group     text check (age_group in ('18-25', '26-35', '36-50', '51+')),
  gender        text,
  language_pref text default 'swahili',
  support_level text check (support_level in ('strong_support', 'lean_support', 'undecided', 'lean_against', 'against')),
  issues        text[],
  contact_count integer default 0,
  last_contact  timestamptz,
  notes         text,
  source        text check (source in ('ground_team', 'survey', 'event', 'call_center')),
  created_at    timestamptz default now()
);

-- ─── Messages Sent (outreach tracking) ─────────────────────────────────────
create table messages_sent (
  id              uuid primary key default gen_random_uuid(),
  channel         text check (channel in ('sms', 'whatsapp', 'email')),
  segment         jsonb,
  content         text,
  sent_count      integer default 0,
  delivered_count integer default 0,
  open_rate       numeric(5,2),
  response_rate   numeric(5,2),
  campaign_id     uuid,
  sent_at         timestamptz default now()
);

-- ─── A/B Tests ─────────────────────────────────────────────────────────────
create table ab_tests (
  id          uuid primary key default gen_random_uuid(),
  variant_a   text,
  variant_b   text,
  winner      text,
  confidence  numeric(5,2),
  segment     jsonb,
  channel     text,
  created_at  timestamptz default now()
);

-- ─── War Room Alerts ───────────────────────────────────────────────────────
create table war_room_alerts (
  id           uuid primary key default gen_random_uuid(),
  severity     text check (severity in ('critical', 'high', 'medium', 'info')),
  source       text,
  description  text,
  status       text default 'active' check (status in ('active', 'responding', 'resolved')),
  region       text,
  candidate_id uuid references candidates(id),
  created_at   timestamptz default now()
);

-- ─── Candidates History (time-series snapshots) ────────────────────────────
create table candidates_history (
  id              uuid primary key default gen_random_uuid(),
  candidate_id    uuid references candidates(id) on delete cascade,
  win_prob        numeric(5,2),
  sentiment_positive numeric(5,2),
  mention_count   integer,
  snapshot_at     timestamptz default now()
);

-- ─── Media Hits ────────────────────────────────────────────────────────────
create table media_hits (
  id           uuid primary key default gen_random_uuid(),
  outlet       text,
  headline     text,
  url          text,
  sentiment    text,
  candidate_id uuid references candidates(id),
  published_at timestamptz
);

-- ─── Events ────────────────────────────────────────────────────────────────
create table events (
  id             uuid primary key default gen_random_uuid(),
  title          text,
  ward           text,
  location       text,
  attendee_count integer,
  notes          text,
  event_date     timestamptz
);

-- ─── n8n Workflow Logs ─────────────────────────────────────────────────────
create table n8n_logs (
  id                uuid primary key default gen_random_uuid(),
  workflow_name     text,
  status            text check (status in ('success', 'failed')),
  records_processed integer,
  error             text,
  run_at            timestamptz default now()
);

-- ─── Updated_at trigger function ───────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger candidates_updated_at
  before update on candidates
  for each row execute function update_updated_at();
-- VoterCore: Indexes for performance
-- Run AFTER 002_tables.sql

-- Vector index for fast RAG queries (switch to ivfflat after ~1000+ rows)
-- NOTE: For initial deployment with <1000 rows, comment this out and use exact NN search.
-- Uncomment once you have sufficient data for the index to be effective.
-- create index on analyzed_posts
--   using ivfflat (embedding vector_cosine_ops)
--   with (lists = 100);

-- GIN index for fast candidate array lookup
create index idx_analyzed_posts_candidates on analyzed_posts using gin (candidates_mentioned);

-- GIN index for issues array lookup
create index idx_analyzed_posts_issues on analyzed_posts using gin (issues);

-- Index for time-based queries on analyzed posts
create index idx_analyzed_posts_analyzed_at on analyzed_posts (analyzed_at desc);

-- Index for raw posts deduplication and time queries
create index idx_raw_posts_scraped_at on raw_posts (scraped_at desc);
create index idx_raw_posts_platform on raw_posts (platform);

-- Index for field reports by ward and time
create index idx_field_reports_ward on field_reports (ward);
create index idx_field_reports_created_at on field_reports (created_at desc);
create index idx_field_reports_agent_id on field_reports (agent_id);

-- Index for war room alerts by severity and status
create index idx_war_room_alerts_severity on war_room_alerts (severity);
create index idx_war_room_alerts_status on war_room_alerts (status);
create index idx_war_room_alerts_created_at on war_room_alerts (created_at desc);

-- Index for candidates history time-series
create index idx_candidates_history_candidate on candidates_history (candidate_id, snapshot_at desc);

-- Index for voter contacts by ward and support level
create index idx_voter_contacts_ward on voter_contacts (ward);
create index idx_voter_contacts_support on voter_contacts (support_level);

-- Index for messages sent by channel and time
create index idx_messages_sent_channel on messages_sent (channel);
create index idx_messages_sent_sent_at on messages_sent (sent_at desc);

-- Trigram index for fuzzy text search on raw post content
create index idx_raw_posts_content_trgm on raw_posts using gin (content gin_trgm_ops);
-- VoterCore: Row Level Security Policies
-- Run AFTER 002_tables.sql
-- Requires Supabase Auth to be configured

-- Helper function to extract role from JWT
create or replace function public.user_role()
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
    (auth.jwt() -> 'user_metadata' ->> 'role') in ('super-admin', 'campaign-manager')
  ) with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') in ('super-admin', 'campaign-manager')
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
    (auth.jwt() -> 'user_metadata' ->> 'role') in ('super-admin', 'campaign-manager', 'research')
    or agent_id = auth.uid()
  );

-- ─── Voter Contacts ───────────────────────────────────────────────────────
-- CRM access for relevant roles
create policy "voter_contacts_select" on voter_contacts
  for select to authenticated using (
    (auth.jwt() -> 'user_metadata' ->> 'role') in ('super-admin', 'campaign-manager', 'call-center', 'comms')
  );

create policy "voter_contacts_insert" on voter_contacts
  for insert to authenticated with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') in ('super-admin', 'campaign-manager', 'call-center', 'comms')
  );

create policy "voter_contacts_update" on voter_contacts
  for update to authenticated using (
    (auth.jwt() -> 'user_metadata' ->> 'role') in ('super-admin', 'campaign-manager', 'call-center')
  ) with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') in ('super-admin', 'campaign-manager', 'call-center')
  );

-- ─── Messages Sent ────────────────────────────────────────────────────────
create policy "messages_sent_select" on messages_sent
  for select to authenticated using (
    (auth.jwt() -> 'user_metadata' ->> 'role') in ('super-admin', 'campaign-manager', 'comms')
  );

-- ─── A/B Tests ─────────────────────────────────────────────────────────────
create policy "ab_tests_select" on ab_tests
  for select to authenticated using (
    (auth.jwt() -> 'user_metadata' ->> 'role') in ('super-admin', 'campaign-manager', 'comms')
  );

-- ─── War Room Alerts ───────────────────────────────────────────────────────
-- All authenticated users can view alerts
create policy "war_room_alerts_select" on war_room_alerts
  for select to authenticated using (true);

-- Admins/managers can update alert status
create policy "war_room_alerts_update" on war_room_alerts
  for update to authenticated using (
    (auth.jwt() -> 'user_metadata' ->> 'role') in ('super-admin', 'campaign-manager')
  ) with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') in ('super-admin', 'campaign-manager')
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
    (auth.jwt() -> 'user_metadata' ->> 'role') in ('super-admin', 'campaign-manager', 'comms')
  ) with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') in ('super-admin', 'campaign-manager', 'comms')
  );

-- ─── n8n Logs ──────────────────────────────────────────────────────────────
create policy "n8n_logs_select" on n8n_logs
  for select to authenticated using (
    (auth.jwt() -> 'user_metadata' ->> 'role') in ('super-admin', 'campaign-manager')
  );
-- VoterCore: Vector search RPC function for RAG queries
-- Run AFTER 002_tables.sql

create or replace function match_analyzed_posts(
  query_embedding vector(1536),
  match_threshold float default 0.5,
  match_count int default 10
)
returns table (
  id uuid,
  key_insight text,
  translation text,
  sentiment text,
  candidates_mentioned text[],
  analyzed_at timestamptz,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    ap.id,
    ap.key_insight,
    ap.translation,
    ap.sentiment,
    ap.candidates_mentioned,
    ap.analyzed_at,
    1 - (ap.embedding <=> query_embedding) as similarity
  from analyzed_posts ap
  where ap.embedding is not null
    and 1 - (ap.embedding <=> query_embedding) > match_threshold
  order by ap.embedding <=> query_embedding
  limit match_count;
end;
$$;
