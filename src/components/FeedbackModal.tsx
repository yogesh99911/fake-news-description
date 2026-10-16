import React, { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { FeedbackCategory, Prediction } from '../types/index.js';
import { api } from '../services/api.js';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: Prediction;
  articleTitle?: string;
  onSubmitted?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  prediction,
  articleTitle,
  onSubmitted,
}) => {
  const [category, setCategory] = useState<FeedbackCategory>('General Feedback');
  const [feedbackText, setFeedbackText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackText.trim().length < 5) {
      setStatus({ type: 'error', message: 'Please provide at least 5 characters of feedback commentary.' });
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const res = await api.submitFeedback({
        prediction_id: prediction.prediction_id,
        feedback_category: category,
        feedback_text: feedbackText.trim(),
        supporting_source_url: sourceUrl.trim() || undefined,
      });

      setStatus({ type: 'success', message: res.message });
      setFeedbackText('');
      setSourceUrl('');
      setTimeout(() => {
        onSubmitted?.();
        onClose();
        setStatus(null);
      }, 1500);
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Failed to submit feedback.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Submit Model Prediction Feedback</h3>
            <p className="text-xs text-slate-500 truncate max-w-sm mt-0.5">
              Article: {articleTitle || prediction.news_id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {status && (
            <div
              className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
                status.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              ) : (
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
              )}
              <span>{status.message}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Current Model Verdict
            </label>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {prediction.predicted_label}
              </span>
              <span className="text-xs text-slate-500">
                Confidence: {Math.round(prediction.confidence_score * 100)}%
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Feedback Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  'Correct Prediction',
                  'Incorrect Prediction',
                  'Unsure',
                  'General Feedback',
                ] as FeedbackCategory[]
              ).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`p-2 rounded-lg text-xs font-medium border text-left transition-all ${
                    category === cat
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-semibold dark:bg-indigo-950/60 dark:text-indigo-200 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Feedback Explanation <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Explain why you agree or disagree with this verdict, or provide additional factual context..."
              className="w-full text-sm p-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden dark:bg-slate-800 dark:text-white"
            />
            <p className="text-[11px] text-slate-500 mt-0.5">
              Feedback is stored for academic peer review and model auditing. It does not automatically override truth.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Supporting Source URL (Optional)
            </label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://reputable-factchecker.org/claim-review..."
              className="w-full text-sm px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || feedbackText.trim().length < 5}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
            >
              <Send size={15} />
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
