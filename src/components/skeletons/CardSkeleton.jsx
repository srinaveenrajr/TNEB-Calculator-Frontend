import React from "react";

export default function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-12 w-12 rounded-xl bg-slate-200"></div>
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-slate-200"></div>
          <div className="h-3 w-24 rounded bg-slate-200"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-slate-200"></div>
        <div className="h-4 w-5/6 rounded bg-slate-200"></div>
        <div className="h-4 w-4/6 rounded bg-slate-200"></div>
      </div>
    </div>
  );
}
