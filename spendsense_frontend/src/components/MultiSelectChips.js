import React from "react";

/**
 * Small multi-select UI using chips (no external deps).
 */

// PUBLIC_INTERFACE
export function MultiSelectChips({ label, options, selected, onToggle, ariaLabel, helper }) {
  /** Render chip-based multi-select with pressed states. */
  const selectedSet = new Set(selected || []);

  return (
    <div className="fieldRow" style={{ gridColumn: "span 6" }}>
      <label className="label">{label}</label>
      <div className="chipRow" role="group" aria-label={ariaLabel || label || "Multi select"}>
        {options.map((opt) => {
          const isOn = selectedSet.has(opt);
          return (
            <button
              key={opt}
              type="button"
              className={`chip ${isOn ? "chipSelected" : ""}`}
              onClick={() => onToggle?.(opt)}
              aria-pressed={isOn}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {helper ? <div className="helper">{helper}</div> : null}
    </div>
  );
}
