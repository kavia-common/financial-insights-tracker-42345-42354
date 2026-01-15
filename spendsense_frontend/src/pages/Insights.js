import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "../components/Card";
import { BarChartPlaceholder } from "../components/ChartPlaceholders";
import { FiltersBar } from "../components/FiltersBar";
import { SegmentedControl } from "../components/SegmentedControl";
import { MultiSelectChips } from "../components/MultiSelectChips";
import { EmptyState } from "../components/EmptyState";
import { ChartSkeletonPlaceholder, CardSkeleton } from "../components/Skeletons";
import { getMockCategories, getMockInsights, getMockTransactions } from "../data/mockData";

function daysForTimeframe(tf) {
  if (tf === "7") return 7;
  if (tf === "30") return 30;
  if (tf === "90") return 90;
  if (tf === "ytd") return 365; // mock: treat YTD as 365-day window
  return 30;
}

function lastNDays(transactions, days) {
  // transactions use isoDate with "daysAgo", so lexicographic works for ISO yyyy-mm-dd.
  const now = new Date();
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  const cutoff = d.toISOString().slice(0, 10);
  return transactions.filter((t) => t.date >= cutoff);
}

function groupSpendByCategory(transactions) {
  const map = new Map();
  transactions.forEach((t) => {
    if (t.amount >= 0) return; // focus on spend for charts
    const key = t.category;
    map.set(key, (map.get(key) || 0) + Math.abs(t.amount));
  });
  const rows = Array.from(map.entries()).map(([category, spend]) => ({ category, spend }));
  rows.sort((a, b) => b.spend - a.spend);
  return rows;
}

// PUBLIC_INTERFACE
export default function Insights() {
  /** Insights page: filterable timeframe + categories with simulated recalculation and empty/loading states. */
  const baseInsights = useMemo(() => getMockInsights(), []);
  const categories = useMemo(() => getMockCategories(), []);
  const allTx = useMemo(() => getMockTransactions(), []);

  const [timeframe, setTimeframe] = useState("30");
  const [selectedCategories, setSelectedCategories] = useState(() => categories.slice(0, 3));
  const [isLoading, setIsLoading] = useState(false);
  const pendingTimer = useRef(null);

  const toggleCategory = (c) => {
    setSelectedCategories((prev) => {
      const set = new Set(prev);
      if (set.has(c)) set.delete(c);
      else set.add(c);
      return Array.from(set);
    });
  };

  // Simulated loading when filters change (cancellable).
  useEffect(() => {
    setIsLoading(true);
    if (pendingTimer.current) clearTimeout(pendingTimer.current);

    pendingTimer.current = setTimeout(() => {
      setIsLoading(false);
    }, 360);

    return () => {
      if (pendingTimer.current) clearTimeout(pendingTimer.current);
    };
  }, [timeframe, selectedCategories.join("|")]);

  const filteredTx = useMemo(() => {
    const windowDays = daysForTimeframe(timeframe);
    const windowed = lastNDays(allTx, windowDays);
    if (!selectedCategories || selectedCategories.length === 0) return [];
    const set = new Set(selectedCategories);
    return windowed.filter((t) => set.has(t.category));
  }, [allTx, timeframe, selectedCategories]);

  const categorySpend = useMemo(() => groupSpendByCategory(filteredTx), [filteredTx]);

  const statusText = isLoading ? "Recalculating…" : `${filteredTx.length} transaction${filteredTx.length === 1 ? "" : "s"} in scope`;

  return (
    <div className="grid" aria-label="Insights content">
      <FiltersBar
        ariaLabel="Insights filters"
        statusText={statusText}
        actions={
          <button
            type="button"
            className="btn btnGhost"
            onClick={() => {
              setTimeframe("30");
              setSelectedCategories(categories.slice(0, 3));
            }}
            aria-label="Reset insights filters"
          >
            Reset
          </button>
        }
      >
        <SegmentedControl
          label="Timeframe"
          value={timeframe}
          onChange={setTimeframe}
          options={[
            { label: "Last 7", value: "7" },
            { label: "Last 30", value: "30" },
            { label: "Last 90", value: "90" },
            { label: "YTD", value: "ytd" },
            { label: "Custom", value: "custom" }, // placeholder
          ]}
          ariaLabel="Select timeframe"
        />

        <MultiSelectChips
          label="Categories"
          options={categories}
          selected={selectedCategories}
          onToggle={toggleCategory}
          helper="Multi-select placeholder: charts update with selected categories."
          ariaLabel="Filter categories"
        />
      </FiltersBar>

      {isLoading ? (
        <div className="grid grid4" aria-label="Insight highlight cards loading">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} title="" subtitle="">
              <CardSkeleton lines={3} />
            </Card>
          ))}
        </div>
      ) : filteredTx.length === 0 ? (
        <EmptyState
          title="No insights for this selection"
          description="Choose at least one category, or switch to a broader timeframe to see spending patterns."
          actionLabel="Clear category filters"
          onAction={() => setSelectedCategories(categories.slice(0, 3))}
          ariaLabel="No insights available"
        />
      ) : (
        <>
          <div className="grid grid4" aria-label="Insight highlight cards">
            {baseInsights.map((i) => (
              <Card key={i.id} title={i.title} subtitle={i.detail}>
                <div style={{ fontSize: 28, fontWeight: 850, letterSpacing: "-0.03em" }}>{i.value}</div>
                <div style={{ marginTop: 8, color: "rgba(17,24,39,0.6)", fontSize: 13 }}>
                  Filters applied: {selectedCategories.length} categories • timeframe {timeframe === "custom" ? "custom" : `${timeframe}d`}
                </div>
              </Card>
            ))}
            <Card title="Next best action" subtitle="Optimization idea">
              <div style={{ fontSize: 16, fontWeight: 750 }}>Review subscriptions this week</div>
              <div style={{ marginTop: 10, color: "rgba(17,24,39,0.6)", fontSize: 13 }}>
                Focus on categories that remain high across timeframes.
              </div>
            </Card>
          </div>

          <div className="grid grid2" aria-label="Insight charts">
            <Card title="Category momentum" subtitle="Filtered categories • placeholder">
              <BarChartPlaceholder
                title="Category momentum"
                description={`Spend by category (${timeframe === "custom" ? "custom range" : `last ${timeframe} days`}) • placeholder`}
                data={categorySpend}
              />
            </Card>
            <Card title="Merchant concentration" subtitle="Filtered scope • placeholder">
              <BarChartPlaceholder
                title="Merchant concentration"
                description="Top merchants by share of spend • placeholder"
                data={filteredTx}
              />
            </Card>
          </div>
        </>
      )}

      {isLoading ? (
        <div className="grid grid2" aria-label="Charts recalculating">
          <Card title="Category momentum">
            <ChartSkeletonPlaceholder title="Category momentum" subtitle="Recalculating with selected filters…" />
          </Card>
          <Card title="Merchant concentration">
            <ChartSkeletonPlaceholder title="Merchant concentration" subtitle="Recalculating with selected filters…" />
          </Card>
        </div>
      ) : null}
    </div>
  );
}
