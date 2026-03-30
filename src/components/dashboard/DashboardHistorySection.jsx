import React, { useRef } from "react";
import html2canvas from "html2canvas-pro";
import { Line } from "react-chartjs-2";
import ConsumptionHistoryTableFrozen from "./ConsumptionHistoryTableFrozen";

/**
 * Toolbar + frozen history table + analytics charts.
 * Table UI is delegated to ConsumptionHistoryTableFrozen (do not alter that file's layout).
 */
export default function DashboardHistorySection({
  historyNormalized,
  activeTab,
  onTabChange,
  onBillingReset,
  onDeleteLatest,
  latestId,
  editReading,
  onEditReadingChange,
  onSaveLatestEdit,
  savingEdit,
  chartDataUnits,
  chartDataBill,
  chartDataRate,
  chartOptions,
  showToast,
  phone,
  onPhoneChange,
}) {
  const captureRef = useRef(null);

  const sendWhatsApp = async () => {
    const el = captureRef.current;
    if (!el) return;
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Scroll to top to prevent scroll-related offset issues
      const originalScrollPos = window.scrollY;
      window.scrollTo(0, 0);

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        // scrollY: -window.scrollY, // Not needed if we scrollTo(0,0)
        windowWidth: 850,
        width: 850,
        // REMOVE THESE TWO LINES:
        // windowHeight: el.scrollHeight,
        // height: el.offsetHeight,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (clonedDoc) => {
          const tables = clonedDoc.querySelectorAll("table");
          tables.forEach((t) => {
            t.style.tableLayout = "fixed";
            t.style.width = "100%";
          });
          const cells = clonedDoc.querySelectorAll("td, th");
          cells.forEach((c) => {
            c.style.whiteSpace = "nowrap";
            c.style.padding = "10px 16px";
          });
        },
      });

      // Restore scroll position
      window.scrollTo(0, originalScrollPos);

      // ... rest of your logic

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("No image");
      const file = new File([blob], "eb-history.png", { type: "image/png" });
      const clean = (phone || "").replace(/\D/g, "");
      const wa = clean.length === 10 ? `91${clean}` : clean;
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Consumption history" });
      } else {
        const link = document.createElement("a");
        link.download = `eb-history-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        if (wa) window.open(`https://wa.me/${wa}`, "_blank");
        else
          showToast(
            "Image downloaded. Add a phone number to open WhatsApp.",
            "warning",
          );
      }
    } catch {
      showToast("Screenshot failed", "error");
    }
  };

  const topFive = historyNormalized.slice(0, 5);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        {["table", "analytics"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onTabChange(t)}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition ${
              activeTab === t
                ? "bg-cyan-600 text-white"
                : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            {t === "table" ? "Consumption history" : "Analytics"}
          </button>
        ))}
      </div>

      {activeTab === "table" && (
        <div className="p-4">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="flex flex-col text-xs font-semibold text-slate-600 dark:text-slate-400">
              WhatsApp number (optional)
              <input
                type="tel"
                value={phone}
                onChange={(e) => onPhoneChange(e.target.value)}
                placeholder="10-digit mobile"
                className="mt-1 w-48 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
              />
            </label>
          </div>

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="rounded-xl border-2 border-red-200 bg-red-50/80 px-4 py-3 dark:border-red-900 dark:bg-red-950/40">
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-red-700 dark:text-red-400">
                Danger zone
              </p>
              <button
                type="button"
                onClick={onBillingReset}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-red-500"
              >
                Reset Log
              </button>
              <p className="mt-2 max-w-md text-[10px] text-red-800/90 dark:text-red-200/80">
                Sets the next billing base to your latest meter reading. Does
                not delete history.
              </p>
            </div>
            <button
              type="button"
              onClick={sendWhatsApp}
              disabled={!historyNormalized.length}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send WhatsApp
            </button>
          </div>

          {latestId && (
            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-800/50">
              <p className="mb-2 text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                Edit latest reading only
              </p>
              <div className="flex flex-wrap gap-2">
                <input
                  type="number"
                  value={editReading}
                  onChange={(e) => onEditReadingChange(e.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
                />
                <button
                  type="button"
                  onClick={onSaveLatestEdit}
                  disabled={savingEdit}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={onDeleteLatest}
                  className="rounded-lg border border-red-300 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                >
                  Delete latest
                </button>
              </div>
            </div>
          )}

          {historyNormalized.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">
              No consumption rows yet.
            </p>
          ) : (
            <ConsumptionHistoryTableFrozen rows={historyNormalized} />
          )}

          {/* Hidden capture: latest 5 rows only */}
          <div
            ref={captureRef}
            className="pointer-events-none fixed left-[9999px] top-0 isolate"
            style={{ width: "850px" }}
            aria-hidden
          >
            <ConsumptionHistoryTableFrozen rows={topFive} />
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-4 p-4">
          {historyNormalized.length < 2 ? (
            <p className="py-12 text-center text-sm text-slate-500">
              Add at least two entries for analytics.
            </p>
          ) : (
            <>
              <div className="h-72">
                <Line data={chartDataUnits} options={chartOptions} />
              </div>
              <div className="h-72">
                <Line data={chartDataBill} options={chartOptions} />
              </div>
              <div className="h-72">
                <Line data={chartDataRate} options={chartOptions} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
