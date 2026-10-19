import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  FileText,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  Search,
  MessageSquare,
} from 'lucide-react';
import { api } from '../services/api.js';
import { SystemStats, Feedback } from '../types/index.js';
import { ConfirmModal } from '../components/ConfirmModal.js';

export const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminOverview();
      setStats(res.stats);
      setFeedbacks(res.feedbacks);
    } catch (err: any) {
      setActionMessage(`Error loading admin overview: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleResetDemoData = async () => {
    try {
      const res = await api.seedDemoData();
      setActionMessage(res.message);
      setResetModalOpen(false);
      loadAdminData();
    } catch (err: any) {
      setActionMessage(`Failed to reset data: ${err.message}`);
    }
  };

  const filteredFeedbacks = feedbacks.filter((f) => {
    if (categoryFilter === 'ALL') return true;
    return f.feedback_category === categoryFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 text-white border border-purple-900/60 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <ShieldAlert size={14} />
              Administrator Control Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Admin overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Monitor aggregated platform predictions, review disputed labels, and manage sample datasets for presentations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAdminData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setResetModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-colors flex items-center gap-2"
          >
            <RotateCcw size={14} />
            Reset demo data
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-300 flex items-center justify-between">
          <span>{actionMessage}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Registered Users</span>
            <Users size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {stats?.totalUsers ?? 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Active user accounts</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Total Submissions</span>
            <FileText size={16} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {stats?.totalArticles ?? 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">News articles evaluated</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Real Verdicts</span>
            <CheckCircle2 size={16} />
          </div>
          <p className="text-2xl font-black text-emerald-600 tabular-nums">
            {stats?.realCount ?? 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Confirmed credible</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Fake Verdicts</span>
            <AlertTriangle size={16} />
          </div>
          <p className="text-2xl font-black text-rose-600 tabular-nums">
            {stats?.fakeCount ?? 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Debunked hoaxes</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-amber-600 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Disputed Reviews</span>
            <MessageSquare size={16} />
          </div>
          <p className="text-2xl font-black text-amber-600 tabular-nums">
            {stats?.disputedCount ?? 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Incorrect flag rate</span>
        </div>
      </div>

      {/* Peer Review & Feedback Inspection Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Feedback and reports
            </h3>
            <p className="text-xs text-slate-500">
              Review human evaluations and user-submitted counter-evidence
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Filter Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="ALL">All Categories</option>
              <option value="Incorrect Prediction">Disputed (Incorrect)</option>
              <option value="Correct Prediction">Confirmed (Correct)</option>
              <option value="Unsure">Unsure</option>
              <option value="General Feedback">General</option>
            </select>
          </div>
        </div>

        {filteredFeedbacks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Article Title</th>
                  <th className="px-5 py-3">Feedback Comments</th>
                  <th className="px-5 py-3">Supporting Source</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredFeedbacks.map((fb) => (
                  <tr
                    key={fb.feedback_id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">
                      {fb.user_name || 'Anonymous'}
                      <span className="block text-[10px] text-slate-400">{fb.user_email}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          fb.feedback_category === 'Incorrect Prediction'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : fb.feedback_category === 'Correct Prediction'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {fb.feedback_category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs truncate text-slate-700 dark:text-slate-300">
                      {fb.article_title || fb.prediction_id}
                    </td>
                    <td className="px-5 py-3.5 max-w-md text-slate-600 dark:text-slate-300">
                      {fb.feedback_text}
                    </td>
                    <td className="px-5 py-3.5 max-w-xs truncate">
                      {fb.supporting_source_url ? (
                        <a
                          href={fb.supporting_source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-teal-600 hover:underline"
                        >
                          {fb.supporting_source_url}
                        </a>
                      ) : (
                        <span className="text-slate-400">None provided</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">
                      {new Date(fb.feedback_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs">
            No feedback entries match the selected filter.
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={resetModalOpen}
        title="Reset demo data?"
        message="This will restore the example articles, sample predictions, and default test accounts. Any demo changes you have made will be replaced."
        confirmLabel="Reset Dataset"
        isDestructive={false}
        onConfirm={handleResetDemoData}
        onCancel={() => setResetModalOpen(false)}
      />
    </div>
  );
};
