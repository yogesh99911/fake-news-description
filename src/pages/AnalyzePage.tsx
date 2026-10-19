import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Link as LinkIcon,
  FileText,
  RotateCcw,
  AlertCircle,
  Download,
  Loader2,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { InputMode, DemoSample, NewsArticle, Prediction } from '../types/index.js';

interface AnalyzePageProps {
  onAnalysisComplete: (article: NewsArticle, prediction: Prediction) => void;
  onRequireAuth: () => void;
}

export const AnalyzePage: React.FC<AnalyzePageProps> = ({
  onAnalysisComplete,
  onRequireAuth,
}) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<InputMode>('paste');

  // Form Fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');

  // URL Crawler State
  const [inputUrl, setInputUrl] = useState('');
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [urlFetchSuccess, setUrlFetchSuccess] = useState(false);

  // Sample articles for trying the analyzer
  const [samples, setSamples] = useState<DemoSample[]>([]);
  const [samplesLoading, setSamplesLoading] = useState(false);

  // Submission & AI State
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load samples
  useEffect(() => {
    setSamplesLoading(true);
    api
      .getDemoSamples()
      .then((data) => setSamples(data))
      .catch((err) => console.error('Failed to load demo samples:', err))
      .finally(() => setSamplesLoading(false));
  }, []);

  // Progressive loading messages
  useEffect(() => {
    if (!analyzing) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, [analyzing]);

  const loadingMessages = [
    'Connecting to the analysis service...',
    'Reviewing the main claims...',
    'Checking available sources...',
    'Preparing your result...',
  ];

  // Character & word counters
  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  // Handle URL Extraction
  const handleExtractUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }

    if (!inputUrl || !inputUrl.startsWith('http')) {
      setErrorMessage('Please provide a valid web URL starting with http:// or https://');
      return;
    }

    setFetchingUrl(true);
    setErrorMessage(null);
    setUrlFetchSuccess(false);

    try {
      const extracted = await api.extractUrl(inputUrl);
      setTitle(extracted.title || '');
      setContent(extracted.content || '');
      setSourceName(extracted.source_name || '');
      setSourceUrl(inputUrl);
      setUrlFetchSuccess(true);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Failed to extract article content. The site may be paywalled or blocking web crawlers.'
      );
    } finally {
      setFetchingUrl(false);
    }
  };

  // Load a sample article into the form
  const handleLoadSample = (sample: DemoSample) => {
    setTitle(sample.title);
    setContent(sample.content);
    setSourceName(sample.source_name || '');
    setSourceUrl(sample.source_url || '');
    setErrorMessage(null);
    setUrlFetchSuccess(false);
  };

  // Handle Clear Form
  const handleClear = () => {
    setTitle('');
    setContent('');
    setSourceName('');
    setSourceUrl('');
    setInputUrl('');
    setErrorMessage(null);
    setUrlFetchSuccess(false);
  };

  // Handle Submit Analysis
  const handleSubmitAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }

    if (!title.trim() || title.trim().length < 5) {
      setErrorMessage('Please provide a news headline (minimum 5 characters).');
      return;
    }

    if (!content.trim() || content.trim().length < 20) {
      setErrorMessage('Please provide substantive article content (minimum 20 characters).');
      return;
    }

    setAnalyzing(true);
    setErrorMessage(null);

    try {
      const result = await api.submitAndAnalyzeNews({
        title: title.trim(),
        content: content.trim(),
        source_name: sourceName.trim() || undefined,
        source_url: sourceUrl.trim() || undefined,
        input_mode: mode,
      });

      onAnalysisComplete(result.article, result.prediction);
    } catch (err: any) {
      setErrorMessage(err.message || 'AI news analysis failed. Please verify API configuration.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles size={13} />
          News analysis
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Analyze News Credibility
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
          With an AI provider configured, TruthLens analyzes the supplied text. When Tavily is configured, it also searches the live web and includes relevant source snippets. Results and model verdicts can be incomplete; open the linked sources and verify important claims yourself. Without an AI provider, submissions are saved as “Needs Verification” with no AI verdict.
        </p>
      </div>

      {/* Main Analysis Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Mode Tabs & Sample Selector Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Mode Switcher */}
          <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setMode('paste');
                setErrorMessage(null);
              }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                mode === 'paste'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <FileText size={15} />
              Paste News Text
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('url');
                setErrorMessage(null);
              }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                mode === 'url'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <LinkIcon size={15} />
              Analyze Article URL
            </button>
          </div>

          {/* Sample article dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-slate-500 hidden md:inline">Sample:</span>
            <select
              defaultValue=""
              onChange={(e) => {
                const sample = samples.find((s) => s.label === e.target.value);
                if (sample) handleLoadSample(sample);
              }}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              <option value="" disabled>
                {samplesLoading ? 'Loading samples...' : 'Load a sample...'}
              </option>
              {samples.map((s) => (
                <option key={s.label} value={s.label}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-6 mt-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs sm:text-sm text-rose-800 dark:text-rose-300 flex items-start gap-3">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Analysis Warning:</span> {errorMessage}
              {(errorMessage.includes('Session') || errorMessage.includes('token') || errorMessage.includes('Authentication')) && (
                <button
                  type="button"
                  onClick={onRequireAuth}
                  className="mt-2 text-xs font-bold underline text-rose-900 dark:text-rose-200 hover:text-rose-700 block"
                >
                  Click here to sign in again to refresh your session
                </button>
              )}
            </div>
          </div>
        )}

        {/* URL Input Form (Visible if mode === 'url') */}
        {mode === 'url' && (
          <div className="p-6 bg-indigo-50/40 dark:bg-indigo-950/20 border-b border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Globe size={15} className="text-indigo-600 dark:text-indigo-400" />
              Article URL Crawler (SSRF-Protected)
            </label>
            <form onSubmit={handleExtractUrl} className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://www.reuters.com/world/article-slug..."
                className="flex-1 text-sm px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden dark:text-white"
              />
              <button
                type="submit"
                disabled={fetchingUrl || !inputUrl}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
              >
                {fetchingUrl ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Fetching Content...
                  </>
                ) : (
                  <>
                    <Download size={15} />
                    Extract Article
                  </>
                )}
              </button>
            </form>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Restricted crawler safely fetches public HTML while preventing SSRF attacks on localhost or private networks.
            </p>

            {urlFetchSuccess && (
              <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 size={15} />
                Successfully extracted article text. You may review and refine the fields below before submitting to the AI.
              </div>
            )}
          </div>
        )}

        {/* Article Form */}
        <form onSubmit={handleSubmitAnalysis} className="p-6 space-y-5">
          {/* Headline */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              News Headline / Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., NASA Webb Telescope Confirms Atmospheric Detection on Rocky Exoplanet"
              className="w-full text-sm font-medium px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden dark:text-white"
            />
          </div>

          {/* Metadata Row: Source Name & Source URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Reported Source Name (Optional)
              </label>
              <input
                type="text"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="e.g., Reuters, Nature Astronomy, Viral Blog"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Original Article URL (Optional)
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden dark:text-white"
              />
            </div>
          </div>

          {/* Full Article Content */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Full Article Content / Claims <span className="text-rose-500">*</span>
              </label>
              <div className="text-[11px] text-slate-400 tabular-nums">
                {wordCount} words • {charCount} / 50,000 characters
              </div>
            </div>
            <textarea
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste the full text of the article or primary claims to be evaluated..."
              className="w-full text-sm leading-relaxed p-4 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden dark:text-white font-mono text-[13px]"
            />
          </div>

          {/* Action Buttons Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClear}
              disabled={analyzing}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={15} />
              Clear Form
            </button>

            <button
              type="submit"
              disabled={analyzing || !title.trim() || !content.trim()}
              className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 shadow-md shadow-teal-500/20 hover:shadow-teal-500/30 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 size={17} className="animate-spin text-slate-950" />
                  <span>Analyzing Article...</span>
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  <span>Analyze News</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Loading Overlay */}
        {analyzing && (
          <div className="p-8 bg-slate-900 text-white text-center border-t border-slate-800 animate-in fade-in duration-300">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-teal-500/30 border-t-teal-400 animate-spin mx-auto" />
              <div>
                <h4 className="font-bold text-base text-white">
                  Analyzing article
                </h4>
                <p className="text-xs text-teal-300 font-medium mt-1">
                  {loadingMessages[loadingStep]}
                </p>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                This can take a few seconds. The result will appear here when it is ready.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
