import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "./Card";
import { answerFromDashboard, DASHBOARD_QA_FALLBACK_TEXT } from "../utils/answerFromDashboard";

function randomDelayMs(min = 200, max = 400) {
  const lo = Math.max(0, Number(min) || 0);
  const hi = Math.max(lo, Number(max) || lo);
  return Math.floor(lo + Math.random() * (hi - lo + 1));
}

// PUBLIC_INTERFACE
export function DashboardQA({ snapshot }) {
  /**
   * Dashboard Q&A assistant panel.
   * - Answers strictly from snapshot (no API calls).
   * - Accessible: labeled input, keyboard submit, aria-live for results.
   */
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

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

  const submit = (e, forcedQuestion) => {
    e?.preventDefault?.();

    // Prefer the forced question (used by suggestion chips) over current state.
    const q = String(forcedQuestion ?? question ?? "").trim();

    // Graceful empty state: show a hint rather than fallback.
    if (!q) {
      setResult(emptyState);
      return;
    }

    setLoading(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const r = answerFromDashboard({ question: q, snapshot });
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
          Tip: Try “top categories”, “largest transactions”, “flagged items”, or “net cashflow”.
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
                {group.questions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className="chip dashQASuggestionChip"
                    role="button"
                    aria-label={`Ask: ${q}`}
                    onClick={() => onPickSuggestion(q)}
                    disabled={loading}
                  >
                    {q}
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
        {!hasAnswer && !loading ? (
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
