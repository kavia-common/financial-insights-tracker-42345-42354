function isFiniteNumber(n) {
  return typeof n === "number" && Number.isFinite(n);
}

function money(amount) {
  if (!isFiniteNumber(amount)) return null;
  return `$${amount.toFixed(2)}`;
}

function safeText(s) {
  const v = String(s ?? "").trim();
  return v ? v : null;
}

/**
 * Builds a short phrase describing the net position without technical jargon.
 * Returns null if not determinable.
 */
function netPosition(net) {
  if (!isFiniteNumber(net)) return null;
  if (net > 0) return "cash-positive";
  if (net < 0) return "cash-negative";
  return "break-even";
}

/**
 * Ensures we never exceed 6 bullets and we never add empty/null bullets.
 */
function finalizeBullets(bullets, max = 6) {
  const cleaned = bullets.map((b) => safeText(b)).filter(Boolean);
  // De-dupe exact matches while preserving order.
  const seen = new Set();
  const unique = [];
  for (const b of cleaned) {
    if (seen.has(b)) continue;
    seen.add(b);
    unique.push(b);
  }
  return unique.slice(0, max);
}

/**
 * Picks the most obvious “driver” using on-screen snapshot tables only.
 * Returns { category, spend } or null.
 */
function topCategory(snapshot) {
  const rows = snapshot?.tables?.topCategories;
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const first = rows[0];
  if (!first || !safeText(first.category) || !isFiniteNumber(first.spend)) return null;
  return { category: String(first.category), spend: first.spend };
}

/**
 * Returns the largest spending transaction from snapshot tables (already derived from dashboard-visible transactions).
 * Returns { merchant, absAmount, date, status } or null.
 */
function largestSpend(snapshot) {
  const rows = snapshot?.tables?.largestSpends;
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const first = rows[0];
  if (!first) return null;

  // snapshot.largestSpends includes {absAmount} from snapshot builder.
  const merchant = safeText(first.merchant) || "Unknown merchant";
  const absAmount = isFiniteNumber(first.absAmount) ? first.absAmount : null;
  const date = safeText(first.date);
  const status = safeText(first.status);

  if (!absAmount) return null;
  return { merchant, absAmount, date, status };
}

// PUBLIC_INTERFACE
export function generateExecutiveSummary(snapshot) {
  /**
   * Generates an executive-level summary (max 6 bullets) based strictly on the
   * dashboard snapshot (buildDashboardSnapshot output).
   *
   * Requirements:
   * - Business-friendly, non-technical language
   * - Focus on business impact, outcomes, risks/opportunities
   * - Use ONLY on-screen data from snapshot; if missing, omit (no guessing)
   *
   * @param {Object} snapshot - output of buildDashboardSnapshot()
   * @returns {string[]} up to 6 bullet points
   */
  const bullets = [];

  const outflow = snapshot?.kpis?.outflow;
  const inflow = snapshot?.kpis?.inflow;
  const net = snapshot?.kpis?.net;
  const flagged = snapshot?.kpis?.flagged;

  const txCount = snapshot?.meta?.txCount;

  // 1) Business impact: overall cash position (only if we have the numbers)
  if (isFiniteNumber(inflow) && isFiniteNumber(outflow) && isFiniteNumber(net)) {
    const position = netPosition(net);
    bullets.push(
      `Current view shows ${position} results: ${money(inflow)} in inflows vs ${money(outflow)} in outflows (net ${money(net)}).`
    );
  }

  // 2) Key outcome: spending concentration (category driver)
  const topCat = topCategory(snapshot);
  if (topCat) {
    bullets.push(`Spending is concentrated in ${topCat.category} (${money(topCat.spend)} total in this view).`);
  }

  // 3) Risk: flagged activity
  if (typeof flagged === "number") {
    if (flagged === 0) {
      // This is still useful to execs (risk signal = none in view).
      bullets.push("No transactions are flagged in the current view.");
    } else {
      bullets.push(`There ${flagged === 1 ? "is" : "are"} ${flagged} flagged transaction${flagged === 1 ? "" : "s"} to review.`);
    }
  }

  // 4) Risk/opportunity: single largest spend callout (only if determinable)
  const largest = largestSpend(snapshot);
  if (largest) {
    const flaggedNote = largest.status === "Flagged" ? " (flagged)" : "";
    const datePart = largest.date ? ` on ${largest.date}` : "";
    bullets.push(`Largest single spend is ${money(largest.absAmount)} at ${largest.merchant}${datePart}${flaggedNote}.`);
  }

  // 5) Context: data coverage (avoid “statistics”; keep as scope/coverage)
  if (typeof txCount === "number") {
    bullets.push(`Summary reflects ${txCount} transaction${txCount === 1 ? "" : "s"} currently shown in the dashboard.`);
  }

  // 6) Opportunity framing (only if we have enough signal to say something concrete)
  // Keep conservative: if top category exists, suggest focus area; otherwise omit.
  if (topCat) {
    bullets.push(`Opportunity: focus near-term spend control on ${topCat.category}, since it is the top cost driver in this view.`);
  }

  return finalizeBullets(bullets, 6);
}
