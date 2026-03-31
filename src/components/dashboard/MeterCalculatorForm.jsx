import React from "react";

export default function MeterCalculatorForm({
  reading,
  onReadingChange,
  baseLMR,
  onBaseLMRChange,
  showBaseField,
  onCalculate,
  disabled,
}) {
  return (
    <div className="rounded-2xl border overflow-hidden border-slate-200 bg-white shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100/80">
        <p className="text-sm font-bold text-slate-800">Meter reading</p>
        <p className="mt-0.5 text-xs text-slate-500">
          New reading must be greater than the previous recorded reading.
        </p>
      </div>
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:flex-wrap sm:items-end">
        {showBaseField && (
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">
              Base LMR (first bill only)
            </label>
            <input
              type="number"
              value={baseLMR}
              onChange={(e) => onBaseLMRChange(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 font-bold tabular-nums outline-none sm:w-40 border-slate-200 bg-white text-slate-900"
            />
          </div>
        )}
        <div className="min-w-0 flex-1 sm:max-w-xs">
          <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">
            Current reading
          </label>
          <input
            type="number"
            value={reading}
            onChange={(e) => onReadingChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onCalculate()}
            className="w-full rounded-xl border px-4 py-3 text-lg font-bold tabular-nums outline-none border-slate-200 bg-white text-slate-900"
          />
        </div>
        <button
          type="button"
          onClick={onCalculate}
          disabled={disabled}
          className="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-8 py-3 text-sm font-black uppercase tracking-widest text-white shadow-lg transition hover:from-violet-500 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Calculate
        </button>
      </div>
    </div>
  );
}
