import React from 'react';

export default function SlabSkeleton({ items = 4 }) {
  return (
    <div className="animate-pulse space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="h-5 w-40 rounded bg-slate-200"></div>
        <div className="flex gap-2">
          <div className="h-8 w-16 rounded-lg bg-slate-200"></div>
          <div className="h-8 w-16 rounded-lg bg-slate-200"></div>
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-slate-100 p-3">
            <div className="h-6 w-24 rounded bg-slate-200"></div>
            <div className="h-6 w-16 rounded bg-slate-200"></div>
            <div className="ml-auto h-6 w-20 rounded bg-slate-200"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
