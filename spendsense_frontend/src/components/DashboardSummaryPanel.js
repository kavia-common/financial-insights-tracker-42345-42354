import React, { useEffect, useMemo, useRef } from "react";

function firstFocusable(container) {
  if (!container) return null;
  const el = container.querySelector(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  return el || null;
}

function focusableElements(container) {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
}

// PUBLIC_INTERFACE
export function DashboardSummaryPanel({ open, loading, summary, onClose }) {
  /**
   * Right-side drawer panel that displays the dashboard summary sections.
   * Accessibility:
   * - role="dialog" with aria-modal
   * - focus trap inside panel
   * - ESC closes
   */
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const titleId = useMemo(() => `dash-summary-title-${Math.random().toString(16).slice(2)}`, []);

  useEffect(() => {
    if (!open) return undefined;

    const prevActive = document.activeElement;
    // Slight delay so the panel is mounted before focusing.
    const t = setTimeout(() => {
      const el = firstFocusable(panelRef.current);
      el?.focus?.();
    }, 0);

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
        return;
      }

      if (e.key !== "Tab") return;

      const items = focusableElements(panelRef.current);
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || !panelRef.current.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      // Restore focus for keyboard users
      prevActive?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const overall = Array.isArray(summary?.overallSummary) ? summary.overallSummary : [];
  const insights = Array.isArray(summary?.keyInsights) ? summary.keyInsights : [];
  const trends = Array.isArray(summary?.trends) ? summary.trends : [];
  const questions = Array.isArray(summary?.questions) ? summary.questions : [];

  return (
    <div
      className="dashSummaryOverlay"
      ref={overlayRef}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose?.();
      }}
    >
      <section
        className="dashSummaryPanel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-label="Dashboard summary"
      >
        <header className="dashSummaryHeader">
          <div>
            <div className="dashSummaryKicker">AI Assistant</div>
            <h2 id={titleId} className="dashSummaryTitle">
              Dashboard Summary
            </h2>
            <div className="dashSummarySub">Based on the dashboard’s current mock data.</div>
          </div>

          <div className="dashSummaryHeaderActions">
            <button type="button" className="btn btnGhost" onClick={onClose} aria-label="Close dashboard summary">
              Close
            </button>
          </div>
        </header>

        <div className="dashSummaryBody" aria-busy={loading ? "true" : "false"}>
          {loading ? (
            <div className="dashSummaryLoading" role="status" aria-label="Generating summary">
              <div className="skeleton" style={{ width: "70%", height: 14, borderRadius: 10 }} />
              <div style={{ height: 10 }} />
              <div className="skeleton" style={{ width: "92%", height: 14, borderRadius: 10 }} />
              <div style={{ height: 10 }} />
              <div className="skeleton" style={{ width: "84%", height: 14, borderRadius: 10 }} />
              <div style={{ height: 18 }} />
              <div className="skeleton" style={{ width: "56%", height: 14, borderRadius: 10 }} />
              <div style={{ height: 10 }} />
              <div className="skeleton" style={{ width: "90%", height: 120, borderRadius: 16 }} />
              <div style={{ height: 12 }} />
              <div style={{ color: "rgba(17,24,39,0.65)", fontSize: 12 }}>
                Generating summary…
              </div>
            </div>
          ) : (
            <>
              <section className="dashSummarySection" aria-label="Overall Summary section">
                <h3 className="dashSummarySectionTitle">Overall Summary</h3>
                <div className="dashSummaryParagraph">
                  {overall.length > 0 ? (
                    overall.map((line, idx) => (
                      <p key={idx} style={{ margin: idx === 0 ? 0 : "10px 0 0 0" }}>
                        {line}
                      </p>
                    ))
                  ) : (
                    <p style={{ margin: 0 }}>This information is not available in the dashboard.</p>
                  )}
                </div>
              </section>

              <section className="dashSummarySection" aria-label="Key Insights section">
                <h3 className="dashSummarySectionTitle">Key Insights</h3>
                <ul className="dashSummaryList">
                  {(insights.length > 0 ? insights : ["This information is not available in the dashboard."]).map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </section>

              <section className="dashSummarySection" aria-label="Trends and observations section">
                <h3 className="dashSummarySectionTitle">Trends &amp; Observations</h3>
                <ul className="dashSummaryList">
                  {(trends.length > 0 ? trends : ["This information is not available in the dashboard."]).map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </section>

              <section className="dashSummarySection" aria-label="Suggested Questions section">
                <h3 className="dashSummarySectionTitle">Suggested Questions for Deeper Analysis</h3>
                <ul className="dashSummaryList">
                  {(questions.length > 0 ? questions : ["This information is not available in the dashboard."]).map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
