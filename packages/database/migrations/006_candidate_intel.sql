-- VoterCore: Candidate Intelligence table
-- Stores AI-researched intel per candidate from Exa, Perplexity, and social media analysis
-- Run AFTER 005_additions.sql

CREATE TABLE IF NOT EXISTS candidate_intel (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id           uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  party_affiliation      text,
  campaign_platforms     text[],
  social_media_followers jsonb DEFAULT '{}'::jsonb,
  local_endorsements     text[],
  popularity_notes       text,
  dcp_support_ratio      numeric(5,2) DEFAULT 0,
  fame_rank              integer,
  exa_research           jsonb DEFAULT '{}'::jsonb,
  perplexity_analysis    text,
  sources                text[],
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),
  UNIQUE(candidate_id)
);

CREATE INDEX IF NOT EXISTS candidate_intel_candidate_id_idx ON candidate_intel (candidate_id);
CREATE INDEX IF NOT EXISTS candidate_intel_fame_rank_idx    ON candidate_intel (fame_rank);

-- Reuse the update_updated_at() trigger function from 002_tables.sql
CREATE TRIGGER candidate_intel_updated_at
  BEFORE UPDATE ON candidate_intel
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE candidate_intel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "candidate_intel_select" ON candidate_intel
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "candidate_intel_insert" ON candidate_intel
  FOR INSERT WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'campaign-manager', 'research')
  );

CREATE POLICY "candidate_intel_update" ON candidate_intel
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'campaign-manager', 'research')
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE candidate_intel;
