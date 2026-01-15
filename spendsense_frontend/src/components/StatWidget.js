import React from "react";
import { IconArrowDownRight, IconArrowUpRight } from "./Icons";

/**
 * Compact KPI component with value and delta.
 */

// PUBLIC_INTERFACE
export function StatWidget({ icon, title, value, deltaLabel, deltaDirection = "up", helper }) {
  /** Renders a KPI block with an icon, title, numeric value, and delta. */
  const DeltaIcon = deltaDirection === "down" ? IconArrowDownRight : IconArrowUpRight;
  const deltaClass = deltaDirection === "down" ? "deltaDown" : "deltaUp";

  return (
    <div aria-label={`${title} stat`}>
      <div className="statTop">
        <div>
          <div className="statTitle">{title}</div>
          <div className="statValue">{value}</div>
        </div>
        <div className="statIconWrap" aria-hidden="true">
          <span className="statIcon">{icon}</span>
        </div>
      </div>

      <div className="deltaRow">
        <span className={`deltaBadge ${deltaClass}`}>
          <DeltaIcon width="14" height="14" style={{ marginRight: 6 }} />
          {deltaLabel}
        </span>
        {helper ? <span>{helper}</span> : null}
      </div>
    </div>
  );
}
