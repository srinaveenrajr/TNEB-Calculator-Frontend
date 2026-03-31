import React, { useState, useEffect, useMemo, useCallback } from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { normalizeHistoryRow } from "../utils/historyNormalize";
import MeterCalculatorForm from "./dashboard/MeterCalculatorForm";
import SlabDatabasePanel from "./dashboard/SlabDatabasePanel";
import DashboardHistorySection from "./dashboard/DashboardHistorySection";
import SlabSkeleton from "./skeletons/SlabSkeleton";
import CardSkeleton from "./skeletons/CardSkeleton";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserSlabs } from "../store/slabsSlice";
import { computeBillPreview } from "../store/billingSlice";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export default function Newdashboard() {
  const { user, refreshUser } = useAuth();
  const dispatch = useDispatch();

  const [history, setHistory] = useState([]);
  const [reading, setReading] = useState("");
  const [baseLMRInput, setBaseLMRInput] = useState("");
  const [editReading, setEditReading] = useState("");
  const [phone, setPhone] = useState("");
  const [toast, setToast] = useState(null);
  const dbRows = useSelector((s) => s.slabs.items);
  const loadingSlabs = useSelector((s) => s.slabs.loading);
  const slabsLoaded = dbRows && dbRows.length > 0;
  const { unitsConsumed, totalBill, breakdown } = useSelector((s) => s.billing);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [activeTab, setActiveTab] = useState("table");
  const [confirmation, setconfirmation] = useState(false);

  const confirmationbutton = () => {
    setconfirmation(true);
  };

  const cancel = () => {
    setconfirmation(false);
  };

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const fetchSlabs = useCallback(async () => {
    if (!user?.id) return;
    try {
      await dispatch(fetchUserSlabs(user.id)).unwrap();
    } catch (e) {
      showToast(e || "Could not load slabs", "error");
    }
  }, [dispatch, showToast, user?.id]);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const { data } = await api.get("/history");
      setHistory(data);
    } catch {
      showToast("Could not load history", "error");
    } finally {
      setLoadingHistory(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSlabs();
    fetchHistory();
  }, [fetchSlabs, fetchHistory]);

  useEffect(() => {
    const h = history[0];
    if (h) setEditReading(String(h.reading ?? h.currentReading ?? ""));
  }, [history]);

  const historyNorm = useMemo(
    () => history.map(normalizeHistoryRow),
    [history],
  );

  const showBaseField = history.length === 0;

  // Keep Redux billing preview synced:
  // - if user is typing a new reading -> preview that
  // - else fallback to the latest saved row units (for slab highlight)
  useEffect(() => {
    if (!slabsLoaded) return;
    const latestUnits = Number(historyNorm?.[0]?.units ?? 0);
    const r = parseFloat(reading);
    const baseForPreview = showBaseField
      ? parseFloat(baseLMRInput)
      : parseFloat(user?.billingBaseLMR ?? NaN);

    const baseOk = Number.isFinite(baseForPreview) && baseForPreview > 0;
    const readingOk = Number.isFinite(r) && r > 0;

    if (readingOk && baseOk) {
      const units = r - baseForPreview;
      dispatch(computeBillPreview({ units }));
      return;
    }

    // Fallback to latest history row (or 0)
    dispatch(computeBillPreview({ units: latestUnits > 0 ? latestUnits : 0 }));
  }, [
    dispatch,
    slabsLoaded,
    historyNorm,
    reading,
    baseLMRInput,
    showBaseField,
    user?.billingBaseLMR,
  ]);

  const chartSeries = useMemo(() => [...historyNorm].reverse(), [historyNorm]);

  const chartOpts = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#64748b", font: { size: 11 } },
        },
      },
      scales: {
        x: {
          ticks: { color: "#64748b" },
          grid: { color: "#f1f5f9" },
        },
        y: {
          ticks: { color: "#64748b" },
          grid: { color: "#f1f5f9" },
        },
      },
    }),
    [],
  );

  const chartDataUnits = useMemo(
    () => ({
      labels: chartSeries.map((r) => r.date),
      datasets: [
        {
          label: "Units (kWh)",
          data: chartSeries.map((r) => r.units),
          borderColor: "#0891b2",
          backgroundColor: "rgba(8,145,178,0.1)",
          fill: true,
          tension: 0.35,
        },
      ],
    }),
    [chartSeries],
  );

  const chartDataBill = useMemo(
    () => ({
      labels: chartSeries.map((r) => r.date),
      datasets: [
        {
          label: "Bill (₹)",
          data: chartSeries.map((r) => r.billAmount),
          borderColor: "#7c3aed",
          backgroundColor: "rgba(124,58,237,0.08)",
          fill: true,
          tension: 0.35,
        },
      ],
    }),
    [chartSeries],
  );

  const chartDataRate = useMemo(
    () => ({
      labels: chartSeries.map((r) => r.date),
      datasets: [
        {
          label: "Effective ₹/kWh",
          data: chartSeries.map((r) =>
            r.units > 0 ? r.billAmount / r.units : null,
          ),
          borderColor: "#ea580c",
          backgroundColor: "rgba(234,88,12,0.08)",
          fill: false,
          tension: 0.35,
        },
      ],
    }),
    [chartSeries],
  );

  const calculate = async () => {
    const r = parseFloat(reading);
    if (Number.isNaN(r)) {
      showToast("Enter a valid reading", "warning");
      return;
    }
    if (!dbRows.length) {
      showToast("Slab data not loaded", "error");
      return;
    }

    setCalculating(true);
    try {
      const payload = { reading: r };
      if (history.length === 0) {
        const b = parseFloat(baseLMRInput);
        if (Number.isNaN(b)) {
          showToast("Enter base LMR for your first reading", "warning");
          return;
        }
        payload.baseLMR = b;
      }

      await api.post("/history", payload);
      setReading("");
      setBaseLMRInput("");
      await fetchHistory();
      await refreshUser();
      showToast("Saved", "success");
    } catch (e) {
      const msg = e.response?.data?.error || e.message || "Failed";
      showToast(msg, "error");
    } finally {
      setCalculating(false);
    }
  };

  const billingReset = async () => {
    if (!window.confirm("Are you sure? This will reset base reading")) return;
    try {
      await api.post("/user/billing-reset");
      await refreshUser();
      await fetchHistory();
      showToast("Billing base reset to latest reading", "success");
      setconfirmation(false);
    } catch (e) {
      showToast(e.response?.data?.error || "Reset failed", "error");
    }
  };

  const saveLatestEdit = async () => {
    const id = history[0]?._id;
    if (!id) return;
    setSavingEdit(true);
    try {
      await api.put(`/history/${id}`, { reading: parseFloat(editReading) });
      await fetchHistory();
      await refreshUser();
      showToast("Latest row updated", "success");
    } catch (e) {
      showToast(e.response?.data?.error || "Update failed", "error");
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteLatest = async () => {
    const id = history[0]?._id;
    if (!id) return;
    if (!window.confirm("Delete the latest consumption row?")) return;
    try {
      await api.delete(`/history/${id}`);
      await fetchHistory();
      await refreshUser();
      showToast("Deleted", "success");
    } catch (e) {
      showToast(e.response?.data?.error || "Delete failed", "error");
    }
  };

  const busy = loadingSlabs || loadingHistory;
  const toastStyle = {
    success: "bg-green-100 border-green-400 text-green-800",
    error: "bg-red-100 border-red-400 text-red-800",
    warning: "bg-amber-100 border-amber-400 text-amber-900",
  };

  return (
    <div className="min-h-[calc(100vh-var(--app-nav-h))] p-4 font-sans md:p-6 bg-gradient-to-b from-slate-50 to-slate-100/90 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="dash-animate flex flex-wrap items-center gap-4">
          <span class="text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] text-2xl">
            ⚡
          </span>
          <div>
            <h1 className="text-2xl font-black tracking-tight">EB Dashboard</h1>
            <p className="text-xs uppercase tracking-widest text-slate-500">
              Electricity bill &amp; consumption
            </p>
          </div>
          {(loadingSlabs || loadingHistory) && (
            <span className="ml-auto text-xs text-slate-500 animate-pulse">
              Loading…
            </span>
          )}
        </header>

        <div className="dash-animate">
          {loadingSlabs && dbRows.length === 0 ? (
            <CardSkeleton />
          ) : (
            <MeterCalculatorForm
              reading={reading}
              onReadingChange={setReading}
              baseLMR={baseLMRInput}
              onBaseLMRChange={setBaseLMRInput}
              showBaseField={showBaseField}
              onCalculate={calculate}
              disabled={busy || calculating || !dbRows.length}
            />
          )}

          {loadingSlabs ? (
            <div className="mt-4">
              <SlabSkeleton items={3} />
            </div>
          ) : (
            breakdown?.length > 0 && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-600">
                  Slab-wise breakdown (preview)
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  Units: {unitsConsumed.toFixed(2)} • Bill: ₹
                  {Number(totalBill).toFixed(2)}
                </p>
                <div className="mt-3 space-y-1">
                  {breakdown.map((b, idx) => (
                    <div
                      key={`${b.from}-${b.to}-${idx}`}
                      className="flex justify-between text-xs"
                    >
                      <span className="text-slate-700">
                        {b.from}–{b.to} @ ₹{Number(b.rate).toFixed(2)}
                      </span>
                      <span className="font-bold text-slate-900">
                        {b.units.toFixed(2)} × {Number(b.rate).toFixed(2)} = ₹
                        {Number(b.charge).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="dash-animate lg:col-span-5">
            <SlabDatabasePanel showToast={showToast} />
          </div>
          <div className="dash-animate lg:col-span-7">
            <DashboardHistorySection
              historyNormalized={historyNorm}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onBillingReset={billingReset}
              onDeleteLatest={deleteLatest}
              latestId={history[0]?._id}
              editReading={editReading}
              onEditReadingChange={setEditReading}
              onSaveLatestEdit={saveLatestEdit}
              savingEdit={savingEdit}
              chartDataUnits={chartDataUnits}
              chartDataBill={chartDataBill}
              chartDataRate={chartDataRate}
              chartOptions={chartOpts}
              showToast={showToast}
              phone={phone}
              onPhoneChange={setPhone}
              confirm={confirmationbutton}
              confirmation={confirmation}
              cancel={cancel}
              loading={loadingHistory}
            />
          </div>
        </div>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold shadow-xl ${toastStyle[toast.type]}`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
