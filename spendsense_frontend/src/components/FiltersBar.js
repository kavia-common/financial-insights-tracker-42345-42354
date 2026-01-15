import React from "react";

/**
 * Generic filters container with an accessible structure.
 */

// PUBLIC_INTERFACE
export function FiltersBar({ children, actions, statusText, ariaLabel = "Filters" }) {
  /** Wrap filter controls and actions in a responsive layout with optional aria-live feedback text. */
  return (
    <section className="filtersBar" aria-label={ariaLabel}>
      <div className="filtersGrid">{children}</div>
      <div className="filtersActions">
        {statusText ? (
          <div aria-live="polite" style={{ fontSize: 12, color: "rgba(17,24,39,0.60)", marginRight: 6 }}>
            {statusText}
          </div>
        ) : null}
        {actions}
      </div>
    </section>
  );
}
