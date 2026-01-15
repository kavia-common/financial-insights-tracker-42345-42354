import React, { useMemo } from "react";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function SkeletonBlock({ x, y, w, h, r = 6, opacity = 0.8 }) {
  return <rect x={x} y={y} width={w} height={h} rx={r} fill={`rgba(17,24,39,${0.08 * opacity})`} />;
}

function Frame({ title, description, children }) {
  return (
    <div className="chartSkeleton" role="img" aria-label={`${title || "Chart"} placeholder`}>
      <div className="chartSkeletonHeader">
        <div>
          <div className="chartSkeletonTitle">{title || "Chart"}</div>
          {description ? <div className="chartSkeletonDesc">{description}</div> : null}
        </div>
        <div className="chartSkeletonMeta" aria-hidden="true">
          placeholder
        </div>
      </div>
      <div className="chartSkeletonBody">{children}</div>
    </div>
  );
}

function useSafeData(data) {
  return useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.slice(0, 24);
  }, [data]);
}

// PUBLIC_INTERFACE
export function LineChartPlaceholder({ title, description, data }) {
  /** Line chart placeholder with a simple polyline skeleton. */
  const safe = useSafeData(data);

  const points = useMemo(() => {
    // Use data length to vary shape, but keep deterministic even without real values.
    const n = clamp(safe.length || 12, 6, 18);
    const left = 10;
    const top = 12;
    const w = 520;
    const h = 170;

    const pts = [];
    for (let i = 0; i < n; i += 1) {
      const t = i / (n - 1);
      const x = left + t * w;
      // A gentle wave; does not depend on real values.
      const y = top + (1 - (0.55 + 0.25 * Math.sin((i + 1) * 1.1))) * h;
      pts.push([x.toFixed(1), y.toFixed(1)].join(","));
    }
    return pts.join(" ");
  }, [safe.length]);

  return (
    <Frame title={title} description={description}>
      <svg viewBox="0 0 540 200" width="100%" height="180" aria-hidden="true">
        {/* grid */}
        {Array.from({ length: 6 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="10"
            x2="530"
            y1={20 + i * 28}
            y2={20 + i * 28}
            stroke="rgba(17,24,39,0.06)"
            strokeWidth="1"
          />
        ))}
        {Array.from({ length: 7 }).map((_, i) => (
          <line
            key={`v-${i}`}
            y1="12"
            y2="188"
            x1={10 + i * 74}
            x2={10 + i * 74}
            stroke="rgba(17,24,39,0.05)"
            strokeWidth="1"
          />
        ))}

        <polyline points={points} fill="none" stroke="rgba(37,99,235,0.55)" strokeWidth="3" strokeLinejoin="round" />
        <polyline points={points} fill="none" stroke="rgba(37,99,235,0.16)" strokeWidth="10" strokeLinejoin="round" />
      </svg>
    </Frame>
  );
}

// PUBLIC_INTERFACE
export function BarChartPlaceholder({ title, description, data }) {
  /** Bar chart placeholder with vertical bars. */
  const safe = useSafeData(data);

  const bars = useMemo(() => {
    const n = clamp(safe.length || 10, 6, 14);
    const maxH = 140;
    const baseY = 170;
    const startX = 16;
    const gap = 10;
    const barW = 28;

    return Array.from({ length: n }).map((_, i) => {
      const wave = 0.45 + 0.45 * Math.abs(Math.sin((i + 1) * 0.9));
      const h = Math.round(maxH * wave);
      const x = startX + i * (barW + gap);
      const y = baseY - h;
      const isAccent = i % 4 === 0;
      return { x, y, w: barW, h, isAccent };
    });
  }, [safe.length]);

  return (
    <Frame title={title} description={description}>
      <svg viewBox="0 0 540 200" width="100%" height="180" aria-hidden="true">
        <line x1="12" x2="528" y1="170" y2="170" stroke="rgba(17,24,39,0.10)" strokeWidth="1" />
        {bars.map((b, idx) => (
          <rect
            key={idx}
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx="8"
            fill={b.isAccent ? "rgba(245,158,11,0.55)" : "rgba(37,99,235,0.45)"}
          />
        ))}

        {/* subtle top labels */}
        <SkeletonBlock x={14} y={12} w={120} h={12} r={6} opacity={0.6} />
        <SkeletonBlock x={150} y={12} w={78} h={12} r={6} opacity={0.45} />
      </svg>
    </Frame>
  );
}

// PUBLIC_INTERFACE
export function PieChartPlaceholder({ title, description, data }) {
  /** Pie chart placeholder (donut style) with segment arcs. */
  useSafeData(data); // kept for API symmetry / future wiring

  return (
    <Frame title={title} description={description}>
      <div className="chartSkeletonPieWrap">
        <svg viewBox="0 0 220 220" width="220" height="180" aria-hidden="true">
          <circle cx="110" cy="110" r="72" fill="none" stroke="rgba(17,24,39,0.08)" strokeWidth="22" />
          {/* segments */}
          <circle
            cx="110"
            cy="110"
            r="72"
            fill="none"
            stroke="rgba(37,99,235,0.55)"
            strokeWidth="22"
            strokeDasharray="170 420"
            strokeDashoffset="-10"
            strokeLinecap="round"
          />
          <circle
            cx="110"
            cy="110"
            r="72"
            fill="none"
            stroke="rgba(245,158,11,0.60)"
            strokeWidth="22"
            strokeDasharray="95 420"
            strokeDashoffset="-195"
            strokeLinecap="round"
          />
          <circle
            cx="110"
            cy="110"
            r="72"
            fill="none"
            stroke="rgba(16,185,129,0.35)"
            strokeWidth="22"
            strokeDasharray="55 420"
            strokeDashoffset="-300"
            strokeLinecap="round"
          />

          {/* hole */}
          <circle cx="110" cy="110" r="46" fill="rgba(255,255,255,0.95)" />
          <text x="110" y="108" textAnchor="middle" fontSize="13" fill="rgba(17,24,39,0.65)" fontWeight="700">
            Category
          </text>
          <text x="110" y="128" textAnchor="middle" fontSize="12" fill="rgba(17,24,39,0.45)">
            distribution
          </text>
        </svg>

        <div className="chartSkeletonLegend" aria-hidden="true">
          <div className="chartSkeletonLegendRow">
            <span className="chartSkeletonLegendDot" style={{ background: "rgba(37,99,235,0.55)" }} />
            <SkeletonBlock x={0} y={0} w={140} h={12} r={6} opacity={0.7} />
          </div>
          <div className="chartSkeletonLegendRow">
            <span className="chartSkeletonLegendDot" style={{ background: "rgba(245,158,11,0.60)" }} />
            <SkeletonBlock x={0} y={0} w={112} h={12} r={6} opacity={0.6} />
          </div>
          <div className="chartSkeletonLegendRow">
            <span className="chartSkeletonLegendDot" style={{ background: "rgba(16,185,129,0.35)" }} />
            <SkeletonBlock x={0} y={0} w={96} h={12} r={6} opacity={0.55} />
          </div>
        </div>
      </div>
    </Frame>
  );
}
