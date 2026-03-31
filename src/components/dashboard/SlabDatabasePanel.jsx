import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TableSkeleton from "../skeletons/TableSkeleton";
import {
  fetchUserSlabs,
  initUserSlabs,
  saveUserSlabs,
  deleteUserSlabRow,
} from "../../store/slabsSlice";

export default function SlabDatabasePanel({ showToast }) {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const dbRows = useSelector((s) => s.slabs.items);
  const loading = useSelector((s) => s.slabs.loading);
  const activeCategory = useSelector((s) => s.billing.category);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState([]);

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
    try {
      if (!user?.id) return;
      const data = await dispatch(initUserSlabs(user.id)).unwrap();
      setDraft(
        (data || []).map((r) => ({
          _id: r._id,
          from: r.from ?? "",
          to: r.to ?? "",
          rate: String(r.rate ?? ""),
          maxUnits: r.maxUnits ?? "",
        })),
      );
      setEditing(true);
    } catch (e) {
      showToast(e || "Init failed", "error");
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
        if (!user?.id) return;
        await dispatch(
          deleteUserSlabRow({ userId: user.id, id: row._id }),
        ).unwrap();
        showToast("Slab deleted", "success");
        setDraft((prev) => prev.filter((_, i) => i !== index));
      } catch (e) {
        showToast(e || "Delete failed", "error");
      }
      return;
    }
    setDraft((prev) => prev.filter((_, i) => i !== index));
  };

  const saveSlabs = async () => {
    try {
      if (!user?.id) return;
      await dispatch(
        saveUserSlabs({ userId: user.id, tables: draft }),
      ).unwrap();
      showToast("Slabs saved", "success");
      setEditing(false);
    } catch (e) {
      showToast(e || "Save failed", "error");
    }
  };

  const panel = "border-slate-200 bg-white shadow-sm";
  const head = "border-slate-100 text-slate-600";
  const cell = "text-slate-800";
  const inputCls =
    "w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-center text-xs outline-none focus:border-blue-500";

  const displayRows = editing ? draft : dbRows;

  if (loading && !editing && displayRows.length === 0) {
    return <TableSkeleton rows={5} />;
  }

  return (
    <div className={`rounded-2xl border ${panel} overflow-hidden`}>
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 ${head}`}
      >
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-cyan-500" />
          <span className="text-slate-900">Slab database</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => user?.id && dispatch(fetchUserSlabs(user.id))}
            disabled={loading || editing}
            className="rounded-lg px-3 py-1.5 text-xs font-bold transition border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
          {!editing ? (
            <button
              type="button"
              onClick={beginEdit}
              disabled={loading}
              className="rounded-lg px-3 py-1.5 text-xs font-bold transition border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 disabled:opacity-50"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={saveSlabs}
                disabled={loading}
                className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-cyan-500 disabled:opacity-50"
              >
                {loading ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={addEmptyRow}
                disabled={loading}
                className="rounded-lg px-3 py-1.5 text-xs font-bold border border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 disabled:opacity-50"
              >
                Add Row
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={loading}
                className="rounded-lg px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
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
            <tr className="border-b border-slate-100">
              {["From", "To", "Rate ₹", "Max"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left font-bold uppercase tracking-widest text-slate-500"
                >
                  {h}
                </th>
              ))}
              {editing && (
                <th className="px-4 py-2.5 text-left font-bold uppercase tracking-widest text-slate-500">
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
                  className="py-10 text-center text-slate-400"
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
                    className={`border-b transition-colors border-slate-100 ${isActive ? "bg-cyan-50" : "hover:bg-slate-50/80"}`}
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
                        <span className="rounded border border-cyan-100 bg-cyan-50 px-2 py-0.5 font-bold text-cyan-700">
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
                          onChange={(e) => handleCell(i, "to", e.target.value)}
                        />
                      ) : (
                        <span className="rounded border border-violet-100 bg-violet-50 px-2 py-0.5 font-bold text-violet-700">
                          {row.to}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-bold text-amber-700">
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
                        <span className="rounded border border-emerald-100 bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">
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
                          className="rounded-lg px-2 py-1 text-[10px] font-bold uppercase border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
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
