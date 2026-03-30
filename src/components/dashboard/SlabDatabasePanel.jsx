import React, { useState } from "react";
import { api } from "../../api/client";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserSlabs } from "../../store/slabsSlice";

export default function SlabDatabasePanel({
  showToast,
  isDark,
}) {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const dbRows = useSelector((s) => s.slabs.items);
  const loading = useSelector((s) => s.slabs.loading);
  const activeCategory = useSelector((s) => s.billing.category);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState([]);
  const [saving, setSaving] = useState(false);

  const addEmptyRow = () => {
    setDraft((prev) => [
      ...prev,
      {
        from: "",
        to: "",
        rate: "",
        maxUnits: "",
      },
    ]);
  };

  const beginEdit = async () => {
    setSaving(true);
    try {
      // Create a user-specific copy on first edit.
      const { data } = await api.post("/tables/user/init");
      setDraft(
        (data || []).map((r) => ({
          _id: r._id,
          from: r.from ?? "",
          to: r.to ?? "",
          rate: String(r.rate?.$numberDecimal ?? r.rate ?? ""),
          maxUnits: r.maxUnits ?? "",
        })),
      );
      setEditing(true);
    } catch (e) {
      showToast(e.response?.data?.error || e.message || "Init failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCell = (index, field, value) => {
    setDraft((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleDelete = async (index, row) => {
    if (!window.confirm("Delete this slab row?")) return;
    if (row?._id) {
      try {
        await api.delete(`/tables/${row._id}`);
        showToast("Slab deleted", "success");
        setDraft((prev) => prev.filter((_, i) => i !== index));
        if (user?.id) await dispatch(fetchUserSlabs(user.id)).unwrap();
      } catch (e) {
        showToast(e.response?.data?.error || "Delete failed", "error");
      }
      return;
    }
    // Unsaved (empty) draft row: delete locally only
    setDraft((prev) => prev.filter((_, i) => i !== index));
  };

  const saveSlabs = async () => {
    setSaving(true);
    try {
      await api.post("/tables/save", {
        tables: draft.map((r) => ({
          _id: r._id,
          from: r.from,
          to: r.to,
          rate: r.rate,
          maxUnits: r.maxUnits,
        })),
      });

      showToast("Slabs saved", "success");
      setEditing(false);
      if (user?.id) await dispatch(fetchUserSlabs(user.id)).unwrap();
    } catch (e) {
      showToast(e.response?.data?.error || e.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const panel = isDark
    ? "border-slate-700 bg-slate-900/60"
    : "border-slate-200 bg-white shadow-sm";
  const head = isDark
    ? "border-slate-700 text-slate-300"
    : "border-slate-100 text-slate-600";
  const cell = isDark ? "text-slate-200" : "text-slate-800";
  const inputCls = isDark
    ? "w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-center text-xs text-white outline-none focus:border-cyan-500"
    : "w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-center text-xs outline-none focus:border-blue-500";

  const displayRows = editing ? draft : dbRows;

  return (
    <div className={`rounded-2xl border ${panel} overflow-hidden`}>
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 ${head}`}
      >
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
          <span
            className={`inline-block h-2 w-2 animate-pulse rounded-full ${isDark ? "bg-cyan-400" : "bg-cyan-500"}`}
          />
          <span className={isDark ? "text-white" : "text-slate-900"}>
            Slab database
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => user?.id && dispatch(fetchUserSlabs(user.id))}
            disabled={loading || editing}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              isDark
                ? "border border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Refresh
          </button>
          {!editing ? (
            <button
              type="button"
              onClick={beginEdit}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                isDark
                  ? "border border-amber-600/50 bg-slate-800 text-amber-400 hover:bg-slate-700"
                  : "border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100"
              }`}
            >
              Edit
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={saveSlabs}
                disabled={saving}
                className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-cyan-500 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={addEmptyRow}
                disabled={saving}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                  isDark
                    ? "border border-emerald-600/50 bg-slate-800 text-emerald-400 hover:bg-slate-700"
                    : "border border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                } disabled:opacity-50`}
              >
                Add Row
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={saving}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                  isDark
                    ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr
              className={
                isDark
                  ? "border-b border-slate-800"
                  : "border-b border-slate-100"
              }
            >
              {["From", "To", "Rate ₹", "Max"].map((h) => (
                <th
                  key={h}
                  className={`px-4 py-2.5 text-left font-bold uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-500"}`}
                >
                  {h}
                </th>
              ))}
              {editing && (
                <th
                  className={`px-4 py-2.5 text-left font-bold uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-500"}`}
                >
                  Del
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {displayRows.length === 0 ? (
              <tr>
                <td
                  colSpan={editing ? 5 : 4}
                  className={`py-10 text-center ${isDark ? "text-slate-600" : "text-slate-400"}`}
                >
                  No slabs
                </td>
              </tr>
            ) : (
              displayRows.map((row, i) => {
                const isActive =
                  activeCategory != null &&
                  parseFloat(row.maxUnits) === activeCategory;
                return (
                  <tr
                    key={row._id || i}
                    className={`border-b transition-colors ${
                      isDark ? "border-slate-800" : "border-slate-100"
                    } ${isActive ? (isDark ? "bg-cyan-950/30" : "bg-cyan-50") : isDark ? "hover:bg-slate-800/40" : "hover:bg-slate-50/80"}`}
                  >
                    <td className={`px-4 py-2.5 ${cell}`}>
                      {editing ? (
                        <input
                          type="number"
                          className={inputCls}
                          value={row.from}
                          onChange={(e) =>
                            handleCell(i, "from", e.target.value)
                          }
                        />
                      ) : (
                        <span
                          className={
                            isDark
                              ? "rounded border border-cyan-900 bg-cyan-950 px-2 py-0.5 font-bold text-cyan-400"
                              : "rounded border border-cyan-100 bg-cyan-50 px-2 py-0.5 font-bold text-cyan-700"
                          }
                        >
                          {row.from}
                        </span>
                      )}
                    </td>
                    <td className={`px-4 py-2.5 ${cell}`}>
                      {editing ? (
                        <input
                          type="text"
                          className={inputCls}
                          value={row.to}
                          onChange={(e) =>
                            handleCell(i, "to", e.target.value)
                          }
                        />
                      ) : (
                        <span
                          className={
                            isDark
                              ? "rounded border border-violet-900 bg-violet-950 px-2 py-0.5 font-bold text-violet-400"
                              : "rounded border border-violet-100 bg-violet-50 px-2 py-0.5 font-bold text-violet-700"
                          }
                        >
                          {row.to}
                        </span>
                      )}
                    </td>
                    <td
                      className={`px-4 py-2.5 font-bold ${isDark ? "text-amber-400" : "text-amber-700"}`}
                    >
                      {editing ? (
                        <input
                          type="number"
                          step="any"
                          className={inputCls}
                          value={row.rate}
                          onChange={(e) =>
                            handleCell(i, "rate", e.target.value)
                          }
                        />
                      ) : (
                        `₹ ${row.rate}`
                      )}
                    </td>
                    <td className={`px-4 py-2.5 ${cell}`}>
                      {editing ? (
                        <input
                          type="text"
                          className={inputCls}
                              value={row.maxUnits ?? ""}
                          onChange={(e) =>
                                handleCell(i, "maxUnits", e.target.value)
                          }
                        />
                      ) : (
                        <span
                          className={
                            isDark
                              ? "rounded border border-emerald-900 bg-emerald-950 px-2 py-0.5 font-bold text-emerald-400"
                              : "rounded border border-emerald-100 bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700"
                          }
                        >
                          {!row.maxUnits ||
                          String(row.maxUnits).toLowerCase() === "infinity"
                            ? "∞"
                            : row.maxUnits}
                        </span>
                      )}
                    </td>
                    {editing && (
                      <td className="px-4 py-2.5">
                        <button
                          type="button"
                          onClick={() => handleDelete(i, row)}
                          disabled={loading}
                          className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase ${
                            isDark
                              ? "border border-red-900/60 text-red-400 hover:bg-red-950/50"
                              : "border border-red-200 text-red-700 hover:bg-red-50"
                          } disabled:opacity-50`}
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
