import React from "react";

/**
 * Placeholder date range picker (no external deps). Uses two native date inputs.
 */

// PUBLIC_INTERFACE
export function DateRangePicker({ label = "Date range", from, to, onChange, gridSpan = 6 }) {
  /** Two-input date range picker with accessible labeling. */
  const fromId = `${label.replace(/\s+/g, "-").toLowerCase()}-from`;
  const toId = `${label.replace(/\s+/g, "-").toLowerCase()}-to`;

  return (
    <div className="fieldRow" style={{ gridColumn: `span ${gridSpan}` }}>
      <label className="label">{label}</label>
      <div className="formGrid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
        <div className="field">
          <label className="label" htmlFor={fromId} style={{ fontWeight: 700 }}>
            From
          </label>
          <input
            id={fromId}
            className="input"
            type="date"
            value={from || ""}
            onChange={(e) => onChange?.({ from: e.target.value, to })}
            aria-label={`${label} from`}
          />
        </div>
        <div className="field">
          <label className="label" htmlFor={toId} style={{ fontWeight: 700 }}>
            To
          </label>
          <input
            id={toId}
            className="input"
            type="date"
            value={to || ""}
            onChange={(e) => onChange?.({ from, to: e.target.value })}
            aria-label={`${label} to`}
          />
        </div>
      </div>
      <div className="helper">Placeholder: a richer calendar picker can replace this later.</div>
    </div>
  );
}
