import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { LandingPage } from './pages/LandingPage.js';
import { AuthPage } from './pages/AuthPage.js';
import { AnalyzePage } from './pages/AnalyzePage.js';
import { AnalysisResultPage } from './pages/AnalysisResultPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { HistoryPage } from './pages/HistoryPage.js';

import { AdminPage } from './pages/AdminPage.js';
import { NewsArticle, Prediction, ArticleHistoryItem } from './types/index.js';
import { Sparkles, AlertCircle, RotateCcw } from 'lucide-react';

// Error Boundary for UI resilience
interface ErrorBoundaryProps {
  children: ReactNode;
  onReset: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('TruthLens UI Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-lg mx-auto my-16 p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Display Recovery Needed
          </h2>
          <p className="text-xs text-slate-500">
            {this.state.error?.message || 'An unexpected display error occurred while rendering the report.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                this.props.onReset();
              }}
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 shadow-xs transition-all"
            >
              <RotateCcw size={14} />
              Return to Analyze News
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const { user, loading } = useAuth();

  // Restore active view and article from sessionStorage so reloads never wipe the report
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(() => {
    try {
      const saved = sessionStorage.getItem('truthlens_active_article');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activePrediction, setActivePrediction] = useState<Prediction | null>(() => {
    try {
      const saved = sessionStorage.getItem('truthlens_active_prediction');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState<string>(() => {
    try {
      const savedView = sessionStorage.getItem('truthlens_current_view') === 'about' ? 'landing' : sessionStorage.getItem('truthlens_current_view') || 'landing';
      // If view was 'result' but there is no active article stored, default to 'analyze' or 'landing'
      if (savedView === 'result') {
        const savedArt = sessionStorage.getItem('truthlens_active_article');
        if (!savedArt) return 'analyze';
      }
      return savedView;
    } catch {
      return 'landing';
    }
  });

  const handleNavigate = (view: string, data?: any) => {
    if (view === 'result' && data) {
      setActiveArticle(data.article);
      setActivePrediction(data.prediction);
      try {
        sessionStorage.setItem('truthlens_active_article', JSON.stringify(data.article));
        sessionStorage.setItem('truthlens_active_prediction', JSON.stringify(data.prediction));
      } catch {}
    }
    setCurrentView(view);
    try {
      sessionStorage.setItem('truthlens_current_view', view);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalysisComplete = (article: NewsArticle, prediction: Prediction) => {
    setActiveArticle(article);
    setActivePrediction(prediction);
    try {
      sessionStorage.setItem('truthlens_active_article', JSON.stringify(article));
      sessionStorage.setItem('truthlens_active_prediction', JSON.stringify(prediction));
      sessionStorage.setItem('truthlens_current_view', 'result');
    } catch {}
    setCurrentView('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewArticle = (item: ArticleHistoryItem) => {
    if (item.prediction) {
      setActiveArticle(item.article);
      setActivePrediction(item.prediction);
      try {
        sessionStorage.setItem('truthlens_active_article', JSON.stringify(item.article));
        sessionStorage.setItem('truthlens_active_prediction', JSON.stringify(item.prediction));
        sessionStorage.setItem('truthlens_current_view', 'result');
      } catch {}
      setCurrentView('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-3 border-teal-500/30 border-t-teal-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">
            Loading TruthLens AI...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      <main className="flex-1">
        <ErrorBoundary onReset={() => handleNavigate('analyze')}>
          {currentView === 'landing' && (
            <LandingPage onNavigate={handleNavigate} />
          )}

          {currentView === 'auth' && (
            <AuthPage
              onSuccess={() => {
                handleNavigate('dashboard');
              }}
            />
          )}

          {currentView === 'analyze' && (
            <AnalyzePage
              onAnalysisComplete={handleAnalysisComplete}
              onRequireAuth={() => handleNavigate('auth')}
            />
          )}

          {currentView === 'result' && (
            activeArticle && activePrediction ? (
              <AnalysisResultPage
                article={activeArticle}
                prediction={activePrediction}
                onAnalyzeAnother={() => handleNavigate('analyze')}
                onViewHistory={() => handleNavigate('history')}
              />
            ) : (
              <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-md">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto">
                  <Sparkles size={24} />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  No Active Analysis Selected
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Submit a new article or open a past result from your history.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => handleNavigate('analyze')}
                    className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all"
                  >
                    Analyze News
                  </button>
                  <button
                    onClick={() => handleNavigate('history')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors"
                  >
                    View History
                  </button>
                </div>
              </div>
            )
          )}

          {currentView === 'dashboard' && (
            <DashboardPage
              onAnalyze={() => handleNavigate('analyze')}
              onViewArticle={handleViewArticle}
              onViewHistory={() => handleNavigate('history')}
            />
          )}

          {currentView === 'history' && (
            <HistoryPage
              onViewArticle={handleViewArticle}
              onAnalyzeNew={() => handleNavigate('analyze')}
            />
          )}



          {currentView === 'admin' && (
            user?.role === 'admin' ? (
              <AdminPage />
            ) : (
              <div className="max-w-md mx-auto my-20 p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <h2 className="font-bold text-base text-rose-600">Access Restricted</h2>
                <p className="text-xs text-slate-500">
                  Sign in with an administrator account to open this page.
                </p>
                <button
                  onClick={() => handleNavigate('landing')}
                  className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg"
                >
                  Return Home
                </button>
              </div>
            )
          )}
        </ErrorBoundary>
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
