import React from 'react';
import { Info } from 'lucide-react';
import { PredictedLabel } from '../types/index.js';

interface ConfidenceMeterProps {
  score: number; // 0.0 - 1.0
  label: PredictedLabel | string;
  showDetails?: boolean;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  score,
  label,
  showDetails = true,
}) => {
  const percentage = Math.round(Math.max(0, Math.min(1, score)) * 100);
  const normLabel = (label || '').toUpperCase().trim();

  let progressColor = 'bg-amber-500';
  if (normLabel === 'REAL') progressColor = 'bg-emerald-600';
  else if (normLabel === 'FAKE') progressColor = 'bg-rose-600';

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5 text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          Confidence Estimate
          <span className="group relative cursor-pointer text-slate-400 hover:text-slate-600">
            <Info size={14} />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block w-64 p-2 bg-slate-900 text-slate-100 text-xs rounded-md shadow-lg z-50 pointer-events-none text-center">
              Internal model assessment confidence based on lexical consistency, claim structure, and known facts. Not a mathematically calibrated real-world probability.
            </span>
          </span>
        </span>
        <span className="font-bold text-slate-900 dark:text-white tabular-nums">
          {percentage}%
        </span>
      </div>

      <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-700 ease-out ${progressColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {showDetails && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
              <span>Model-estimated confidence • web sources may inform this assessment when available; not a calibrated probability or proof.</span>
        </p>
      )}
    </div>
  );
};
