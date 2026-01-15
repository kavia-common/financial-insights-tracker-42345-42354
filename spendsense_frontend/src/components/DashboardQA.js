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

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const submit = (e) => {
    e?.preventDefault?.();

    // Graceful empty state: show a hint rather than fallback.
    const q = String(question || "").trim();
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
            id={inputId}
            className="input dashQAInput"
            type="text"
            value={question}
            placeholder='e.g., "What is my monthly outflow?"'
            onChange={(e) => setQuestion(e.target.value)}
            aria-describedby={`${regionId}-hint`}
          />
          <button type="submit" className="btn btnPrimary btnGradient" disabled={loading}>
            {loading ? "Answering…" : "Ask"}
          </button>
        </div>

        <div id={`${regionId}-hint`} className="helper">
          Tip: Try “top categories”, “largest transactions”, “flagged items”, or “net cashflow”.
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
            <div className="dashQAEmptyDesc">Type a question above and press Enter.</div>
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
