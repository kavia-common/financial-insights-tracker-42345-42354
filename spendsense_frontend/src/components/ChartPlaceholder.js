import React from "react";

/**
 * Placeholder region for charts that will be integrated later.
 */

// PUBLIC_INTERFACE
export function ChartPlaceholder({ title = "Chart", hint = "Connect a chart library when data is available." }) {
  /** Displays a consistent chart placeholder box. */
  return (
    <div className="chartPlaceholder" role="img" aria-label={`${title} placeholder`}>
      <div>
        <div style={{ fontWeight: 750, color: "rgba(17,24,39,0.75)" }}>{title}</div>
        <div style={{ marginTop: 6 }}>{hint}</div>
      </div>
    </div>
  );
}
