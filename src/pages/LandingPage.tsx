import React, { useState } from 'react';
import {
  SearchCheck,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  Lock,
  Database,
  ExternalLink,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { VerdictBadge } from '../components/VerdictBadge.js';

interface LandingPageProps {
  onNavigate: (view: string, data?: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { user, demoLogin } = useAuth();
  const [activeTab, setActiveTab] = useState<'real' | 'fake' | 'verify'>('real');
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);

  const sampleCards = {
    real: {
      label: 'REAL',
      confidence: 0.94,
      title: 'NASA James Webb Space Telescope Detects Water Vapor in Rocky Exoplanet Atmosphere',
      summary: 'Accurately reflects verified peer-reviewed publications from NASA Jet Propulsion Laboratory and Nature Astronomy.',
      signs: ['Cross-referenced in NASA exoplanet archive', 'Maintains rigorous scientific caveats'],
      source: 'NASA JPL & STScI MAST Archive',
    },
    fake: {
      label: 'FAKE',
      confidence: 0.98,
      title: 'Miracle Rainforest Sunberry Eliminates 100% of Stage 4 Cancer Tumors in 48 Hours, Big Pharma Bans It',
      summary: 'Classic predatory medical misinformation exhibiting untraceable claims, conspiracy tropes, and zero clinical trials.',
      signs: ['Miracle cure promise with zero clinical evidence', 'Conspiracy tropes alleging suppression', 'Anonymous untraceable sources'],
      source: 'Unverified Viral Health Blog',
    },
    verify: {
      label: 'NEEDS VERIFICATION',
      confidence: 0.65,
      title: 'Metropolitan Council Allegedly Passes $450M Midnight Bond Ordinance for Geothermal Heating Grid',
      summary: 'Developing local governance claim with unconfirmed anonymous messaging leaks and pending public docket minutes.',
      signs: ['Anonymous Telegram leak source', 'Missing official city clerk voting records', 'Spokespeople have not yet issued confirmation'],
      source: 'Local Leaks Messaging Channel',
    },
  };

  const handleQuickDemo = async (role: 'student' | 'admin') => {
    setQuickLoginLoading(true);
    try {
      await demoLogin(role);
      onNavigate('dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setQuickLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-teal-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles size={14} className="text-teal-400" />
              BSc Computer Science Final Year Academic Project
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Question the News.{' '}
              <span className="bg-gradient-to-r from-teal-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Verify the Facts.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
              TruthLens AI combines a configurable language model, journalistic heuristics, and relational entity modeling to assess news claims and identify sensationalism. Model output is not live source verification.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('analyze')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles size={17} />
                Analyze News Now
              </button>

              <button
                onClick={() => onNavigate('about')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>View UML Architecture & Methodology</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Quick Demo Credentials Box for Examiners & Viva */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 max-w-xl mx-auto">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3 flex items-center justify-center gap-1.5">
                <UserCheck size={14} className="text-teal-400" />
                Examiner & Presentation Quick-Access
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={quickLoginLoading}
                  onClick={() => handleQuickDemo('student')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/90 hover:bg-slate-700 text-teal-300 border border-slate-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                  Sign In as Researcher (student@truthlens.ai)
                </button>
                <button
                  type="button"
                  disabled={quickLoginLoading}
                  onClick={() => handleQuickDemo('admin')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-purple-950/70 hover:bg-purple-900 text-purple-300 border border-purple-800 flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  Sign In as Admin (admin@truthlens.ai)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Workflow Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">
            Verification Pipeline
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Three Steps to Factual Clarity
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Every submission passes through a structured NLP evaluation pipeline with relational persistence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-black text-lg flex items-center justify-center mb-4">
              1
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Submit News
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Paste a headline and full article text, or enter an article URL for our SSRF-safe crawler to extract accessible paragraphs.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 font-black text-lg flex items-center justify-center mb-4">
              2
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              AI Analysis & Grounding
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  The configured AI model reviews assertions, internal consistency, and sensationalism. It may rely on learned knowledge and does not independently verify live sources.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-black text-lg flex items-center justify-center mb-4">
              3
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Review & Audit Trail
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Receive a classification (REAL, FAKE, or NEEDS VERIFICATION), confidence estimate, warning indicators, and actionable steps to cross-check.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Sample Preview */}
      <section className="py-14 bg-slate-100 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Interactive Classification Previews
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select a category to preview how TruthLens evaluates differing news credibility scenarios.
            </p>

            <div className="inline-flex p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 mt-4 gap-1">
              <button
                onClick={() => setActiveTab('real')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'real'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Real News Sample
              </button>
              <button
                onClick={() => setActiveTab('fake')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'fake'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Fake News Sample
              </button>
              <button
                onClick={() => setActiveTab('verify')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'verify'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Needs Verification Sample
              </button>
            </div>
          </div>

          {/* Sample Card */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <VerdictBadge
                label={sampleCards[activeTab].label}
                confidence={sampleCards[activeTab].confidence}
                size="md"
              />
              <span className="text-xs text-slate-500">
                Source Reference: <span className="font-semibold text-slate-700 dark:text-slate-300">{sampleCards[activeTab].source}</span>
              </span>
            </div>

            <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug">
              {sampleCards[activeTab].title}
            </h4>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              {sampleCards[activeTab].summary}
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Identified Indicators & Warning Signs
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                {sampleCards[activeTab].signs.map((sign, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-teal-600 dark:text-teal-400 font-bold">•</span>
                    <span>{sign}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-slate-400 italic">
                Demonstration sample stored in academic database
              </span>
              <button
                onClick={() => onNavigate('analyze')}
                className="text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center gap-1"
              >
                Analyze Your Own Article <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">
            System Features
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Built for Academic Rigor & Transparency
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Multi-Factor NLP Analysis
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Examines headline-to-body consistency, emotional clickbait patterns, unsubstantiated numbers, and unattributed claims.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Lock size={18} />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              SSRF-Protected URL Crawler
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Safely extracts article body from public web addresses while strictly blocking internal network IPs, localhost, and cloud metadata.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Database size={18} />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              UML Relational Integrity
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Implements User 1:N Article, Article 1:1 Prediction, and Prediction 1:N Feedback with cascading deletes and zero orphan records.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Peer Review Feedback Loop
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Users can flag false positives or provide corroborating source URLs, storing human feedback alongside model predictions.
            </p>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-14 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-center border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <h3 className="text-2xl sm:text-3xl font-black">
            Ready to evaluate news credibility?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Experience the AI-assisted analysis workflow, historical persistence, and interactive charts.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('analyze')}
              className="px-8 py-3.5 rounded-xl font-bold text-sm bg-teal-400 hover:bg-teal-300 text-slate-950 shadow-md transition-all inline-flex items-center gap-2"
            >
              Start Analysis <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
