function isFiniteNumber(n) {
  return typeof n === "number" && Number.isFinite(n);
}

function sumOutflow(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) return null;
  const outflow = transactions
    .filter((t) => isFiniteNumber(t.amount) && t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  return isFiniteNumber(outflow) ? outflow : null;
}

function sumInflow(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) return null;
  const inflow = transactions
    .filter((t) => isFiniteNumber(t.amount) && t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);
  return isFiniteNumber(inflow) ? inflow : null;
}

function countFlagged(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) return 0;
  return transactions.filter((t) => String(t.status) === "Flagged").length;
}

function avgSpendPerTransaction(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) return null;
  const spend = transactions.filter((t) => isFiniteNumber(t.amount) && t.amount < 0);
  if (spend.length === 0) return null;
  const total = spend.reduce((s, t) => s + Math.abs(t.amount), 0);
  return total / spend.length;
}

function topSpendCategories(transactions, topN = 5) {
  if (!Array.isArray(transactions) || transactions.length === 0) return [];
  const map = new Map();
  transactions.forEach((t) => {
    if (!isFiniteNumber(t.amount) || t.amount >= 0) return;
    const cat = String(t.category || "Uncategorized");
    map.set(cat, (map.get(cat) || 0) + Math.abs(t.amount));
  });
  const rows = Array.from(map.entries()).map(([category, spend]) => ({ category, spend }));
  rows.sort((a, b) => b.spend - a.spend);
  return rows.slice(0, topN);
}

function largestSpendingTransactions(transactions, topN = 5) {
  if (!Array.isArray(transactions) || transactions.length === 0) return [];
  const spend = transactions
    .filter((t) => isFiniteNumber(t.amount) && t.amount < 0)
    .map((t) => ({ ...t, absAmount: Math.abs(t.amount) }));
  spend.sort((a, b) => b.absAmount - a.absAmount);
  return spend.slice(0, topN);
}

function spendingByDaySeries(transactions) {
  // Build a simple time series of daily outflow totals from the mock transaction dates.
  // Note: This is deterministic and derived ONLY from transactions shown to the dashboard.
  if (!Array.isArray(transactions) || transactions.length === 0) return [];
  const map = new Map();
  transactions.forEach((t) => {
    const date = String(t.date || "");
    if (!date) return;
    if (!isFiniteNumber(t.amount) || t.amount >= 0) return;
    map.set(date, (map.get(date) || 0) + Math.abs(t.amount));
  });
  const rows = Array.from(map.entries()).map(([date, outflow]) => ({ date, outflow }));
  // ISO dates sort lexicographically.
  rows.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  return rows;
}

// PUBLIC_INTERFACE
export function buildDashboardSnapshot({ transactions, kpis } = {}) {
  /**
   * Builds a lightweight, deterministic snapshot of the dashboard-visible metrics.
   * This gives the Q&A assistant a stable contract and ensures it reads the same values
   * shown on the dashboard (and can be extended later when real data exists).
   *
   * @param {Object} params
   * @param {Array} params.transactions - transactions currently used by Dashboard (mock data).
   * @param {Object} params.kpis - optional precomputed KPIs from Dashboard.
   * @returns {Object} snapshot - normalized metrics + derived series/tables.
   */
  const tx = Array.isArray(transactions) ? transactions : [];

  const outflow = isFiniteNumber(kpis?.outflow) ? kpis.outflow : sumOutflow(tx);
  const inflow = isFiniteNumber(kpis?.inflow) ? kpis.inflow : sumInflow(tx);
  const net = isFiniteNumber(kpis?.net)
    ? kpis.net
    : isFiniteNumber(inflow) && isFiniteNumber(outflow)
      ? inflow - outflow
      : null;

  return {
    meta: {
      source: "mock-data",
      txCount: tx.length,
      generatedAt: new Date().toISOString(),
    },
    kpis: {
      outflow,
      inflow,
      net,
      flagged: typeof kpis?.flagged === "number" ? kpis.flagged : countFlagged(tx),
      avgSpend: avgSpendPerTransaction(tx),
    },
    series: {
      spendingByDay: spendingByDaySeries(tx),
    },
    tables: {
      topCategories: topSpendCategories(tx, 5),
      largestSpends: largestSpendingTransactions(tx, 5),
    },
  };
}
