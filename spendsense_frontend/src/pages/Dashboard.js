import React, { useMemo } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { Card } from "../components/Card";
import { ChartPlaceholder } from "../components/ChartPlaceholder";
import { StatWidget } from "../components/StatWidget";
import { IconBell, IconLayout, IconSparkles, IconWallet } from "../components/Icons";
import { TransactionsTable } from "../components/TransactionsTable";
import { getMockTransactions } from "../data/mockData";

function computeKPIs(transactions) {
  const outflow = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const inflow = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const net = inflow - outflow;
  const flagged = transactions.filter((t) => t.status === "Flagged").length;
  return { outflow, inflow, net, flagged };
}

function money(x) {
  return `$${x.toFixed(2)}`;
}

// PUBLIC_INTERFACE
export default function Dashboard() {
  /** Dashboard overview page with KPI cards and chart placeholders. */
  const { search } = useOutletContext() || { search: "" };
  const transactions = useMemo(() => getMockTransactions(), []);

  const filtered = useMemo(() => {
    const q = String(search || "").trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter((t) =>
      [t.merchant, t.category, t.status, t.date].some((v) => String(v).toLowerCase().includes(q))
    );
  }, [transactions, search]);

  const kpis = useMemo(() => computeKPIs(transactions), [transactions]);

  return (
    <div className="grid" aria-label="Dashboard content">
      <div className="grid grid4" aria-label="KPI widgets">
        <Card>
          <StatWidget
            icon={<IconWallet title="Wallet" />}
            title="Monthly outflow"
            value={money(kpis.outflow)}
            deltaLabel="+4.8%"
            deltaDirection="up"
            helper="vs last month"
          />
        </Card>
        <Card>
          <StatWidget
            icon={<IconLayout title="Overview" />}
            title="Monthly inflow"
            value={money(kpis.inflow)}
            deltaLabel="+1.2%"
            deltaDirection="up"
            helper="vs last month"
          />
        </Card>
        <Card>
          <StatWidget
            icon={<IconSparkles title="Insights" />}
            title="Net cashflow"
            value={money(kpis.net)}
            deltaLabel="-0.7%"
            deltaDirection="down"
            helper="last 30 days"
          />
        </Card>
        <Card>
          <StatWidget
            icon={<IconBell title="Alerts" />}
            title="Flagged items"
            value={String(kpis.flagged)}
            deltaLabel="2 new"
            deltaDirection="up"
            helper="this week"
          />
        </Card>
      </div>

      <div className="grid grid2" aria-label="Charts row">
        <Card title="Spending trend" subtitle="Daily totals • placeholder">
          <ChartPlaceholder title="Line chart" hint="Spending by day (last 30 days)" />
        </Card>
        <Card title="Category mix" subtitle="Share of spend • placeholder">
          <ChartPlaceholder title="Donut chart" hint="Category distribution (last 30 days)" />
        </Card>
      </div>

      <Card
        title="Recent transactions"
        subtitle="A quick look at the latest activity"
        actions={
          <Link to="/transactions" className="btn btnPrimary" aria-label="View all transactions">
            View all
          </Link>
        }
      >
        <TransactionsTable rows={filtered.slice(0, 8)} pageSize={8} />
      </Card>
    </div>
  );
}
