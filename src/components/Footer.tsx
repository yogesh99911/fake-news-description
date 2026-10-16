import React from 'react';
import { SearchCheck, Shield, BookOpen, AlertCircle } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-slate-950 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                <SearchCheck size={18} />
              </div>
              <span className="text-white font-bold text-base">
                TruthLens <span className="text-teal-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              TruthLens AI is an academic full-stack Computer Science capstone research platform designed for automated factual credibility scoring and news verification using Google Gemini 3.8 Flash, formal UML data modeling, and transparent heuristic auditing.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Gemini 3.8 Flash Engine Connected • REST API Operational</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('analyze')}
                  className="hover:text-teal-400 transition-colors"
                >
                  Analyze News
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-teal-400 transition-colors"
                >
                  User Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('history')}
                  className="hover:text-teal-400 transition-colors"
                >
                  Analysis History & CSV
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-teal-400 transition-colors"
                >
                  UML Class & Object Diagrams
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Academic & Methodology */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Academic Context
            </h4>
            <ul className="space-y-2 text-xs">
              <li>Final Year BSc Computer Science Project</li>
              <li>Entity Relational Integrity Enforced</li>
              <li>SSRF-Protected URL Crawler</li>
              <li>PBKDF2 Password Encryption</li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-start gap-3 mb-6">
          <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-300">Important Academic AI Disclaimer:</span>{' '}
            Automated language model analysis is an assistive tool, not proof of absolute truth. Model assessments represent pattern recognition over textual claims and known reporting databases. News consumers must cross-reference primary sources, official public registers, and independent journalistic reporting before making factual determinations.
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} TruthLens AI – Academic Demonstration System.</p>
          <div className="flex items-center gap-4 text-xs">
            <span>Built with React + Vite + Tailwind CSS + Express + Gemini</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
