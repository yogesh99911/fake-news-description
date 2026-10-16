import {
  User,
  NewsArticle,
  Prediction,
  Feedback,
  ArticleHistoryItem,
  UserStats,
  SystemStats,
  DemoSample,
  FeedbackCategory,
  InputMode,
} from '../types/index.js';

const TOKEN_KEY = 'truthlens_auth_token';

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});

  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      authStorage.clearToken();
    }
    throw new Error(data.error || `HTTP request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    return request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    return request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      authStorage.clearToken();
    }
  },

  async getCurrentUser(): Promise<User> {
    return request<User>('/api/auth/me');
  },

  // News & Analysis
  async extractUrl(url: string): Promise<{ title: string; content: string; source_name: string }> {
    return request('/api/extract-url', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },

  async submitAndAnalyzeNews(payload: {
    title: string;
    content: string;
    source_name?: string;
    source_url?: string;
    input_mode?: InputMode;
    is_demo?: boolean;
  }): Promise<{ article: NewsArticle; prediction: Prediction }> {
    return request<{ article: NewsArticle; prediction: Prediction }>('/api/news', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getNewsHistory(params?: {
    q?: string;
    label?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: ArticleHistoryItem[]; total: number; page: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.label) query.set('label', params.label);
    if (params?.sort) query.set('sort', params.sort);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());

    return request(`/api/news?${query.toString()}`);
  },

  async getNewsArticleDetail(newsId: string): Promise<{
    article: NewsArticle;
    prediction: Prediction | null;
    feedbacks: Feedback[];
  }> {
    return request(`/api/news/${newsId}`);
  },

  async deleteArticle(newsId: string): Promise<{ message: string }> {
    return request(`/api/news/${newsId}`, {
      method: 'DELETE',
    });
  },

  // Feedback
  async submitFeedback(payload: {
    prediction_id: string;
    feedback_text: string;
    feedback_category: FeedbackCategory;
    supporting_source_url?: string;
  }): Promise<{ feedback: Feedback; message: string }> {
    return request<{ feedback: Feedback; message: string }>('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getUserFeedbacks(): Promise<Feedback[]> {
    return request<Feedback[]>('/api/feedback');
  },

  // Stats
  async getUserStats(): Promise<UserStats> {
    return request<UserStats>('/api/stats');
  },

  // Demo & Classroom Samples
  async getDemoSamples(): Promise<DemoSample[]> {
    return request<DemoSample[]>('/api/demo/samples');
  },

  async seedDemoData(): Promise<{ message: string }> {
    return request('/api/demo/seed', { method: 'POST' });
  },

  // Admin
  async getAdminOverview(): Promise<{
    stats: SystemStats;
    feedbacks: Feedback[];
    articlesCount: number;
    predictionsCount: number;
    recentFeedbacks: Feedback[];
  }> {
    return request('/api/admin/overview');
  },
};

// CSV Export Helper
export function exportArticlesToCSV(items: ArticleHistoryItem[], filename = 'truthlens_history.csv') {
  const headers = ['Article ID', 'Title', 'Input Mode', 'Submission Date', 'Predicted Label', 'Confidence Score', 'Summary'];
  const rows = items.map((item) => {
    const a = item.article;
    const p = item.prediction;
    return [
      `"${a.news_id}"`,
      `"${(a.title || '').replace(/"/g, '""')}"`,
      `"${a.input_mode}"`,
      `"${a.submission_date}"`,
      `"${p?.predicted_label || 'UNANALYZED'}"`,
      `"${p ? Math.round(p.confidence_score * 100) + '%' : 'N/A'}"`,
      `"${(p?.summary || '').replace(/"/g, '""')}"`,
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
