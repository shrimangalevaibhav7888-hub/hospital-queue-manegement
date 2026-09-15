import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="w-full space-y-4 animate-pulse">
      <div className="h-8 bg-slate-200/80 rounded-xl w-1/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-28 bg-slate-200/60 rounded-2xl"></div>
        <div className="h-28 bg-slate-200/60 rounded-2xl"></div>
        <div className="h-28 bg-slate-200/60 rounded-2xl"></div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-12 bg-slate-200/40 rounded-xl w-full"></div>
        ))}
      </div>
    </div>
  );
};
