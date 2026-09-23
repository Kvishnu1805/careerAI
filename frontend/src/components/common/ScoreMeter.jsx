import React from 'react';

const ScoreMeter = ({ score = 0, size = 120, strokeWidth = 10, label = 'Match Score' }) => {
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let colorClass = 'text-emerald-500';
  let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (normalizedScore < 60) {
    colorClass = 'text-rose-500';
    badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (normalizedScore < 80) {
    colorClass = 'text-amber-500';
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <div className="flex flex-col items-center justify-center p-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${colorClass} transition-all duration-1000 ease-out`}
            fill="transparent"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-slate-800 tracking-tight">{normalizedScore}%</span>
        </div>
      </div>
      {label && (
        <span className={`mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badgeBg}`}>
          {label}
        </span>
      )}
    </div>
  );
};

export default ScoreMeter;

