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
export function ExecutiveSummaryPanel({ open, loading, bullets, onClose }) {
  /**
   * Right-side drawer panel that displays an executive summary (max 6 bullets).
   * Accessibility:
   * - role="dialog" with aria-modal
   * - focus trap
   * - ESC closes
   */
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const titleId = useMemo(() => `exec-summary-title-${Math.random().toString(16).slice(2)}`, []);

  useEffect(() => {
    if (!open) return undefined;

    const prevActive = document.activeElement;
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
      prevActive?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const items = Array.isArray(bullets) ? bullets : [];

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
        aria-label="Executive summary"
      >
        <header className="dashSummaryHeader">
          <div>
            <div className="dashSummaryKicker">Management View</div>
            <h2 id={titleId} className="dashSummaryTitle">
              Executive Summary
            </h2>
            <div className="dashSummarySub">Business-focused highlights based on what’s currently shown.</div>
          </div>

          <div className="dashSummaryHeaderActions">
            <button type="button" className="btn btnGhost" onClick={onClose} aria-label="Close executive summary">
              Close
            </button>
          </div>
        </header>

        <div className="dashSummaryBody" aria-busy={loading ? "true" : "false"}>
          {loading ? (
            <div className="dashSummaryLoading" role="status" aria-label="Generating executive summary">
              <div className="skeleton" style={{ width: "68%", height: 14, borderRadius: 10 }} />
              <div style={{ height: 10 }} />
              <div className="skeleton" style={{ width: "90%", height: 14, borderRadius: 10 }} />
              <div style={{ height: 10 }} />
              <div className="skeleton" style={{ width: "82%", height: 14, borderRadius: 10 }} />
              <div style={{ height: 10 }} />
              <div className="skeleton" style={{ width: "76%", height: 14, borderRadius: 10 }} />
              <div style={{ height: 18 }} />
              <div style={{ color: "rgba(17,24,39,0.65)", fontSize: 12 }}>Generating executive summary…</div>
            </div>
          ) : (
            <section className="dashSummarySection" aria-label="Executive summary bullets">
              <h3 className="dashSummarySectionTitle">Highlights</h3>
              <ul className="dashSummaryList">
                {(items.length > 0
                  ? items
                  : ["No executive summary items are available from the current dashboard view."]).map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
