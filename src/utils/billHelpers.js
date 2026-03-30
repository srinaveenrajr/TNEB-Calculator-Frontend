export function computeSlabBill(totalUnits, dbRows) {
  if (!Array.isArray(dbRows) || dbRows.length === 0) {
    return { totalBill: 0, category: null, breakdown: [] };
  }

  const units = Number(totalUnits);
  if (!Number.isFinite(units) || units <= 0) {
    return { totalBill: 0, category: null, breakdown: [] };
  }

  // Select plan group by smallest maxUnits that covers units.
  const validMax = dbRows
    .map((v) => parseFloat(v.maxUnits))
    .filter((m) => !Number.isNaN(m) && m >= units);

  const selectedMax =
    validMax.length > 0
      ? Math.min(...validMax)
      : Math.max(...dbRows.map((v) => parseFloat(v.maxUnits)));

  const planTiers = dbRows
    .filter((v) => parseFloat(v.maxUnits) === selectedMax)
    .sort((a, b) => {
      const fromA = parseFloat(a.from);
      const fromB = parseFloat(b.from);
      const _fromA = Number.isNaN(fromA) ? Number.POSITIVE_INFINITY : fromA;
      const _fromB = Number.isNaN(fromB) ? Number.POSITIVE_INFINITY : fromB;
      if (_fromA !== _fromB) return _fromA - _fromB;
      const toA = parseFloat(a.to);
      const toB = parseFloat(b.to);
      const _toA = Number.isNaN(toA) ? Number.POSITIVE_INFINITY : toA;
      const _toB = Number.isNaN(toB) ? Number.POSITIVE_INFINITY : toB;
      return _toA - _toB;
    });

  let totalBill = 0;
  const breakdown = [];

  for (const tier of planTiers) {
    const from = parseFloat(tier.from);
    const toRaw = parseFloat(tier.to);
    const to = Number.isNaN(toRaw) ? Number.POSITIVE_INFINITY : toRaw;
    const rate = Number(tier.rate?.$numberDecimal ?? tier.rate ?? 0);

    const tierFrom = Number.isNaN(from) ? Number.POSITIVE_INFINITY : from;
    if (units < tierFrom) break;

    // Inclusive [tierFrom..to]
    const tierTo = Math.min(units, to);
    const tierQty = tierTo - tierFrom + 1;
    if (tierQty > 0) {
      const charge = tierQty * rate;
      totalBill += charge;
      breakdown.push({
        from: tierFrom,
        to,
        rate,
        units: tierQty,
        charge: Math.round(charge * 100) / 100,
      });
    }

    if (units <= to) break; // finished
  }

  return {
    totalBill: Math.round(totalBill * 100) / 100,
    category: selectedMax,
    breakdown,
  };
}

export function normalizeSlabRow(v) {
  return {
    ...v,
    rate: v.rate?.$numberDecimal ?? v.rate,
  };
}
