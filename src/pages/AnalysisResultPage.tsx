import React, { useState } from 'react';
import {
  Sparkles,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  MessageSquarePlus,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Info,
  Calendar,
  Globe,
  FileCheck,
  ListOrdered,
  ChevronRight,
} from 'lucide-react';
import { NewsArticle, Prediction } from '../types/index.js';
import { VerdictBadge } from '../components/VerdictBadge.js';
import { ConfidenceMeter } from '../components/ConfidenceMeter.js';
import { FeedbackModal } from '../components/FeedbackModal.js';

interface AnalysisResultPageProps {
  article: NewsArticle;
  prediction: Prediction;
  onAnalyzeAnother: () => void;
  onViewHistory: () => void;
}

export const AnalysisResultPage: React.FC<AnalysisResultPageProps> = ({
  article,
  prediction,
  onAnalyzeAnother,
  onViewHistory,
}) => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Safe fallback arrays to prevent any undefined .map errors
  const keyClaims = Array.isArray(prediction?.key_claims) ? prediction.key_claims : [];
  const warningSigns = Array.isArray(prediction?.warning_signs) ? prediction.warning_signs : [];
  const verificationSteps = Array.isArray(prediction?.verification_steps) ? prediction.verification_steps : [];
  const limitations = Array.isArray(prediction?.limitations) ? prediction.limitations : [];
  const evidenceSources = Array.isArray(prediction?.evidence_sources) ? prediction.evidence_sources : [];
  const isFreeDemo = prediction?.model_version === 'free-demo-no-ai';

  // Copy structured report to clipboard
  const handleCopySummary = () => {
    const reportDate = prediction?.prediction_date ? new Date(prediction.prediction_date).toLocaleDateString() : new Date().toLocaleDateString();
    const report = `TRUTHLENS AI VERIFICATION REPORT
===============================
Headline: ${article?.title || 'Untitled Article'}
Date: ${reportDate}
Model Assessment: ${prediction?.predicted_label || 'UNVERIFIED'} (${Math.round((prediction?.confidence_score || 0) * 100)}% Confidence)
Model Version: ${prediction?.model_version || 'Not provided'}

SHORT VERDICT:
${prediction?.summary || 'No summary available.'}

DETAILED EXPLANATION:
${prediction?.explanation || 'No detailed explanation provided.'}

KEY CLAIMS IDENTIFIED:
${keyClaims.length > 0 ? keyClaims.map((c) => `- ${c}`).join('\n') : '- None identified'}

WARNING SIGNS & ANOMALIES:
${warningSigns.length > 0 ? warningSigns.map((w) => `- ${w}`).join('\n') : '- None identified'}

RECOMMENDED VERIFICATION STEPS:
${verificationSteps.length > 0 ? verificationSteps.map((s, i) => `${i + 1}. ${s}`).join('\n') : '1. Verify with independent sources'}

LIMITATIONS:
${limitations.length > 0 ? limitations.map((l) => `- ${l}`).join('\n') : '- Automated model analysis'}
`;

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rawDate = article?.submission_date || prediction?.prediction_date;
  const parsedDate = rawDate ? new Date(rawDate) : new Date();
  const formattedDate = parsedDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Navigation & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onAnalyzeAnother}
          className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-1.5 transition-colors self-start"
        >
          <ArrowLeft size={16} />
          Analyze Another Article
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            <span>{copied ? 'Report Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={() => setFeedbackOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <MessageSquarePlus size={14} />
            <span>Submit Feedback</span>
          </button>

          <button
            onClick={onViewHistory}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>View in History</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Main Verdict Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Banner with Verdict & Confidence */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                  {isFreeDemo ? 'Free Demo Status' : 'Model Credibility Assessment'}
                </span>
                {prediction.is_demo && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    {isFreeDemo ? 'Free Demo · No AI' : 'Demo Sample'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <VerdictBadge
                  label={prediction.predicted_label}
                  confidence={prediction.confidence_score}
                  size="lg"
                  showConfidence={false}
                />
              </div>
              <p className="text-base sm:text-lg font-medium text-slate-200 max-w-2xl leading-relaxed">
                {prediction.summary}
              </p>
            </div>

            {/* Confidence Gauge Widget */}
            {isFreeDemo ? (
              <div className="md:w-72 bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 shrink-0">
                <p className="text-sm font-semibold text-amber-300">AI confidence unavailable</p>
                <p className="text-xs text-slate-300 mt-2">No AI service or source check ran. “Needs verification” is not a verdict.</p>
              </div>
            ) : (
              <div className="md:w-72 bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 backdrop-blur-xs shrink-0">
                <ConfidenceMeter
                  score={prediction.confidence_score}
                  label={prediction.predicted_label}
                  showDetails={true}
                />
              </div>
            )}
          </div>
        </div>

        {/* Article Headline & Submission Info */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
            {article.title}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              {formattedDate}
            </span>
            {article.source_name && (
              <span className="flex items-center gap-1.5">
                <Globe size={13} />
                Source: <span className="font-semibold text-slate-700 dark:text-slate-300">{article.source_name}</span>
              </span>
            )}
            {article.source_url && (
              <a
                href={article.source_url}
                target="_blank"
                rel="noreferrer"
                className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                Original Link <ExternalLink size={12} />
              </a>
            )}
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300">
              Model: {prediction.model_version}
            </span>
          </div>
        </div>

        {/* Detailed Explanation */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2">
              <FileCheck size={16} className="text-teal-500" />
              Why this result
            </h3>
            <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line bg-slate-50 dark:bg-slate-800/80 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
              {prediction.explanation}
            </p>
          </div>

          {/* Key Claims Extracted & Warning Signs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Claims */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                <ListOrdered size={15} className="text-blue-500" />
                Main claims
              </h4>
              {keyClaims.length > 0 ? (
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  {keyClaims.map((claim, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>{claim}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 italic">No discrete factual assertions detected.</p>
              )}
            </div>

            {/* Warning Signs */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                <AlertTriangle size={15} className="text-amber-500" />
                Possible warning signs
              </h4>
              {warningSigns.length > 0 ? (
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  {warningSigns.map((sign, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{sign}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 italic">No severe warning signs detected.</p>
              )}
            </div>
          </div>

          {/* Evidence Sources & Citations */}
          {evidenceSources.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                <Globe size={15} className="text-teal-500" />
                Sources checked
              </h4>
              <div className="space-y-3">
                {evidenceSources.map((src, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-800 dark:text-white">
                        {src.title}
                      </span>
                      {src.url && (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                        >
                          View Source <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                    {src.credibility_note && (
                      <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {src.credibility_note}
                      </p>
                    )}
                    {src.snippet && (
                      <p className="text-slate-600 dark:text-slate-300 mt-1.5 italic font-serif">
                        "{src.snippet}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Verification Steps */}
          <div className="bg-teal-50/50 dark:bg-teal-950/20 p-5 rounded-xl border border-teal-200/80 dark:border-teal-900/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-300 mb-3 flex items-center gap-1.5">
              <Check size={16} className="text-teal-600" />
              How you can verify
            </h4>
            <ol className="space-y-2 text-xs text-slate-700 dark:text-slate-300 list-decimal list-inside">
              {verificationSteps.map((step, idx) => (
                <li key={idx} className="leading-relaxed">
                  <span className="font-medium">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Model limitations */}
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <Info size={14} />
              Limitations
            </div>
            <ul className="list-disc list-inside space-y-1">
              {limitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Submitted Article Raw Content Drawer */}
      <details className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 group">
        <summary className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 cursor-pointer hover:text-teal-500 select-none flex items-center justify-between">
          <span>View Submitted Article Content</span>
          <span className="text-[11px] font-normal text-slate-400 group-open:hidden">
            (Click to expand original text)
          </span>
        </summary>
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 font-mono text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
          {article.content}
        </div>
      </details>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        prediction={prediction}
        articleTitle={article.title}
      />
    </div>
  );
};
