import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "./Card";
import {
  answerFromDashboard,
  DASHBOARD_QA_FALLBACK_TEXT,
  getDashboardClarification,
} from "../utils/answerFromDashboard";
import { explainTrend } from "../utils/explainTrend";

function randomDelayMs(min = 200, max = 400) {
  const lo = Math.max(0, Number(min) || 0);
  const hi = Math.max(lo, Number(max) || lo);
  return Math.floor(lo + Math.random() * (hi - lo + 1));
}

function normalizeWhyQuestion(q) {
  // Very small, deterministic normalizer for "why" detection.
  return String(q || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isWhyHappeningQuestion(q) {
  const n = normalizeWhyQuestion(q);

  // Detect common variants (keep conservative to avoid misrouting other questions).
  // Examples handled:
  // - "Why is this happening?"
  // - "why this"
  // - "why is that"
  // - "why is it happening"
  if (!n) return false;

  if (n === "why" || n === "why this" || n === "why that") return true;

  const hasWhy = n.startsWith("why ") || n === "why";
  if (!hasWhy) return false;

  if (n.includes("why is this happening")) return true;
  if (n.includes("why is that happening")) return true;
  if (n.includes("why is it happening")) return true;
  if (n.includes("why is this") || n.includes("why is that") || n.includes("why is it")) return true;

  return false;
}

// PUBLIC_INTERFACE
export function DashboardQA({ snapshot }) {
  /**
   * Dashboard Q&A assistant panel.
   * - Answers strictly from snapshot (no API calls).
   * - Adds "Why is this happening?" flow using only dashboard-visible metrics.
   * - Accessible: labeled input, keyboard submit, aria-live for results.
   */
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Clarification state: used when the user's question is ambiguous or doesn't map to dashboard fields.
  const [clarification, setClarification] = useState(null);
  const firstClarifyChipRef = useRef(null);

  // Remember prior context so a generic "why" can attach to the last discussed metric.
  const [lastContext, setLastContext] = useState(null);

  const timerRef = useRef(null);
  const inputRef = useRef(null);

  const inputId = "dashboard-qa-input";
  const regionId = "dashboard-qa-region";

  const emptyState = useMemo(() => {
    return {
      answer: "Ask a question about what’s shown on this dashboard (e.g., “What is my monthly outflow?”).",
      why: null,
      followUp: "What are my top spending categories?",
      usedFields: [],
    };
  }, []);

  const suggestedGroups = useMemo(() => {
    return [
      {
        title: "Performance-related",
        questions: ["What’s my spending this month vs budget?", "Which category is costing me the most?"],
      },
      {
        title: "Trend analysis",
        questions: ["Are my weekly expenses going up or down?", "Any seasonal spikes this month?"],
      },
      {
        title: "Comparison-based",
        questions: ["How does this month compare to last month?", "Which category changed the most vs last month?"],
      },
      {
        title: "Risk or anomaly detection",
        questions: ["Any unusual or high-risk transactions?", "Did any alerts trigger today?"],
      },
    ];
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const inferContextFromAnswer = (q, r) => {
    // Only store minimal, safe hints. We do not store or infer anything beyond what the snapshot already contains.
    const normalized = String(q || "").toLowerCase();

    // If user mentioned a visible category explicitly, keep it as focus.
    const topCats = snapshot?.tables?.topCategories;
    if (Array.isArray(topCats) && topCats.length > 0) {
      const match = topCats.find((c) => c?.category && normalized.includes(String(c.category).toLowerCase()));
      if (match?.category) {
        return { focus: { type: "category", category: match.category }, fromQuestion: q };
      }
    }

    // If the assistant used certain fields, store a focus hint.
    const used = Array.isArray(r?.usedFields) ? r.usedFields : [];
    if (used.includes("kpis.outflow")) return { focus: { type: "kpi", metric: "outflow" }, fromQuestion: q };
    if (used.includes("kpis.inflow")) return { focus: { type: "kpi", metric: "inflow" }, fromQuestion: q };
    if (used.includes("kpis.net")) return { focus: { type: "kpi", metric: "net" }, fromQuestion: q };
    if (used.includes("series.spendingByDay")) return { focus: { type: "trend", metric: "spendingByDay" }, fromQuestion: q };

    return null;
  };

  const submit = (e, forcedQuestion) => {
    e?.preventDefault?.();

    // Prefer the forced question (used by suggestion chips) over current state.
    const q = String(forcedQuestion ?? question ?? "").trim();

    // Reset clarification on new attempt (unit-friendly state transition).
    setClarification(null);

    // Graceful empty state: show a hint rather than fallback.
    if (!q) {
      setResult(emptyState);
      return;
    }

    setLoading(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      // Keep "Why is this happening?" behavior intact and do not block it with clarification logic.
      if (isWhyHappeningQuestion(q)) {
        const r = explainTrend({ snapshot, context: lastContext });
        setResult(r);
        setLoading(false);
        return;
      }

      const r = answerFromDashboard({ question: q, snapshot });

      // Minimal unclear-intent detection: if mapping fails, ask a clarifying question instead of answering.
      const clarificationCandidate = getDashboardClarification({
        question: q,
        snapshot,
        suggestionPool: suggestedGroups.map((g) => g.questions),
        mappedAnswerText: r?.answer,
      });

      if (clarificationCandidate?.isUnclear) {
        setResult(null); // Do not show any answer content for unclear queries.
        setClarification(clarificationCandidate);
        setLoading(false);
        return;
      }

      const inferred = inferContextFromAnswer(q, r);
      if (inferred) setLastContext(inferred);

      setResult(r);
      setLoading(false);
    }, randomDelayMs(200, 400));
  };

  const onPickSuggestion = (q) => {
    // Fill the input for transparency, keep focus for keyboard users, then submit.
    setQuestion(q);
    // Focus synchronously; state update doesn't need to finish for submission.
    inputRef.current?.focus?.();
    submit(null, q);
  };

  useEffect(() => {
    if (clarification?.isUnclear) {
      // Accessibility: move focus to the first suggestion chip so keyboard users can proceed quickly.
      firstClarifyChipRef.current?.focus?.();
    }
  }, [clarification]);

  const hasAnswer = Boolean(result?.answer);
  const isFallback = result?.answer === DASHBOARD_QA_FALLBACK_TEXT;

  return (
    <Card title="Ask the dashboard" subtitle="Get quick answers from the data currently shown">
      <form className="dashQAForm" onSubmit={submit} aria-label="Ask the dashboard form">
        <label className="label" htmlFor={inputId}>
          Ask a question
        </label>

        <div className="dashQARow">
          <input
            ref={inputRef}
            id={inputId}
            className="input dashQAInput"
            type="text"
            value={question}
            placeholder='e.g., "What is my monthly outflow?"'
            onChange={(e) => setQuestion(e.target.value)}
            aria-describedby={`${regionId}-hint ${regionId}-suggestions`}
          />
          <button type="submit" className="btn btnPrimary btnGradient" disabled={loading}>
            {loading ? "Answering…" : "Ask"}
          </button>
        </div>

        <div id={`${regionId}-hint`} className="helper">
          Tip: Try “top categories”, “largest transactions”, “flagged items”, “net cashflow”, or “Why is this happening?”.
        </div>

        <div
          id={`${regionId}-suggestions`}
          className="dashQASuggestions"
          aria-label="Suggested questions"
        >
          {suggestedGroups.map((group) => (
            <div key={group.title} className="dashQASuggestionGroup">
              <div className="dashQASuggestionTitle">{group.title}</div>
              <div className="dashQASuggestionChips">
                {group.questions.map((sq) => (
                  <button
                    key={sq}
                    type="button"
                    className="chip dashQASuggestionChip"
                    role="button"
                    aria-label={`Ask: ${sq}`}
                    onClick={() => onPickSuggestion(sq)}
                    disabled={loading}
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </form>

      <div
        id={regionId}
        className="dashQAResult"
        role="region"
        aria-label="Dashboard answer"
        aria-live="polite"
      >
        {!hasAnswer && !loading && !clarification ? (
          <div className="dashQAEmpty">
            <div className="dashQAEmptyTitle">No question yet</div>
            <div className="dashQAEmptyDesc">Type a question above and press Enter, or pick a suggestion.</div>
          </div>
        ) : null}

        {loading ? (
          <div className="dashQALoading">
            <div className="skeleton skeletonMuted" style={{ height: 14, width: "72%", borderRadius: 10 }} />
            <div style={{ height: 10 }} />
            <div className="skeleton skeletonMuted" style={{ height: 12, width: "92%", borderRadius: 10 }} />
          </div>
        ) : null}

        {!loading && clarification?.isUnclear ? (
          <div className="dashQAAnswerWrap">
            <div className="dashQAAnswer" aria-live="polite">
              {clarification.prompt}
            </div>

            <div className="dashQASuggestions" aria-label="Example questions">
              <div className="dashQASuggestionGroup">
                <div className="dashQASuggestionTitle">Examples</div>
                <div className="dashQASuggestionChips">
                  {clarification.suggestions.slice(0, 2).map((sq, idx) => (
                    <button
                      key={sq}
                      ref={idx === 0 ? firstClarifyChipRef : null}
                      type="button"
                      className="chip dashQASuggestionChip"
                      role="button"
                      aria-label={`Ask: ${sq}`}
                      onClick={() => onPickSuggestion(sq)}
                      disabled={loading}
                    >
                      {sq}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {!loading && hasAnswer ? (
          <div className="dashQAAnswerWrap">
            <div className={`dashQAAnswer ${isFallback ? "dashQAAnswerMuted" : ""}`}>
              {result.answer.split("\n").map((line, idx) => (
                <div key={String(idx)}>{line}</div>
              ))}
            </div>

            {Array.isArray(result.why) && result.why.length > 0 ? (
              <div className="dashQAWhy">
                <div className="dashQASubTitle">Why</div>
                <ul className="dashQAList">
                  {result.why.map((w, idx) => (
                    <li key={String(idx)}>{w}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {result.followUp ? (
              <div className="dashQAFollowUp">
                <div className="dashQASubTitle">Suggested follow-up</div>
                <div className="dashQAFollowUpText">{result.followUp}</div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
