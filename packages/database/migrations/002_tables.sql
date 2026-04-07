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
