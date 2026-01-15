const FALLBACK = "This data is not available in the current dashboard.";

function isFiniteNumber(n) {
  return typeof n === "number" && Number.isFinite(n);
}

function money(amount) {
  if (!isFiniteNumber(amount)) return null;
  return `$${amount.toFixed(2)}`;
}

function pct(x) {
  if (!isFiniteNumber(x)) return null;
  return `${(x * 100).toFixed(1)}%`;
}

function normalizeQuestion(q) {
  return String(q || "")
    .toLowerCase()
    .replace(/[^\w\s&%$.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(text, words) {
  return words.some((w) => text.includes(w));
}

function hasAll(text, words) {
  return words.every((w) => text.includes(w));
}

function safeTopCategory(snapshot) {
  const rows = snapshot?.tables?.topCategories;
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const first = rows[0];
  if (!first || !first.category || !isFiniteNumber(first.spend)) return null;
  return first;
}

function seriesTrendWhy(spendingByDay) {
  // Very conservative: only talk about up/down between the last 2 available points.
  // If there aren't at least 2 points, we do not fabricate a "why".
  if (!Array.isArray(spendingByDay) || spendingByDay.length < 2) return null;
  const last = spendingByDay[spendingByDay.length - 1];
  const prev = spendingByDay[spendingByDay.length - 2];
  if (!last || !prev || !isFiniteNumber(last.outflow) || !isFiniteNumber(prev.outflow)) return null;

  const delta = last.outflow - prev.outflow;
  if (delta === 0) return ["Daily spend is flat versus the previous day (based on transactions shown)."];

  const dir = delta > 0 ? "up" : "down";
  return [
    `Daily spend is ${dir} versus the previous day (${money(prev.outflow)} → ${money(last.outflow)}).`,
  ];
}

// PUBLIC_INTERFACE
export function answerFromDashboard({ question, snapshot } = {}) {
  /**
   * Answers user questions strictly using the provided dashboard snapshot.
   * Deterministic, local-only heuristics: no API calls, no speculation.
   *
   * Contract:
   * - If the question can't be mapped to a snapshot field, return the fallback string EXACTLY.
   * - Return short, business-friendly copy; bullets where useful.
   *
   * @param {Object} params
   * @param {string} params.question - free-text question from user
   * @param {Object} params.snapshot - output of buildDashboardSnapshot()
   * @returns {{answer: string, why?: string[]|null, followUp: string, usedFields: string[]}}
   */
  const q = normalizeQuestion(question);
  const usedFields = [];

  if (!q) {
    return {
      answer: "Ask a question about the metrics shown on this dashboard (e.g., “What is my monthly outflow?”).",
      why: null,
      followUp: "What are my top spending categories?",
      usedFields,
    };
  }

  const outflow = snapshot?.kpis?.outflow;
  const inflow = snapshot?.kpis?.inflow;
  const net = snapshot?.kpis?.net;
  const flagged = snapshot?.kpis?.flagged;
  const avgSpend = snapshot?.kpis?.avgSpend;

  const topCats = snapshot?.tables?.topCategories;
  const largestSpends = snapshot?.tables?.largestSpends;
  const spendingByDay = snapshot?.series?.spendingByDay;

  const askOutflow =
    includesAny(q, ["outflow", "spend", "spending", "expenses", "expense"]) &&
    !includesAny(q, ["inflow", "income", "net", "cashflow", "cash flow"]) &&
    !includesAny(q, ["average", "avg", "per transaction", "per txn"]);

  const askInflow = includesAny(q, ["inflow", "income", "payroll"]);
  const askNet = includesAny(q, ["net", "cashflow", "cash flow"]);
  const askFlagged = includesAny(q, ["flagged", "flag", "alerts", "alert"]);
  const askAverage =
    includesAny(q, ["average", "avg"]) &&
    includesAny(q, ["spend", "spending", "transaction", "txn", "purchase"]);

  const askTopCategories =
    includesAny(q, ["top", "largest", "biggest", "highest"]) &&
    includesAny(q, ["category", "categories", "mix", "breakdown", "share"]);

  const askCategoryShare =
    includesAny(q, ["share", "percent", "percentage", "%"]) &&
    includesAny(q, ["category", "categories"]) &&
    !includesAny(q, ["trend"]);

  const askLargestTransactions =
    includesAny(q, ["largest", "biggest", "highest"]) &&
    includesAny(q, ["transaction", "transactions", "purchases", "spend"]);

  const askTrend =
    includesAny(q, ["trend", "trending", "over time"]) ||
    hasAll(q, ["spending", "trend"]) ||
    hasAll(q, ["spend", "trend"]);

  // 1) Flagged items
  if (askFlagged) {
    usedFields.push("kpis.flagged");
    if (typeof flagged !== "number") {
      return { answer: FALLBACK, why: null, followUp: "What are the largest transactions?", usedFields };
    }
    const answer =
      flagged === 0
        ? "There are 0 flagged items in the dashboard dataset."
        : `There ${flagged === 1 ? "is" : "are"} ${flagged} flagged item${flagged === 1 ? "" : "s"} in the dashboard dataset.`;

    return {
      answer,
      why: null,
      followUp: "What is my monthly outflow?",
      usedFields,
    };
  }

  // 2) KPI: outflow / spend
  if (askOutflow) {
    usedFields.push("kpis.outflow");
    if (!isFiniteNumber(outflow)) {
      return { answer: FALLBACK, why: null, followUp: "What are my top spending categories?", usedFields };
    }
    return {
      answer: `Monthly outflow is ${money(outflow)} in the current dashboard dataset.`,
      why: null,
      followUp: "Which categories are driving that outflow?",
      usedFields,
    };
  }

  // 3) KPI: inflow / income
  if (askInflow) {
    usedFields.push("kpis.inflow");
    if (!isFiniteNumber(inflow)) {
      return { answer: FALLBACK, why: null, followUp: "What is my net cashflow?", usedFields };
    }
    return {
      answer: `Monthly inflow is ${money(inflow)} in the current dashboard dataset.`,
      why: null,
      followUp: "What is my net cashflow?",
      usedFields,
    };
  }

  // 4) KPI: net cashflow
  if (askNet) {
    usedFields.push("kpis.net");
    if (!isFiniteNumber(net)) {
      return { answer: FALLBACK, why: null, followUp: "What is my monthly outflow?", usedFields };
    }
    const direction = net > 0 ? "positive" : net < 0 ? "negative" : "neutral";
    return {
      answer: `Net cashflow is ${money(net)} (${direction}) in the current dashboard dataset.`,
      why: null,
      followUp: "How does my outflow compare to my inflow?",
      usedFields,
    };
  }

  // 5) KPI: average spend per spending transaction
  if (askAverage) {
    usedFields.push("kpis.avgSpend");
    if (!isFiniteNumber(avgSpend)) {
      return { answer: FALLBACK, why: null, followUp: "What are my largest transactions?", usedFields };
    }
    return {
      answer: `Average spend per spending transaction is ${money(avgSpend)} (based on the transactions shown).`,
      why: null,
      followUp: "What are my largest spending transactions?",
      usedFields,
    };
  }

  // 6) Top categories (absolute)
  if (askTopCategories) {
    usedFields.push("tables.topCategories");
    if (!Array.isArray(topCats) || topCats.length === 0) {
      return { answer: FALLBACK, why: null, followUp: "What is my monthly outflow?", usedFields };
    }
    const top = safeTopCategory(snapshot);
    if (!top) {
      return { answer: FALLBACK, why: null, followUp: "What is my monthly outflow?", usedFields };
    }
    const lines = topCats
      .slice(0, 3)
      .filter((r) => r && r.category && isFiniteNumber(r.spend))
      .map((r) => `${r.category}: ${money(r.spend)}`);

    if (lines.length === 0) {
      return { answer: FALLBACK, why: null, followUp: "What is my monthly outflow?", usedFields };
    }

    return {
      answer: `Top spending categories (by total spend):\n- ${lines.join("\n- ")}`,
      why: null,
      followUp: `What share of my outflow is ${top.category}?`,
      usedFields,
    };
  }

  // 7) Category share (compute from outflow + topCategories; only if category exists in snapshot)
  if (askCategoryShare) {
    usedFields.push("tables.topCategories", "kpis.outflow");

    if (!isFiniteNumber(outflow) || !Array.isArray(topCats) || topCats.length === 0) {
      return { answer: FALLBACK, why: null, followUp: "What are my top spending categories?", usedFields };
    }

    // Try to match a category name mentioned in the question.
    const mentioned = topCats.find((r) => r?.category && q.includes(String(r.category).toLowerCase()));
    if (!mentioned || !isFiniteNumber(mentioned.spend) || outflow <= 0) {
      return { answer: FALLBACK, why: null, followUp: "What are my top spending categories?", usedFields };
    }

    const share = mentioned.spend / outflow;
    return {
      answer: `${mentioned.category} is ${pct(share)} of total outflow (${money(mentioned.spend)} out of ${money(outflow)}).`,
      why: null,
      followUp: `What are the largest transactions in ${mentioned.category}?`,
      usedFields,
    };
  }

  // 8) Largest transactions
  if (askLargestTransactions) {
    usedFields.push("tables.largestSpends");
    if (!Array.isArray(largestSpends) || largestSpends.length === 0) {
      return { answer: FALLBACK, why: null, followUp: "What are my top spending categories?", usedFields };
    }
    const top = largestSpends[0];
    if (!top || !top.merchant || !isFiniteNumber(top.absAmount)) {
      return { answer: FALLBACK, why: null, followUp: "What are my top spending categories?", usedFields };
    }

    const lines = largestSpends
      .slice(0, 3)
      .filter((t) => t && t.merchant && isFiniteNumber(t.absAmount) && t.date)
      .map((t) => `${t.merchant} (${t.date}): ${money(t.absAmount)}`);

    if (lines.length === 0) {
      return { answer: FALLBACK, why: null, followUp: "What is my monthly outflow?", usedFields };
    }

    return {
      answer: `Largest spending transactions:\n- ${lines.join("\n- ")}`,
      why: null,
      followUp: "Are any of these transactions flagged?",
      usedFields,
    };
  }

  // 9) Trend (very conservative: last two day points only)
  if (askTrend) {
    usedFields.push("series.spendingByDay");
    const why = seriesTrendWhy(spendingByDay);
    if (!why) {
      // No reliable trend points to talk about.
      return { answer: FALLBACK, why: null, followUp: "What is my monthly outflow?", usedFields };
    }
    return {
      answer: "Based on the transactions shown, here is the most recent spending movement:",
      why,
      followUp: "What are my top spending categories?",
      usedFields,
    };
  }

  // If we get here, we couldn't map the question to dashboard-visible data.
  return {
    answer: FALLBACK,
    why: null,
    followUp: "What is my monthly outflow?",
    usedFields,
  };
}

export const DASHBOARD_QA_FALLBACK_TEXT = FALLBACK;
