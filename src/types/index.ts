export type UserRole = 'user' | 'admin';

export interface User {
  user_id: string;
  name: string;
  email: string;
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
  confidence_score: number;
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

export interface ArticleHistoryItem {
  article: NewsArticle;
  prediction: Prediction | null;
}

export interface UserStats {
  totalAnalyzed: number;
  realCount: number;
  fakeCount: number;
  needsVerificationCount: number;
  totalFeedback: number;
  distribution: { name: string; count: number; color: string }[];
  timeline: { date: string; real: number; fake: number; needs_verification: number; total: number }[];
}

export interface SystemStats {
  totalUsers: number;
  totalArticles: number;
  totalPredictions: number;
  totalFeedbacks: number;
  realCount: number;
  fakeCount: number;
  verifyCount: number;
  disputedCount: number;
  distribution: { name: string; count: number; color: string }[];
}

export interface DemoSample {
  label: string;
  title: string;
  content: string;
  source_name?: string;
  source_url?: string;
}
