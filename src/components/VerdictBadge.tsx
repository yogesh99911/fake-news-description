import React from 'react';
import { ShieldCheck, AlertTriangle, HelpCircle } from 'lucide-react';
import { PredictedLabel } from '../types/index.js';

interface VerdictBadgeProps {
  label: PredictedLabel | string;
  confidence?: number;
  size?: 'sm' | 'md' | 'lg';
  showConfidence?: boolean;
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({
  label,
  confidence,
  size = 'md',
  showConfidence = true,
}) => {
  const normLabel = (label || '').toUpperCase().trim();

  let bgColor = 'bg-slate-100 text-slate-700 border-slate-300';
  let Icon = HelpCircle;
  let text = 'UNVERIFIED';

  if (normLabel === 'REAL') {
    bgColor = 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700';
    Icon = ShieldCheck;
    text = 'REAL';
  } else if (normLabel === 'FAKE') {
    bgColor = 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700';
    Icon = AlertTriangle;
    text = 'FAKE';
  } else if (normLabel === 'NEEDS VERIFICATION') {
    bgColor = 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700';
    Icon = HelpCircle;
    text = 'NEEDS VERIFICATION';
  }

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    md: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
    lg: 'text-base px-5 py-2.5 gap-2.5 font-bold',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg border shadow-xs transition-colors ${bgColor} ${sizeClasses[size]}`}
    >
      <Icon size={iconSizes[size]} className="shrink-0" />
      <span>{text}</span>
      {showConfidence && confidence !== undefined && (
        <span className="opacity-80 text-[0.85em] font-normal border-l border-current pl-1.5 ml-0.5">
          {Math.round(confidence * 100)}% conf.
        </span>
      )}
    </span>
  );
};
