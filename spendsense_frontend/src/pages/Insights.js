import React, { useMemo } from "react";
import { Card } from "../components/Card";
import { BarChartPlaceholder } from "../components/ChartPlaceholders";
import { getMockInsights } from "../data/mockData";

// PUBLIC_INTERFACE
export default function Insights() {
  /** Insights page showing highlight cards and placeholder analytics visuals. */
  const insights = useMemo(() => getMockInsights(), []);

  return (
    <div className="grid" aria-label="Insights content">
      <div className="grid grid4" aria-label="Insight highlight cards">
        {insights.map((i) => (
          <Card key={i.id} title={i.title} subtitle={i.detail}>
            <div style={{ fontSize: 28, fontWeight: 850, letterSpacing: "-0.03em" }}>{i.value}</div>
            <div style={{ marginTop: 8, color: "rgba(17,24,39,0.6)", fontSize: 13 }}>
              Tip: connect ML-based categorization and trends when backend is ready.
            </div>
          </Card>
        ))}
        <Card title="Next best action" subtitle="Optimization idea">
          <div style={{ fontSize: 16, fontWeight: 750 }}>
            Review subscriptions this week
          </div>
          <div style={{ marginTop: 10, color: "rgba(17,24,39,0.6)", fontSize: 13 }}>
            You may save ~$41/mo by cancelling unused services.
          </div>
        </Card>
      </div>

      <div className="grid grid2" aria-label="Insight charts">
        <Card title="Category momentum" subtitle="Month-over-month • placeholder">
          <BarChartPlaceholder
            title="Category momentum"
            description="Spend by category (MoM change) • placeholder"
            data={insights}
          />
        </Card>
        <Card title="Merchant concentration" subtitle="Top merchants • placeholder">
          <BarChartPlaceholder
            title="Merchant concentration"
            description="Top merchants by share of spend • placeholder"
            data={insights}
          />
        </Card>
      </div>
    </div>
  );
}
