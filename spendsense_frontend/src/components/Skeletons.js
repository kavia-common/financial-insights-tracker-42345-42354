import React from "react";

/**
 * Lightweight skeleton primitives using global `.skeleton` shimmer styles in App.css.
 */

function Block({ w, h, style, className = "", ...props }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: w,
        height: h,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
}

// PUBLIC_INTERFACE
export function StatSkeleton() {
  /** Skeleton layout that matches StatWidget inside a Card. */
  return (
    <div aria-label="Loading stat" role="status">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <Block w="44%" h={12} style={{ borderRadius: 10 }} />
          <div style={{ height: 12 }} />
          <Block w="64%" h={30} style={{ borderRadius: 12 }} />
        </div>
        <Block w={38} h={38} style={{ borderRadius: 14 }} />
      </div>
      <div style={{ height: 14 }} />
      <Block w="58%" h={16} style={{ borderRadius: 999 }} />
    </div>
  );
}

// PUBLIC_INTERFACE
export function CardSkeleton({ lines = 3 }) {
  /** Generic card body skeleton (useful for placeholder content). */
  return (
    <div aria-label="Loading content" role="status">
      <Block w="42%" h={12} style={{ borderRadius: 10 }} />
      <div style={{ height: 12 }} />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} style={{ marginTop: i === 0 ? 0 : 10 }}>
          <Block w={`${86 - i * 9}%`} h={12} style={{ borderRadius: 10 }} />
        </div>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
export function TableRowSkeleton({ columns = 5 }) {
  /** Skeleton row for TransactionsTable-like layouts. */
  return (
    <tr aria-hidden="true">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="td">
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className="skeleton skeletonMuted" style={{ width: `${70 - i * 6}%`, height: 12, borderRadius: 10 }} />
          </div>
        </td>
      ))}
    </tr>
  );
}

// PUBLIC_INTERFACE
export function ChartSkeletonPlaceholder({ title = "Chart", subtitle = "Recalculating…" }) {
  /** Simple skeleton wrapper that visually matches the existing chart placeholders. */
  return (
    <div className="chartSkeleton" role="status" aria-label={`${title} loading`}>
      <div className="chartSkeletonHeader">
        <div>
          <div className="chartSkeletonTitle">{title}</div>
          <div className="chartSkeletonDesc">{subtitle}</div>
        </div>
        <div className="chartSkeletonMeta" aria-hidden="true">
          loading
        </div>
      </div>
      <div className="chartSkeletonBody" style={{ padding: 16 }}>
        <div style={{ width: "100%" }}>
          <div className="skeleton" style={{ width: "62%", height: 12, borderRadius: 10 }} />
          <div style={{ height: 10 }} />
          <div className="skeleton" style={{ width: "90%", height: 150, borderRadius: 16 }} />
        </div>
      </div>
    </div>
  );
}
