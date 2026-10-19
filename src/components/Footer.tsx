import React from 'react';
import { SearchCheck, AlertCircle } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-slate-950 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
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
              TruthLens AI helps users review news claims with AI-assisted analysis and related web sources. Model assessments are estimates, not proof of truth.
            </p>
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
                  onClick={() => onNavigate('history')}
                  className="hover:text-teal-400 transition-colors"
                >
                  History
                </button>
              </li>
              
            </ul>
          </div>


        </div>

        {/* Disclaimer Banner */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-start gap-3 mb-6">
          <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-300">Please check the sources.</span>{' '}
            An AI result can be wrong and should not be treated as proof.
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} TruthLens AI.</p>
        </div>
      </div>
    </footer>
  );
};
