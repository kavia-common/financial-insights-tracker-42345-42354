import React from "react";

function badgeClass(severity) {
  const s = String(severity || "").toLowerCase();
  if (s === "critical") return "badge badgeCrit";
  if (s === "warning") return "badge badgeWarn";
  return "badge badgeInfo";
}

// PUBLIC_INTERFACE
export function AlertList({ items }) {
  /** Renders an accessible list of alerts with severity badges. */
  return (
    <div role="list" aria-label="Alerts list">
      {items.map((a) => (
        <div key={a.id} className="alertItem" role="listitem">
          <div>
            <p className="alertTitle">{a.title}</p>
            <p className="alertDesc">{a.description}</p>
            <p className="alertDesc" style={{ marginTop: 6 }}>
              {a.time}
            </p>
          </div>
          <span className={badgeClass(a.severity)} aria-label={`Severity ${a.severity}`}>
            {a.severity}
          </span>
        </div>
      ))}
    </div>
  );
}
