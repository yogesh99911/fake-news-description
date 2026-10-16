import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { api, exportArticlesToCSV } from '../services/api.js';
import { ArticleHistoryItem, PredictedLabel } from '../types/index.js';
import { VerdictBadge } from '../components/VerdictBadge.js';
import { ConfirmModal } from '../components/ConfirmModal.js';

interface HistoryPageProps {
  onViewArticle: (item: ArticleHistoryItem) => void;
  onAnalyzeNew: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onViewArticle,
  onAnalyzeNew,
}) => {
  const [items, setItems] = useState<ArticleHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [labelFilter, setLabelFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<string>('newest');

  // Deletion modal
  const [deletingItem, setDeletingItem] = useState<ArticleHistoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadHistory = async (targetPage = page) => {
    setLoading(true);
    try {
      const res = await api.getNewsHistory({
        q: searchQuery.trim() || undefined,
        label: labelFilter !== 'ALL' ? labelFilter : undefined,
        sort: sortOrder,
        page: targetPage,
        limit: 8,
      });

      setItems(res.items);
      setTotal(res.total);
      setPage(res.page);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to load history.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(1);
  }, [labelFilter, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadHistory(1);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);

    try {
      await api.deleteArticle(deletingItem.article.news_id);
      setNotification({
        type: 'success',
        message: 'Article and associated predictions/feedback deleted successfully.',
      });
      setDeletingItem(null);
      loadHistory(page);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Deletion failed.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    if (items.length === 0) return;
    exportArticlesToCSV(items, `truthlens_export_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Analysis History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, filter, review, or export your verified news articles and prediction records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={items.length === 0}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-40"
          >
            <Download size={14} />
            Export Page to CSV
          </button>
          <button
            onClick={onAnalyzeNew}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 shadow-md transition-all"
          >
            Analyze New Article
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-between ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-xs underline font-semibold ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Keyword Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search headline, claim, or summary..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden dark:text-white"
          />
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Label Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter size={14} />
            <select
              value={labelFilter}
              onChange={(e) => setLabelFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Verdicts</option>
              <option value="REAL">Real Only</option>
              <option value="FAKE">Fake Only</option>
              <option value="NEEDS VERIFICATION">Needs Verification</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="text-xs text-slate-500">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                loadHistory(1);
              }}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Clear search"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* History Items Grid / List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin mx-auto mb-2" />
            Loading analysis records...
          </div>
        ) : items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.article.news_id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  {item.prediction ? (
                    <VerdictBadge
                      label={item.prediction.predicted_label}
                      confidence={item.prediction.confidence_score}
                      size="sm"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">Unprocessed</span>
                  )}

                  <span className="text-xs text-slate-400">
                    {new Date(item.article.submission_date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>

                  {item.article.source_name && (
                    <span className="text-xs text-slate-500">
                      • {item.article.source_name}
                    </span>
                  )}
                </div>

                <h3
                  onClick={() => onViewArticle(item)}
                  className="font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer leading-snug line-clamp-1"
                >
                  {item.article.title}
                </h3>

                {item.prediction?.summary && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.prediction.summary}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => onViewArticle(item)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-teal-500 hover:text-slate-950 transition-colors flex items-center gap-1"
                >
                  <span>Details</span>
                  <ExternalLink size={12} />
                </button>
                <button
                  onClick={() => setDeletingItem(item)}
                  title="Delete article and records"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <FileText size={36} className="text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              No matching article records found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search keywords or filter criteria, or submit a new article for verification.
            </p>
            <button
              onClick={onAnalyzeNew}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-teal-500 text-slate-950 hover:bg-teal-400 transition-colors"
            >
              Analyze an Article Now
            </button>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-200 dark:border-slate-800">
          <span>
            Showing page {page} of {totalPages} ({total} total records)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => loadHistory(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 font-semibold text-slate-700 dark:text-slate-300">
              {page}
            </span>
            <button
              onClick={() => loadHistory(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingItem}
        title="Delete Article & Prediction Record?"
        message={`Are you sure you want to delete "${deletingItem?.article.title}"? This will permanently remove the article, its associated 1:1 prediction record, and all related peer feedback submissions according to relational integrity rules.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete Permanently'}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingItem(null)}
      />
    </div>
  );
};
