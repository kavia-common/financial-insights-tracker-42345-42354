const MISSING = "This information is not available in the dashboard.";

function isFiniteNumber(n) {
  return typeof n === "number" && Number.isFinite(n);
}

function money(amount) {
  if (!isFiniteNumber(amount)) return null;
  return `$${amount.toFixed(2)}`;
}

function safeString(v) {
  const s = String(v ?? "").trim();
  return s ? s : null;
}

function sortByDateDesc(transactions) {
  // transactions are ISO yyyy-mm-dd; lexicographic sort works.
  return [...transactions].sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

function sumOutflow(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) return null;
  const outflow = transactions.filter((t) => isFiniteNumber(t.amount) && t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  return isFiniteNumber(outflow) ? outflow : null;
}

function sumInflow(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) return null;
  const inflow = transactions.filter((t) => isFiniteNumber(t.amount) && t.amount > 0).reduce((s, t) => s + t.amount, 0);
  return isFiniteNumber(inflow) ? inflow : null;
}

function countFlagged(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) return null;
  return transactions.filter((t) => String(t.status) === "Flagged").length;
}

function avgSpendPerTransaction(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) return null;
  const spend = transactions.filter((t) => isFiniteNumber(t.amount) && t.amount < 0);
  if (spend.length === 0) return null;
  const total = spend.reduce((s, t) => s + Math.abs(t.amount), 0);
  return total / spend.length;
}

function topSpendCategories(transactions, topN = 3) {
  if (!Array.isArray(transactions) || transactions.length === 0) return null;
  const map = new Map();
  transactions.forEach((t) => {
    if (!isFiniteNumber(t.amount) || t.amount >= 0) return;
    const cat = safeString(t.category) || "Uncategorized";
    map.set(cat, (map.get(cat) || 0) + Math.abs(t.amount));
  });

  const rows = Array.from(map.entries()).map(([category, spend]) => ({ category, spend }));
  rows.sort((a, b) => b.spend - a.spend);
  return rows.slice(0, topN);
}

function mostRecentFlagged(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) return null;
  const sorted = sortByDateDesc(transactions);
  return sorted.find((t) => String(t.status) === "Flagged") || null;
}

function buildOverallSummary({ outflow, inflow, net, flagged, txCount }) {
  const lines = [];

  if (isFiniteNumber(outflow) && isFiniteNumber(inflow) && isFiniteNumber(net)) {
    lines.push(
      `In the current dashboard view, total outflow is ${money(outflow)}, inflow is ${money(inflow)}, and net cashflow is ${money(net)}.`
    );
  } else {
    lines.push(MISSING);
  }

  if (typeof flagged === "number") {
    lines.push(`There ${flagged === 1 ? "is" : "are"} ${flagged} flagged transaction${flagged === 1 ? "" : "s"} in the dataset.`);
  } else {
    lines.push(MISSING);
  }

  if (typeof txCount === "number") {
    lines.push(`This summary is based on ${txCount} transaction${txCount === 1 ? "" : "s"} currently available in the dashboard.`);
  } else {
    lines.push(MISSING);
  }

  // Ensure 2–3 lines by slicing; still satisfies "missing info" rule where needed.
  return lines.slice(0, 3);
}

function buildKeyInsights({ outflow, inflow, net, avgSpend, topCats, flagged, recentFlaggedTx }) {
  const bullets = [];

  if (isFiniteNumber(outflow)) bullets.push(`Total outflow: ${money(outflow)}.`);
  else bullets.push(MISSING);

  if (isFiniteNumber(inflow)) bullets.push(`Total inflow: ${money(inflow)}.`);
  else bullets.push(MISSING);

  if (isFiniteNumber(net)) bullets.push(`Net cashflow: ${money(net)}.`);
  else bullets.push(MISSING);

  if (isFiniteNumber(avgSpend)) bullets.push(`Average spend per spending transaction: ${money(avgSpend)}.`);
  else bullets.push(MISSING);

  if (Array.isArray(topCats) && topCats.length > 0) {
    const parts = topCats.map((c) => `${c.category} (${money(c.spend)})`).filter(Boolean);
    bullets.push(`Top spending categories: ${parts.join(", ")}.`);
  } else {
    bullets.push(MISSING);
  }

  if (typeof flagged === "number") {
    if (flagged === 0) bullets.push("No transactions are currently marked as flagged.");
    else bullets.push(`Flagged transactions: ${flagged}.`);
  } else {
    bullets.push(MISSING);
  }

  if (recentFlaggedTx) {
    bullets.push(
      `Most recent flagged item: ${safeString(recentFlaggedTx.merchant) || "Unknown merchant"} on ${
        safeString(recentFlaggedTx.date) || "Unknown date"
      } (${money(Math.abs(recentFlaggedTx.amount)) || MISSING}).`
    );
  } else {
    // Only show missing phrase if we cannot determine whether a recent flagged item exists.
    // If flagged === 0, we already stated "no flagged"; avoid repeating missing phrase.
    if (typeof flagged !== "number" || flagged > 0) bullets.push(MISSING);
  }

  // Keep within 3–6 items (prefer real signal first).
  return bullets.slice(0, 6);
}

function buildTrends({ topCats, outflow, inflow, net, txCount }) {
  const bullets = [];

  // We do NOT fabricate time series deltas. Keep observations grounded in what exists.
  if (Array.isArray(topCats) && topCats.length > 0) {
    const first = topCats[0];
    if (first && isFiniteNumber(first.spend)) {
      bullets.push(`Spending is concentrated in ${first.category} at ${money(first.spend)} in total spend.`);
    } else {
      bullets.push(MISSING);
    }
  } else {
    bullets.push(MISSING);
  }

  if (isFiniteNumber(inflow) && isFiniteNumber(outflow) && isFiniteNumber(net)) {
    if (net > 0) bullets.push("Overall cashflow is positive in the current dataset.");
    else if (net < 0) bullets.push("Overall cashflow is negative in the current dataset.");
    else bullets.push("Overall cashflow is neutral in the current dataset.");
  } else {
    bullets.push(MISSING);
  }

  if (typeof txCount === "number") {
    bullets.push(`The dashboard is currently summarizing ${txCount} transactions; trends are limited to what’s shown here.`);
  } else {
    bullets.push(MISSING);
  }

  // Keep within 2–5 items.
  return bullets.slice(0, 5);
}

function buildSuggestedQuestions({ topCats, flagged, avgSpend, outflow, net }) {
  const bullets = [];

  if (Array.isArray(topCats) && topCats.length > 0) {
    bullets.push(`What is driving spend in ${topCats[0].category}, and is it expected to continue?`);
  } else {
    bullets.push(MISSING);
  }

  if (typeof flagged === "number") {
    bullets.push(`Which merchants or categories explain the ${flagged} flagged transaction${flagged === 1 ? "" : "s"}?`);
  } else {
    bullets.push(MISSING);
  }

  if (isFiniteNumber(avgSpend)) {
    bullets.push("Are there recurring small purchases that could be consolidated or reduced?");
  } else {
    bullets.push(MISSING);
  }

  if (isFiniteNumber(outflow)) {
    bullets.push("Which categories are the best candidates for a monthly budget target?");
  } else {
    bullets.push(MISSING);
  }

  if (isFiniteNumber(net)) {
    bullets.push("What actions would most improve net cashflow based on the categories shown?");
  } else {
    bullets.push(MISSING);
  }

  // Keep within 3–5 items.
  return bullets.slice(0, 5);
}

// PUBLIC_INTERFACE
export function summarizeDashboard({ transactions, kpis } = {}) {
  /** 
   * Generates a concise, business-friendly summary of the current Dashboard state.
   * Uses only provided values; does not call external services; does not infer unavailable metrics.
   *
   * @param {Object} params
   * @param {Array} params.transactions - Dashboard transactions currently in scope (mock data).
   * @param {Object} params.kpis - Optional precomputed KPIs if the dashboard already computed them.
   * @returns {Object} summary - Structured sections for rendering.
   */
  const tx = Array.isArray(transactions) ? transactions : [];

  const derived = {
    outflow: isFiniteNumber(kpis?.outflow) ? kpis.outflow : sumOutflow(tx),
    inflow: isFiniteNumber(kpis?.inflow) ? kpis.inflow : sumInflow(tx),
    net: isFiniteNumber(kpis?.net) ? kpis.net : (isFiniteNumber(kpis?.inflow) && isFiniteNumber(kpis?.outflow) ? kpis.inflow - kpis.outflow : null),
    flagged: typeof kpis?.flagged === "number" ? kpis.flagged : countFlagged(tx),
    txCount: tx.length,
    avgSpend: avgSpendPerTransaction(tx),
    topCats: topSpendCategories(tx, 3),
    recentFlaggedTx: mostRecentFlagged(tx),
  };

  const overallSummary = buildOverallSummary(derived);
  const keyInsights = buildKeyInsights(derived);
  const trends = buildTrends(derived);
  const questions = buildSuggestedQuestions(derived);

  return {
    overallSummary,
    keyInsights,
    trends,
    questions,
    meta: {
      generatedAt: new Date().toISOString(),
      source: "mock-data",
    },
  };
}

export const DASHBOARD_SUMMARY_MISSING_TEXT = MISSING;
