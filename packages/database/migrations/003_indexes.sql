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
