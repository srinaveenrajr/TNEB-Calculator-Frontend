import React from 'react';

export default function TableSkeleton({ rows = 5 }) {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50 p-4">
        <div className="h-4 w-32 rounded bg-slate-200"></div>
      </div>
      <div className="divide-y divide-slate-100 p-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-4">
            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-slate-200"></div>
              <div className="h-3 w-16 rounded bg-slate-200"></div>
            </div>
            <div className="flex gap-4">
              <div className="h-6 w-16 rounded bg-slate-200"></div>
              <div className="h-6 w-20 rounded bg-slate-200"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
