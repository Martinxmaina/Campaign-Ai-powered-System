-- VoterCore: Survey Builder tables
-- Run AFTER 006_candidate_intel.sql

-- ── Surveys (master table) ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS surveys (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  description     text,
  status          text NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  survey_type     text NOT NULL DEFAULT 'custom'
                  CHECK (survey_type IN ('voter_priority', 'candidate_preference', 'issue_satisfaction', 'event_feedback', 'custom')),
  target_segment  jsonb DEFAULT '{}'::jsonb,
  distribution    text[] DEFAULT '{}',
  question_count  integer NOT NULL DEFAULT 0,
  response_count  integer NOT NULL DEFAULT 0,
  completion_rate numeric(5,2) DEFAULT 0,
  created_by      uuid REFERENCES auth.users(id),
  published_at    timestamptz,
  closes_at       timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ── Survey Questions (ordered per survey) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS survey_questions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id   uuid NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  sort_order  integer NOT NULL DEFAULT 0,
  question    text NOT NULL,
  type        text NOT NULL
              CHECK (type IN ('single_choice', 'multiple_choice', 'rating', 'text', 'yes_no')),
  options     jsonb DEFAULT '[]'::jsonb,
  required    boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── Survey Responses (one per respondent) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS survey_responses (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id         uuid NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  voter_contact_id  uuid REFERENCES voter_contacts(id) ON DELETE SET NULL,
  respondent_phone  text,
  respondent_name   text,
  ward              text,
  age_group         text CHECK (age_group IS NULL OR age_group IN ('18-25', '26-35', '36-50', '51+')),
  completed         boolean NOT NULL DEFAULT false,
  submitted_at      timestamptz NOT NULL DEFAULT now()
);

-- ── Survey Answers (one per question per response) ───────────────────────────
CREATE TABLE IF NOT EXISTS survey_answers (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id  uuid NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
  question_id  uuid NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
  answer       jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS surveys_status_idx ON surveys (status);
CREATE INDEX IF NOT EXISTS surveys_created_at_idx ON surveys (created_at DESC);
CREATE INDEX IF NOT EXISTS surveys_created_by_idx ON surveys (created_by);

CREATE INDEX IF NOT EXISTS survey_questions_survey_id_idx ON survey_questions (survey_id);
CREATE INDEX IF NOT EXISTS survey_questions_sort_idx ON survey_questions (survey_id, sort_order);

CREATE INDEX IF NOT EXISTS survey_responses_survey_id_idx ON survey_responses (survey_id);
CREATE INDEX IF NOT EXISTS survey_responses_ward_idx ON survey_responses (ward);
CREATE INDEX IF NOT EXISTS survey_responses_voter_contact_idx ON survey_responses (voter_contact_id);

CREATE INDEX IF NOT EXISTS survey_answers_response_id_idx ON survey_answers (response_id);
CREATE INDEX IF NOT EXISTS survey_answers_question_id_idx ON survey_answers (question_id);

-- ── Triggers ─────────────────────────────────────────────────────────────────

-- Reuse update_updated_at() from 002_tables.sql
CREATE TRIGGER surveys_updated_at
  BEFORE UPDATE ON surveys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update response_count and completion_rate on surveys when responses change
CREATE OR REPLACE FUNCTION update_survey_response_stats()
RETURNS trigger AS $$
BEGIN
  UPDATE surveys SET
    response_count = (SELECT count(*) FROM survey_responses WHERE survey_id = NEW.survey_id),
    completion_rate = (
      SELECT COALESCE(
        ROUND((count(*) FILTER (WHERE completed = true)::numeric / NULLIF(count(*), 0)) * 100, 2),
        0
      )
      FROM survey_responses WHERE survey_id = NEW.survey_id
    )
  WHERE id = NEW.survey_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER survey_responses_stats_trigger
  AFTER INSERT OR UPDATE ON survey_responses
  FOR EACH ROW EXECUTE FUNCTION update_survey_response_stats();

-- ── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_answers ENABLE ROW LEVEL SECURITY;

-- Surveys: CRUD for super-admin, campaign-manager, comms
CREATE POLICY "surveys_select" ON surveys
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'campaign-manager', 'comms')
  );
CREATE POLICY "surveys_insert" ON surveys
  FOR INSERT WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'campaign-manager', 'comms')
  );
CREATE POLICY "surveys_update" ON surveys
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'campaign-manager', 'comms')
  );
CREATE POLICY "surveys_delete" ON surveys
  FOR DELETE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'campaign-manager')
  );

-- Questions: viewable by authenticated, modifiable by survey roles
CREATE POLICY "survey_questions_select" ON survey_questions
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "survey_questions_insert" ON survey_questions
  FOR INSERT WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'campaign-manager', 'comms')
  );
CREATE POLICY "survey_questions_update" ON survey_questions
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'campaign-manager', 'comms')
  );
CREATE POLICY "survey_questions_delete" ON survey_questions
  FOR DELETE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'campaign-manager', 'comms')
  );

-- Responses: insertable by any authenticated user, viewable by survey roles
CREATE POLICY "survey_responses_select" ON survey_responses
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'campaign-manager', 'comms')
  );
CREATE POLICY "survey_responses_insert" ON survey_responses
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Answers: same pattern as responses
CREATE POLICY "survey_answers_select" ON survey_answers
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super-admin', 'campaign-manager', 'comms')
  );
CREATE POLICY "survey_answers_insert" ON survey_answers
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ── Realtime ─────────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE surveys;
ALTER PUBLICATION supabase_realtime ADD TABLE survey_responses;
