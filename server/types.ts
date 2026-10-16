export type UserRole = 'user' | 'admin';

export interface User {
  user_id: string;
  name: string;
  email: string;
  password_hash: string;
  salt: string;
  role: UserRole;
  created_at: string;
}

export type InputMode = 'paste' | 'url';

export interface NewsArticle {
  news_id: string;
  user_id: string;
  title: string;
  content: string;
  source_name?: string;
  source_url?: string;
  input_mode: InputMode;
  submission_date: string;
}

export type PredictedLabel = 'REAL' | 'FAKE' | 'NEEDS VERIFICATION';

export interface EvidenceSource {
  title: string;
  url?: string;
  snippet?: string;
  credibility_note?: string;
}

export interface Prediction {
  prediction_id: string;
  news_id: string;
  user_id: string;
  predicted_label: PredictedLabel;
  confidence_score: number; // 0.0 - 1.0
  summary: string;
  explanation: string;
  key_claims: string[];
  warning_signs: string[];
  evidence_sources: EvidenceSource[];
  verification_steps: string[];
  limitations: string[];
  model_version: string;
  prediction_date: string;
  is_demo?: boolean;
}

export type FeedbackCategory =
  | 'Correct Prediction'
  | 'Incorrect Prediction'
  | 'Unsure'
  | 'General Feedback';

export interface Feedback {
  feedback_id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  prediction_id: string;
  article_title?: string;
  predicted_label?: PredictedLabel;
  feedback_text: string;
  feedback_category: FeedbackCategory;
  supporting_source_url?: string;
  feedback_date: string;
}

export interface DatabaseSchema {
  users: User[];
  articles: NewsArticle[];
  predictions: Prediction[];
  feedbacks: Feedback[];
}

export interface AuthSession {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
}
