import React, { forwardRef } from "react";

const LatestBillCard = forwardRef(function LatestBillCard(
  { latest, isDark },
  ref,
) {
  if (!latest) {
    return (
      <div
        ref={ref}
        className={`rounded-2xl border p-8 text-center ${
          isDark
            ? "border-slate-700 bg-slate-900/80 text-slate-500"
            : "border-slate-200 bg-white text-slate-500 shadow-sm"
        }`}
      >
        <p className="text-sm font-medium">No bill yet</p>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`overflow-hidden rounded-2xl border shadow-lg ${
        isDark
          ? "border-slate-600 bg-gradient-to-br from-slate-800 to-slate-900"
          : "border-slate-200/80 bg-gradient-to-br from-white to-slate-50"
      }`}
    >
      <div
        className={`px-5 py-3 text-xs font-bold uppercase tracking-widest ${
          isDark ? "bg-slate-950/50 text-amber-400/90" : "bg-amber-50 text-amber-800"
        }`}
      >
        Latest bill
      </div>
      <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex gap-3">
            <span className="text-2xl" aria-hidden>
              💰
            </span>
            <div>
              <p className={`text-xs font-semibold uppercase ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Bill amount
              </p>
              <p className={`mt-0.5 text-3xl font-black tabular-nums ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                ₹{Number(latest.billAmount).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl" aria-hidden>
              🔢
            </span>
            <div>
              <p className={`text-xs font-semibold uppercase ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Reading (MRT)
              </p>
              <p className={`mt-0.5 text-2xl font-bold tabular-nums ${isDark ? "text-white" : "text-slate-900"}`}>
                {latest.reading}
              </p>
            </div>
          </div>
        </div>
        <div
          className={`flex min-w-[140px] flex-col items-center justify-center rounded-xl px-6 py-5 sm:min-w-[180px] ${
            isDark
              ? "bg-gradient-to-b from-amber-500/20 to-orange-600/10 ring-1 ring-amber-500/30"
              : "bg-gradient-to-b from-amber-100 to-orange-50 ring-1 ring-amber-200/80"
          }`}
        >
          <span className="text-2xl" aria-hidden>
            ⚡
          </span>
          <p className={`mt-2 text-[10px] font-bold uppercase ${isDark ? "text-amber-200/80" : "text-amber-900/70"}`}>
            Units (kWh)
          </p>
          <p className={`mt-1 text-4xl font-black tabular-nums ${isDark ? "text-amber-300" : "text-amber-700"}`}>
            {Number(latest.units).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
});

export default LatestBillCard;
