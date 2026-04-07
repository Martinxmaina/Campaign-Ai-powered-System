-- VoterCore: Composite indexes for common query patterns
-- Run AFTER 003_indexes.sql

-- Composite: field_reports filtered by ward + sorted by time (used in sentiment, research pages)
create index if not exists idx_field_reports_ward_created_at
  on field_reports (ward, created_at desc);

-- Composite: field_reports by candidate + time (used in sentiment candidate mentions)
create index if not exists idx_field_reports_candidate_created_at
  on field_reports (candidate_id, created_at desc);

-- Composite: analyzed_posts by sentiment + time (used in alert detection, sentiment pulse)
create index if not exists idx_analyzed_posts_sentiment_time
  on analyzed_posts (sentiment, analyzed_at desc);

-- Composite: war_room_alerts by status + severity + time (used in war room dashboard)
create index if not exists idx_war_room_alerts_status_severity
  on war_room_alerts (status, severity, created_at desc);

-- Composite: raw_posts by platform + time (used in platform breakdown queries)
create index if not exists idx_raw_posts_platform_time
  on raw_posts (platform, scraped_at desc);

-- Index: audit_logs by module + time (used in worklog page filters)
create index if not exists idx_audit_logs_module_time
  on audit_logs (module, created_at desc);

-- Index: audit_logs by action + time
create index if not exists idx_audit_logs_action_time
  on audit_logs (action, created_at desc);

-- Index: candidates by win_prob desc (used in almost every candidates query)
create index if not exists idx_candidates_win_prob
  on candidates (win_prob desc nulls last);

-- Index: political_parties by short_name (used for party lookups from candidate.party string)
create index if not exists idx_political_parties_short_name
  on political_parties (short_name);
