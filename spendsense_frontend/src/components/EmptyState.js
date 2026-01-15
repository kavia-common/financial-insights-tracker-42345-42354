import React from "react";
import { IconSparkles } from "./Icons";

/**
 * Consistent empty state block used across lists/charts/pages.
 */

// PUBLIC_INTERFACE
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  ariaLabel,
}) {
  /** Render a centered empty state with optional primary action button/link. */
  const Icon = icon || IconSparkles;

  const action =
    actionHref ? (
      <a className="btn btnPrimary" href={actionHref} aria-label={actionLabel || "Primary action"}>
        {actionLabel || "Take action"}
      </a>
    ) : onAction ? (
      <button type="button" className="btn btnPrimary" onClick={onAction} aria-label={actionLabel || "Primary action"}>
        {actionLabel || "Take action"}
      </button>
    ) : null;

  return (
    <div className="emptyState" role="status" aria-label={ariaLabel || "Empty state"}>
      <div className="emptyIcon" aria-hidden="true">
        <Icon width="22" height="22" />
      </div>
      <div className="emptyTitle">{title || "Nothing to show yet"}</div>
      <p className="emptyDesc">{description || "Try adjusting filters, or add data to get started."}</p>
      {action ? <div style={{ marginTop: 14 }}>{action}</div> : null}
    </div>
  );
}
