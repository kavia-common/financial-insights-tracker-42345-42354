const FALLBACK = "This data is not available in the current dashboard.";

function isFiniteNumber(n) {
  return typeof n === "number" && Number.isFinite(n);
}

function money(amount) {
  if (!isFiniteNumber(amount)) return null;
  return `$${amount.toFixed(2)}`;
}

function pctFromDelta(curr, prev) {
  if (!isFiniteNumber(curr) || !isFiniteNumber(prev) || prev === 0) return null;
  return ((curr - prev) / prev) * 100;
}

function safeStr(v) {
  const s = String(v ?? "").trim();
  return s ? s : null;
}

function normalizeText(q) {
  return String(q || "")
    .toLowerCase()
    .replace(/[^\w\s&%$.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inferFocusFromQuestion(q, snapshot) {
  const nq = normalizeText(q);

  // Category focus: if the question mentions a category name that's visible in topCategories
  const rows = snapshot?.tables?.topCategories;
  if (Array.isArray(rows) && rows.length > 0) {
    const match = rows.find((r) => r?.category && nq.includes(String(r.category).toLowerCase()));
    if (match?.category) {
      return { type: "category", category: match.category };
    }
  }

  // Metric focus: basic mapping
  if (nq.includes("outflow") || nq.includes("spend") || nq.includes("spending") || nq.includes("expenses")) {
    return { type: "kpi", metric: "outflow" };
  }
  if (nq.includes("inflow") || nq.includes("income")) {
    return { type: "kpi", metric: "inflow" };
  }
  if (nq.includes("net") || nq.includes("cashflow") || nq.includes("cash flow")) {
    return { type: "kpi", metric: "net" };
  }

  // Trend focus
  if (nq.includes("trend") || nq.includes("over time") || nq.includes("going up") || nq.includes("going down")) {
    return { type: "trend", metric: "spendingByDay" };
  }

  return null;
}

function inferMostNotableTrend(snapshot) {
  // Only use what snapshot exposes:
  // - series.spendingByDay: last two points delta
  // - tables.topCategories: concentration (not a delta, but can be a "driver")
  const series = snapshot?.series?.spendingByDay;
  if (Array.isArray(series) && series.length >= 2) {
    const last = series[series.length - 1];
    const prev = series[series.length - 2];
    if (last && prev && isFiniteNumber(last.outflow) && isFiniteNumber(prev.outflow) && last.date && prev.date) {
      const absDelta = Math.abs(last.outflow - prev.outflow);
      // Prefer series delta when it exists; it's the only true change metric in snapshot.
      return { type: "trend", metric: "spendingByDay", last, prev, absDelta };
    }
  }

  const topCats = snapshot?.tables?.topCategories;
  if (Array.isArray(topCats) && topCats.length > 0) {
    const first = topCats[0];
    if (first?.category && isFiniteNumber(first.spend)) {
      return { type: "categoryConcentration", category: first.category, spend: first.spend };
    }
  }

  return null;
}

function buildContributorsFromLargestSpends(snapshot, maxItems = 3) {
  const txs = snapshot?.tables?.largestSpends;
  if (!Array.isArray(txs) || txs.length === 0) return null;

  const lines = txs
    .slice(0, maxItems)
    .filter((t) => t && safeStr(t.merchant) && safeStr(t.date) && isFiniteNumber(t.absAmount))
    .map((t) => `${t.merchant} (${t.date}): ${money(t.absAmount)}`);

  return lines.length > 0 ? lines : null;
}

// PUBLIC_INTERFACE
export function explainTrend({ snapshot, context } = {}) {
  /**
   * Builds a short, non-technical “Why is this happening?” explanation strictly from the current dashboard snapshot.
   * Safety rules:
   * - Uses only fields present in snapshot.
   * - If required fields are missing, returns the fallback string EXACTLY.
   *
   * @param {Object} params
   * @param {Object} params.snapshot - output of buildDashboardSnapshot()
   * @param {Object} [params.context] - optional context about what the user was asking about previously
   * @returns {{answer: string, why?: string[]|null, followUp: string, usedFields: string[]}}
   */
  const usedFields = [];

  if (!snapshot) {
    return { answer: FALLBACK, why: null, followUp: "Do you want to see your top spending categories?", usedFields };
  }

  const focus = context?.focus || inferMostNotableTrend(snapshot);
  if (!focus) {
    return { answer: FALLBACK, why: null, followUp: "Do you want to see your top spending categories?", usedFields };
  }

  // 1) Daily spending movement (last point vs previous point)
  if (focus.type === "trend" && focus.metric === "spendingByDay") {
    // If focus came from inferMostNotableTrend() it has last/prev embedded; otherwise recompute.
    const series = snapshot?.series?.spendingByDay;
    usedFields.push("series.spendingByDay");

    if (!Array.isArray(series) || series.length < 2) {
      return { answer: FALLBACK, why: null, followUp: "Do you want to see your top spending categories?", usedFields };
    }

    const last = focus.last || series[series.length - 1];
    const prev = focus.prev || series[series.length - 2];

    if (
      !last ||
      !prev ||
      !safeStr(last.date) ||
      !safeStr(prev.date) ||
      !isFiniteNumber(last.outflow) ||
      !isFiniteNumber(prev.outflow)
    ) {
      return { answer: FALLBACK, why: null, followUp: "Do you want to see your top spending categories?", usedFields };
    }

    const delta = last.outflow - prev.outflow;
    const direction = delta > 0 ? "increased" : delta < 0 ? "decreased" : "stayed flat";
    const pct = pctFromDelta(last.outflow, prev.outflow);

    const pctPart = pct === null ? "" : ` (${Math.abs(pct).toFixed(1)}%)`;
    const main = `Spending ${direction} from ${prev.date} to ${last.date} (${money(prev.outflow)} → ${money(
      last.outflow
    )})${pctPart}.`;

    // Optional contributors: use largest transactions as a conservative “contributors shown”
    // Note: This does NOT claim causality, only highlights large spends present in the snapshot.
    const contributors = buildContributorsFromLargestSpends(snapshot, 3);
    if (contributors) usedFields.push("tables.largestSpends");

    const why = contributors ? contributors.map((c) => `One of the largest spends shown is: ${c}.`) : null;

    return {
      answer: main,
      why,
      followUp: "Do you want to see which merchants contributed most?",
      usedFields,
    };
  }

  // 2) Category concentration (no time delta available; explain “what’s driving spend”)
  if (focus.type === "categoryConcentration") {
    usedFields.push("tables.topCategories", "kpis.outflow");

    const topCats = snapshot?.tables?.topCategories;
    const outflow = snapshot?.kpis?.outflow;

    if (!Array.isArray(topCats) || topCats.length === 0 || !isFiniteNumber(outflow) || outflow <= 0) {
      return { answer: FALLBACK, why: null, followUp: "Do you want to see your top spending categories?", usedFields };
    }

    const first = topCats[0];
    if (!first?.category || !isFiniteNumber(first.spend)) {
      return { answer: FALLBACK, why: null, followUp: "Do you want to see your top spending categories?", usedFields };
    }

    // Find 2–3 biggest categories as plausible contributors (still non-causal wording).
    const top = topCats
      .slice(0, 3)
      .filter((r) => r?.category && isFiniteNumber(r.spend))
      .map((r) => ({ category: r.category, spend: r.spend, share: r.spend / outflow }))
      .sort((a, b) => b.spend - a.spend);

    if (top.length === 0) {
      return { answer: FALLBACK, why: null, followUp: "Do you want to see your top spending categories?", usedFields };
    }

    const main = `${top[0].category} is the largest spending category in the current dashboard (${money(
      top[0].spend
    )} of ${money(outflow)} total outflow).`;

    const why =
      top.length >= 2
        ? top
            .slice(1, 3)
            .map((r) => `${r.category} is also significant at ${money(r.spend)} (${(r.share * 100).toFixed(1)}%).`)
        : null;

    return {
      answer: main,
      why,
      followUp: `Do you want to see the largest transactions in ${top[0].category}?`,
      usedFields,
    };
  }

  // 3) Specific category (mentioned by user) — we can only restate its visible spend and (optionally) largest tx list
  if (focus.type === "category") {
    usedFields.push("tables.topCategories");

    const topCats = snapshot?.tables?.topCategories;
    if (!Array.isArray(topCats) || topCats.length === 0) {
      return { answer: FALLBACK, why: null, followUp: "Do you want to see your top spending categories?", usedFields };
    }

    const row = topCats.find((r) => r?.category === focus.category);
    if (!row?.category || !isFiniteNumber(row.spend)) {
      return { answer: FALLBACK, why: null, followUp: "Do you want to see your top spending categories?", usedFields };
    }

    const main = `In the current dashboard dataset, ${row.category} totals ${money(row.spend)} in spend.`;

    // Additional context from largest spends that match the category (if available in snapshot list)
    const txs = snapshot?.tables?.largestSpends;
    if (!Array.isArray(txs)) {
      return {
        answer: main,
        why: null,
        followUp: `Do you want to see the largest transactions in ${row.category}?`,
        usedFields,
      };
    }
    usedFields.push("tables.largestSpends");

    const categoryTx = txs
      .filter((t) => String(t.category || "") === row.category && isFiniteNumber(t.absAmount) && safeStr(t.merchant))
      .slice(0, 3)
      .map((t) => `${t.merchant} (${t.date}): ${money(t.absAmount)}`);

    const why =
      categoryTx.length > 0 ? categoryTx.map((c) => `One of the largest ${row.category} spends shown is: ${c}.`) : null;

    return {
      answer: main,
      why,
      followUp: "Do you want to see which days had the highest spending?",
      usedFields,
    };
  }

  // If focus exists but isn't supported, don't guess.
  return { answer: FALLBACK, why: null, followUp: "Do you want to see your top spending categories?", usedFields };
}
