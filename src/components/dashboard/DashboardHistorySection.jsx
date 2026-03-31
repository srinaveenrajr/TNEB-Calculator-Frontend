import React, { useRef } from "react";
import html2canvas from "html2canvas-pro";
import { Line } from "react-chartjs-2";
import ConsumptionHistoryTableFrozen from "./ConsumptionHistoryTableFrozen";
import TableSkeleton from "../skeletons/TableSkeleton";
import CardSkeleton from "../skeletons/CardSkeleton";

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
  confirm,
  confirmation,
  cancel,
  loading,
}) {
  const captureRef = useRef(null);

  const inlineComputedStyles = (sourceNode, targetNode) => {
    if (!(sourceNode instanceof Element) || !(targetNode instanceof Element))
      return;
    const computed = window.getComputedStyle(sourceNode);
    for (let i = 0; i < computed.length; i += 1) {
      const prop = computed[i];
      targetNode.style.setProperty(
        prop,
        computed.getPropertyValue(prop),
        computed.getPropertyPriority(prop),
      );
    }
    const sourceChildren = sourceNode.children;
    const targetChildren = targetNode.children;
    for (let i = 0; i < sourceChildren.length; i += 1) {
      inlineComputedStyles(sourceChildren[i], targetChildren[i]);
    }
  };

  const sendWhatsApp = async () => {
    const el = captureRef.current;
    if (!el) return;
    let clonedNode = null;
    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
      await new Promise((resolve) => requestAnimationFrame(() => resolve()));

      clonedNode = el.cloneNode(true);
      inlineComputedStyles(el, clonedNode);
      clonedNode.style.position = "fixed";
      clonedNode.style.left = "0";
      clonedNode.style.top = "0";
      clonedNode.style.zIndex = "-1";
      clonedNode.style.pointerEvents = "none";
      clonedNode.style.opacity = "1";
      clonedNode.style.transform = "none";
      clonedNode.style.width = "850px";
      document.body.appendChild(clonedNode);

      const canvas = await html2canvas(clonedNode, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        windowWidth: 850,
        width: 850,
        windowHeight: clonedNode.offsetHeight,
        height: clonedNode.offsetHeight,
        backgroundColor: "#ffffff",
        logging: false,
      });

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
    } finally {
      if (clonedNode?.parentNode) {
        clonedNode.parentNode.removeChild(clonedNode);
      }
    }
  };

  const topFive = historyNormalized.slice(0, 5);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
        {["table", "analytics"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onTabChange(t)}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition ${
              activeTab === t
                ? "bg-cyan-600 text-white"
                : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {t === "table" ? "Consumption history" : "Analytics"}
          </button>
        ))}
      </div>

      {activeTab === "table" && (
        <div className="p-4">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="rounded-xl border-2 border-red-200 bg-red-50/80 px-4 py-3">
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-red-700">
                Danger zone
              </p>
              {confirmation ? (
                <>
                  <button
                    type="button"
                    onClick={onBillingReset}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-red-500"
                  >
                    Reset Log
                  </button>
                  <button
                    type="button"
                    onClick={cancel}
                    className="rounded-lg bg-gray-400 px-4 py-2 ml-2 text-sm font-bold text-white shadow hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={confirm}
                    className="rounded-lg bg-red-400 px-4 py-2 text-sm font-bold text-white shadow hover:bg-red-500"
                  >
                    Do you want to reset ?
                  </button>
                </div>
              )}
              <p className="mt-2 max-w-md text-[10px] text-red-800/90">
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
              Send to WhatsApp
            </button>
          </div>

          {latestId && (
            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-xs font-bold uppercase text-slate-600">
                Edit latest reading only
              </p>
              <div className="flex flex-wrap gap-2">
                <input
                  type="number"
                  value={editReading}
                  onChange={(e) => onEditReadingChange(e.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2"
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
                  className="rounded-lg border border-red-300 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50"
                >
                  Delete latest
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <TableSkeleton rows={5} />
          ) : historyNormalized.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">
              No consumption rows yet.
            </p>
          ) : (
            <ConsumptionHistoryTableFrozen rows={historyNormalized} />
          )}

          {/* Hidden capture: latest 5 rows only */}
          <div
            ref={captureRef}
            className="pointer-events-none fixed left-0 top-0 isolate opacity-0"
            style={{ width: "850px" }}
            aria-hidden
          >
            <ConsumptionHistoryTableFrozen rows={topFive} />
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-4 p-4">
          {loading ? (
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : historyNormalized.length < 2 ? (
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
