/** Map API row to canonical shape (supports legacy field names). */
export function normalizeHistoryRow(row) {
  const reading = Number(row.reading ?? row.currentReading ?? 0);
  const baseLMR = Number(row.baseLMR ?? row.baseLmr ?? 0);
  const units = Number(row.units ?? row.unitsConsumed ?? 0);
  const billAmount = Number(row.billAmount ?? row.totalBill ?? 0);
  return {
    _id: row._id,
    date: row.date,
    reading,
    baseLMR,
    units,
    billAmount,
  };
}
