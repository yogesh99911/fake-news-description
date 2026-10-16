import React, { useState } from 'react';
import {
  BookOpen,
  Database,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  Layers,
  ArrowRight,
  GitBranch,
  Terminal,
  FileCode,
  CheckCircle,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'uml' | 'methodology' | 'ethics'>('uml');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold uppercase tracking-wider">
          <BookOpen size={13} />
          Academic Documentation & Defense Guide
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          System Architecture & Methodology
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Detailed technical specifications for the final-year BSc Computer Science project: TruthLens AI. Inspect entity models, relational mappings, and NLP heuristics.
        </p>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 bg-slate-200 dark:bg-slate-800 rounded-xl text-xs font-semibold gap-1 mt-2">
          <button
            onClick={() => setActiveTab('uml')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'uml'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            UML Class & Object Diagrams
          </button>
          <button
            onClick={() => setActiveTab('methodology')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'methodology'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            AI Engine & Verification Flow
          </button>
          <button
            onClick={() => setActiveTab('ethics')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'ethics'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Limitations & Ethical AI
          </button>
        </div>
      </div>

      {/* Tab 1: UML Architecture */}
      {activeTab === 'uml' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Class Diagram Section */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database size={18} className="text-teal-500" />
                  1. Formal UML Class Diagram
                </h2>
                <p className="text-xs text-slate-500">
                  Four core entities, attributes, visibility, operations, and multiplicity relations.
                </p>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                UML 2.5 Specification
              </span>
            </div>

            {/* Entity Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* User Class */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-indigo-200 dark:border-indigo-900 overflow-hidden shadow-xs">
                <div className="p-3 bg-indigo-600 text-white text-center font-bold text-xs uppercase tracking-wider">
                  «Entity»
                  <div className="text-sm">User</div>
                </div>
                <div className="p-3 border-b border-slate-200 dark:border-slate-700 font-mono text-[11px] space-y-1 text-slate-700 dark:text-slate-300">
                  <p>- user_id: string [PK]</p>
                  <p>- name: string</p>
                  <p>- email: string</p>
                  <p>- password_hash: string</p>
                  <p>- salt: string</p>
                  <p>- role: UserRole</p>
                  <p>- created_at: DateTime</p>
                </div>
                <div className="p-3 font-mono text-[11px] space-y-1 text-indigo-700 dark:text-indigo-300">
                  <p>+ register()</p>
                  <p>+ login()</p>
                  <p>+ submitNews()</p>
                  <p>+ provideFeedback()</p>
                </div>
              </div>

              {/* NewsArticle Class */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-blue-200 dark:border-blue-900 overflow-hidden shadow-xs">
                <div className="p-3 bg-blue-600 text-white text-center font-bold text-xs uppercase tracking-wider">
                  «Entity»
                  <div className="text-sm">NewsArticle</div>
                </div>
                <div className="p-3 border-b border-slate-200 dark:border-slate-700 font-mono text-[11px] space-y-1 text-slate-700 dark:text-slate-300">
                  <p>- news_id: string [PK]</p>
                  <p>- user_id: string [FK]</p>
                  <p>- title: string</p>
                  <p>- content: text</p>
                  <p>- source_name: string?</p>
                  <p>- source_url: string?</p>
                  <p>- input_mode: InputMode</p>
                  <p>- submission_date: DateTime</p>
                </div>
                <div className="p-3 font-mono text-[11px] space-y-1 text-blue-700 dark:text-blue-300">
                  <p>+ create()</p>
                  <p>+ getNewsById()</p>
                  <p>+ getAllNews()</p>
                  <p>+ delete()</p>
                </div>
              </div>

              {/* Prediction Class */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-teal-200 dark:border-teal-900 overflow-hidden shadow-xs">
                <div className="p-3 bg-teal-600 text-slate-950 text-center font-bold text-xs uppercase tracking-wider">
                  «Entity»
                  <div className="text-sm">Prediction</div>
                </div>
                <div className="p-3 border-b border-slate-200 dark:border-slate-700 font-mono text-[11px] space-y-1 text-slate-700 dark:text-slate-300">
                  <p>- prediction_id: string [PK]</p>
                  <p>- news_id: string [FK, 1:1]</p>
                  <p>- user_id: string [FK]</p>
                  <p>- predicted_label: Enum</p>
                  <p>- confidence_score: float</p>
                  <p>- summary: string</p>
                  <p>- explanation: text</p>
                  <p>- key_claims: string[]</p>
                  <p>- warning_signs: string[]</p>
                  <p>- model_version: string</p>
                </div>
                <div className="p-3 font-mono text-[11px] space-y-1 text-teal-800 dark:text-teal-300">
                  <p>+ getPredictionById()</p>
                  <p>+ getByNewsId()</p>
                  <p>+ getAllPredictions()</p>
                </div>
              </div>

              {/* Feedback Class */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-purple-200 dark:border-purple-900 overflow-hidden shadow-xs">
                <div className="p-3 bg-purple-600 text-white text-center font-bold text-xs uppercase tracking-wider">
                  «Entity»
                  <div className="text-sm">Feedback</div>
                </div>
                <div className="p-3 border-b border-slate-200 dark:border-slate-700 font-mono text-[11px] space-y-1 text-slate-700 dark:text-slate-300">
                  <p>- feedback_id: string [PK]</p>
                  <p>- user_id: string [FK]</p>
                  <p>- prediction_id: string [FK]</p>
                  <p>- feedback_text: text</p>
                  <p>- feedback_category: Enum</p>
                  <p>- supporting_url: string?</p>
                  <p>- feedback_date: DateTime</p>
                </div>
                <div className="p-3 font-mono text-[11px] space-y-1 text-purple-700 dark:text-purple-300">
                  <p>+ submitFeedback()</p>
                  <p>+ getFeedbackById()</p>
                  <p>+ getAllFeedbacks()</p>
                </div>
              </div>
            </div>

            {/* Relationship Mapping Explanation */}
            <div className="mt-8 p-5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Enforced Relational Cardinalities
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">User (1) ──── (0..*) NewsArticle</span>
                  <p className="text-slate-500 mt-1">
                    A user submits multiple news articles. Each article is bound to a single submitting user.
                  </p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-teal-600 dark:text-teal-400">NewsArticle (1) ──── (1) Prediction</span>
                  <p className="text-slate-500 mt-1">
                    Every article has exactly one current prediction record. Deleting an article cascades to its prediction.
                  </p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-blue-600 dark:text-blue-400">User (1) ──── (0..*) Feedback</span>
                  <p className="text-slate-500 mt-1">
                    Users can submit multiple peer review feedbacks across distinct predictions.
                  </p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-purple-600 dark:text-purple-400">Prediction (1) ──── (0..*) Feedback</span>
                  <p className="text-slate-500 mt-1">
                    A prediction can receive multiple peer reviews from independent users.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Object Diagram Section */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers size={18} className="text-blue-500" />
                  2. Formal UML Object Diagram (Instance Snapshot)
                </h2>
                <p className="text-xs text-slate-500">
                  Demonstrating concrete runtime object instances and link pointers during an active verification session.
                </p>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Runtime Instance State
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* u1 Instance */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px] space-y-1.5">
                <div className="font-bold text-indigo-600 dark:text-indigo-400 border-b border-slate-200 dark:border-slate-700 pb-1 underline">
                  u1 : User
                </div>
                <p>user_id = "usr_demo_002"</p>
                <p>name = "Academic Researcher"</p>
                <p>email = "student@truthlens.ai"</p>
                <p>role = "user"</p>
              </div>

              {/* a1 Instance */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px] space-y-1.5">
                <div className="font-bold text-blue-600 dark:text-blue-400 border-b border-slate-200 dark:border-slate-700 pb-1 underline">
                  a1 : NewsArticle
                </div>
                <p>news_id = "art_sample_fake_02"</p>
                <p>user_id = "usr_demo_002"</p>
                <p>title = "Secret Miracle Fruit..."</p>
                <p>input_mode = "paste"</p>
              </div>

              {/* p1 Instance */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px] space-y-1.5">
                <div className="font-bold text-teal-600 dark:text-teal-400 border-b border-slate-200 dark:border-slate-700 pb-1 underline">
                  p1 : Prediction
                </div>
                <p>prediction_id = "pred_sample_fake_02"</p>
                <p>news_id = "art_sample_fake_02"</p>
                <p>predicted_label = "FAKE"</p>
                <p>confidence_score = 0.98</p>
              </div>

              {/* f1 Instance */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px] space-y-1.5">
                <div className="font-bold text-purple-600 dark:text-purple-400 border-b border-slate-200 dark:border-slate-700 pb-1 underline">
                  f1 : Feedback
                </div>
                <p>feedback_id = "fb_sample_01"</p>
                <p>user_id = "usr_demo_002"</p>
                <p>prediction_id = "pred_sample_fake_02"</p>
                <p>feedback_category = "Correct Prediction"</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Methodology */}
      {activeTab === 'methodology' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Detection Pipeline & AI Engine Methodology
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              How submitted text is ingested, crawled, tokenized, and evaluated by Google Gemini 3.8 Flash.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400">Step 1</span>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">SSRF-Safe Data Extraction</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                URL submissions are filtered to block private subnets, cloud metadata IPs (e.g. 169.254.169.254), and loopback interfaces. Valid public web pages are stripped of scripts and boilerplate.
              </p>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400">Step 2</span>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Structured Gemini Prompting</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                The article is enclosed within secure untrusted XML tags (`&lt;article_to_analyze&gt;`) to defend against prompt injection. A temperature of 0.2 ensures deterministic reasoning across factual claims.
              </p>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400">Step 3</span>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Heuristic Linguistic Scoring</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                The engine checks for emotional clickbait phrases, unsubstantiated quantitative claims, missing journalistic attributions, and consistency with peer-reviewed consensus.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs space-y-2">
            <p className="text-teal-400 font-bold">// Permitted Verdict Logic</p>
            <p>REAL: Supported by peer-reviewed literature, primary registries, or multi-agency consensus.</p>
            <p>FAKE: Demonstrably fabricated hoaxes, doctored quotes, or debunked conspiracy tropes.</p>
            <p>NEEDS VERIFICATION: Unverified leaks, developing local events, or ambiguous/incomplete evidence.</p>
          </div>
        </div>
      )}

      {/* Tab 3: Ethics & Limitations */}
      {activeTab === 'ethics' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Academic AI Ethics & Inherent Limitations
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Critical scientific caveats regarding language models in automated fact-checking.
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-900 dark:text-amber-200">
                  1. LLMs Are Not Arbiters of Absolute Truth
                </span>
                <p className="text-amber-800 dark:text-amber-300 text-xs mt-1">
                  A neural language model calculates probabilistic text continuity and pattern similarity based on training data. It cannot replace ground investigative reporting, on-site witnesses, or primary subpoenaed public records.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white">
                2. Epistemic Confidence vs Calibrated Probability
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                The displayed confidence score reflects internal model consistency with known factual heuristics. It must not be interpreted as an empirically calibrated statistical probability of real-world veracity.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white">
                3. Algorithmic Bias & Political Neutrality
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                The system instructions strictly forbid penalizing political opinions, unusual editorial stances, or emotional vocabulary when factual premises remain uncontradicted. When evidence is inconclusive, the system is mandated to return `NEEDS VERIFICATION` rather than inventing certainty.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
