// Survey Builder types — mirrors 007_surveys.sql schema

export interface TargetSegment {
  wards?: string[];
  age_groups?: string[];
  support_levels?: string[];
}

export interface Survey {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "active" | "paused" | "completed" | "archived";
  survey_type: "voter_priority" | "candidate_preference" | "issue_satisfaction" | "event_feedback" | "custom";
  target_segment: TargetSegment;
  distribution: string[];
  question_count: number;
  response_count: number;
  completion_rate: number;
  created_by: string | null;
  published_at: string | null;
  closes_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SurveyQuestion {
  id: string;
  survey_id: string;
  sort_order: number;
  question: string;
  help_text?: string | null;
  placeholder?: string | null;
  type: "single_choice" | "multiple_choice" | "rating" | "text" | "yes_no"
    | "short_text" | "long_text" | "number" | "email" | "phone" | "date" | "dropdown" | "section_header";
  options: string[];
  required: boolean;
  created_at: string;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  voter_contact_id: string | null;
  respondent_phone: string | null;
  respondent_name: string | null;
  ward: string | null;
  age_group: string | null;
  completed: boolean;
  submitted_at: string;
}

export interface SurveyAnswer {
  id: string;
  response_id: string;
  question_id: string;
  answer: Record<string, unknown>;
  created_at: string;
}

export interface SurveyWithQuestions extends Survey {
  survey_questions: SurveyQuestion[];
}

// Client-side builder state (before saving)
export interface QuestionDraft {
  tempId: string;
  question: string;
  helpText?: string;
  type: SurveyQuestion["type"];
  options: string[];
  required: boolean;
  placeholder?: string;
}

// API payloads
export interface CreateSurveyPayload {
  title: string;
  description?: string;
  survey_type: Survey["survey_type"];
  target_segment?: TargetSegment;
  distribution?: string[];
  closes_at?: string;
  questions: Omit<QuestionDraft, "tempId">[];
  publish?: boolean;
}

export interface SubmitResponsePayload {
  respondent_phone?: string;
  respondent_name?: string;
  ward?: string;
  age_group?: string;
  answers: { question_id: string; answer: Record<string, unknown> }[];
}

// Analytics types
export interface QuestionStats {
  question_id: string;
  question: string;
  type: SurveyQuestion["type"];
  options: string[];
  total_answers: number;
  option_counts?: Record<string, number>;
  average?: number;
  distribution?: Record<number, number>;
  text_responses?: string[];
}

export interface SurveyAnalytics {
  survey: Survey;
  questions: SurveyQuestion[];
  total_responses: number;
  completed_responses: number;
  completion_rate: number;
  question_stats: QuestionStats[];
  ward_breakdown: Record<string, number>;
}
