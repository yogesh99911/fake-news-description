import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  FileText,
  MessageSquare,
  Sparkles,
  ArrowRight,
  TrendingUp,
  PieChart as PieChartIcon,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { UserStats, ArticleHistoryItem, Feedback } from '../types/index.js';
import { VerdictBadge } from '../components/VerdictBadge.js';

interface DashboardPageProps {
  onAnalyze: () => void;
  onViewArticle: (item: ArticleHistoryItem) => void;
  onViewHistory: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onAnalyze,
  onViewArticle,
  onViewHistory,
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentArticles, setRecentArticles] = useState<ArticleHistoryItem[]>([]);
  const [recentFeedbacks, setRecentFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, historyData, feedbackData] = await Promise.all([
        api.getUserStats(),
        api.getNewsHistory({ limit: 5, sort: 'newest' }),
        api.getUserFeedbacks(),
      ]);
      setStats(statsData);
      setRecentArticles(historyData.items);
      setRecentFeedbacks(feedbackData.slice(-5).reverse());
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const pieColors: Record<string, string> = {
    Real: '#16a34a',
    Fake: '#dc2626',
    'Needs Verification': '#d97706',
  };

  const chartData = stats?.distribution.filter((d) => d.count > 0) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg border border-slate-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
            Research Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">
            Welcome back, {user?.name || 'Researcher'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Monitor factual evaluation patterns, review confidence distributions, and track your ongoing audit submissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            title="Refresh statistics"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={onAnalyze}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 shadow-md transition-all flex items-center gap-2"
          >
            <Sparkles size={15} />
            Analyze New Article
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Analyzed */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Total Analyzed</span>
            <FileText size={16} className="text-indigo-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums">
            {stats?.totalAnalyzed ?? 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Articles audited</span>
        </div>

        {/* Real Count */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Real</span>
            <ShieldCheck size={16} />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 tabular-nums">
            {stats?.realCount ?? 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Credible & substantiated</span>
        </div>

        {/* Fake Count */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Fake</span>
            <AlertTriangle size={16} />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-600 tabular-nums">
            {stats?.fakeCount ?? 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Fabricated / debunked</span>
        </div>

        {/* Needs Verification */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Unverified</span>
            <HelpCircle size={16} />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 tabular-nums">
            {stats?.needsVerificationCount ?? 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Needs ground proof</span>
        </div>

        {/* Feedback Submissions */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Feedback</span>
            <MessageSquare size={16} className="text-teal-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums">
            {stats?.totalFeedback ?? 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Peer reviews submitted</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classification Distribution */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <PieChartIcon size={16} className="text-teal-500" />
              Verdict Distribution Breakdown
            </h3>
            <span className="text-[11px] text-slate-400">Database proportion</span>
          </div>

          {chartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={pieColors[entry.name] || '#64748b'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <PieChartIcon size={32} className="opacity-30 mb-2" />
              <p className="text-xs">No analysis records available yet.</p>
              <button
                onClick={onAnalyze}
                className="mt-3 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
              >
                Submit your first article
              </button>
            </div>
          )}
        </div>

        {/* 7-Day Activity Timeline */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-500" />
              Recent Analysis Timeline (Past 7 Days)
            </h3>
            <span className="text-[11px] text-slate-400">Submissions over time</span>
          </div>

          {stats?.timeline && stats.timeline.some((t) => t.total > 0) ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.timeline}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(val) => val.slice(5)}
                    stroke="#94a3b8"
                    fontSize={11}
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                  <Bar dataKey="real" name="Real" fill="#16a34a" stackId="a" />
                  <Bar dataKey="fake" name="Fake" fill="#dc2626" stackId="a" />
                  <Bar
                    dataKey="needs_verification"
                    name="Needs Verification"
                    fill="#d97706"
                    stackId="a"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <TrendingUp size={32} className="opacity-30 mb-2" />
              <p className="text-xs">No analysis timeline data for the past 7 days.</p>
              <button
                onClick={onAnalyze}
                className="mt-3 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
              >
                Analyze an article to start tracking trends
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Analysis History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Recent Analysis History
            </h3>
            <p className="text-xs text-slate-500">Your latest submitted articles</p>
          </div>
          <button
            onClick={onViewHistory}
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            View All ({stats?.totalAnalyzed ?? 0}) <ArrowRight size={13} />
          </button>
        </div>

        {recentArticles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3">Headline</th>
                  <th className="px-5 py-3">Verdict</th>
                  <th className="px-5 py-3">Confidence</th>
                  <th className="px-5 py-3">Submission Date</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentArticles.map((item) => (
                  <tr
                    key={item.article.news_id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white max-w-md truncate">
                      {item.article.title}
                    </td>
                    <td className="px-5 py-3.5">
                      {item.prediction ? (
                        <VerdictBadge
                          label={item.prediction.predicted_label}
                          confidence={item.prediction.confidence_score}
                          size="sm"
                          showConfidence={false}
                        />
                      ) : (
                        <span className="text-slate-400">Processing...</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 tabular-nums text-slate-700 dark:text-slate-300 font-semibold">
                      {item.prediction
                        ? `${Math.round(item.prediction.confidence_score * 100)}%`
                        : 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {new Date(item.article.submission_date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => onViewArticle(item)}
                        className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs">
            <p>No recent articles analyzed yet.</p>
            <button
              onClick={onAnalyze}
              className="mt-2 text-teal-600 font-semibold hover:underline"
            >
              Analyze your first article
            </button>
          </div>
        )}
      </div>

      {/* User's Submitted Feedback Table */}
      {recentFeedbacks.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Your Recent Model Feedback Submissions
            </h3>
            <p className="text-xs text-slate-500">
              Audit contributions helping evaluate model accuracy
            </p>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentFeedbacks.map((fb) => (
              <div key={fb.feedback_id} className="p-4 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {fb.feedback_category}
                  </span>
                  <span className="text-slate-400">
                    {new Date(fb.feedback_date).toLocaleDateString()}
                  </span>
                </div>
                {fb.article_title && (
                  <p className="text-slate-500 italic truncate">
                    Article: "{fb.article_title}"
                  </p>
                )}
                <p className="text-slate-700 dark:text-slate-300">
                  {fb.feedback_text}
                </p>
                {fb.supporting_source_url && (
                  <a
                    href={fb.supporting_source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-600 hover:underline flex items-center gap-1 pt-1"
                  >
                    Supporting link: {fb.supporting_source_url}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
