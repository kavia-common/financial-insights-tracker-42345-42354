import React from "react";

/**
 * Minimal segmented control for small option sets (e.g., timeframes).
 */

// PUBLIC_INTERFACE
export function SegmentedControl({ label, value, options, onChange, ariaLabel }) {
  /** Render a segmented control (single selection) with buttons for options. */
  return (
    <div className="fieldRow" style={{ gridColumn: "span 6" }}>
      {label ? (
        <div className="fieldHintRow">
          <label className="label">{label}</label>
        </div>
      ) : null}
      <div className="segmented" role="group" aria-label={ariaLabel || label || "Segmented control"}>
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              className={`segmentBtn ${active ? "segmentBtnActive" : ""}`}
              onClick={() => onChange?.(opt.value)}
              aria-pressed={active}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
