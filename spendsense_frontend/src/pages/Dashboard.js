import React, { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { Card } from "../components/Card";
import { LineChartPlaceholder, PieChartPlaceholder } from "../components/ChartPlaceholders";
import { StatWidget } from "../components/StatWidget";
import { IconBell, IconLayout, IconSparkles, IconWallet } from "../components/Icons";
import { TransactionsTable } from "../components/TransactionsTable";
import { DashboardSummaryPanel } from "../components/DashboardSummaryPanel";
import { ExecutiveSummaryPanel } from "../components/ExecutiveSummaryPanel";
import { DashboardQA } from "../components/DashboardQA";
import { getMockTransactions } from "../data/mockData";
import { summarizeDashboard } from "../utils/summarizeDashboard";
import { buildDashboardSnapshot } from "../utils/snapshot";
import { generateExecutiveSummary } from "../utils/executiveSummary";

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

function randomDelayMs(min = 200, max = 400) {
  const lo = Math.max(0, Number(min) || 0);
  const hi = Math.max(lo, Number(max) || lo);
  return Math.floor(lo + Math.random() * (hi - lo + 1));
}

// PUBLIC_INTERFACE
export default function Dashboard() {
  /** Dashboard overview page with KPI cards and chart placeholders + a local (mock-data) summary drawer. */
  const { search } = useOutletContext() || { search: "" };
  const transactions = useMemo(() => getMockTransactions(), []);

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const [execOpen, setExecOpen] = useState(false);
  const [execLoading, setExecLoading] = useState(false);
  const [execBullets, setExecBullets] = useState(null);

  const timerRef = useRef(null);

  const filtered = useMemo(() => {
    const q = String(search || "").trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter((t) =>
      [t.merchant, t.category, t.status, t.date].some((v) => String(v).toLowerCase().includes(q))
    );
  }, [transactions, search]);

  const kpis = useMemo(() => computeKPIs(transactions), [transactions]);

  const snapshot = useMemo(() => buildDashboardSnapshot({ transactions, kpis }), [transactions, kpis]);

  const onSummarize = () => {
    setSummaryOpen(true);
    setSummaryLoading(true);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const s = summarizeDashboard({
        // Dashboard currently uses the full dataset for KPIs/charts; keep summary aligned with that.
        transactions,
        kpis,
      });
      setSummary(s);
      setSummaryLoading(false);
    }, randomDelayMs(200, 400));
  };

  const onExecutiveSummary = () => {
    setExecOpen(true);
    setExecLoading(true);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      // IMPORTANT: Executive summary must ONLY use dashboard-visible data.
      // We use the snapshot contract to enforce this.
      const bullets = generateExecutiveSummary(snapshot);
      setExecBullets(bullets);
      setExecLoading(false);
    }, randomDelayMs(200, 400));
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <>
      <div className="dashTopActions" aria-label="Dashboard actions">
        <button
          type="button"
          className="btn btnPrimary btnGradient"
          onClick={onSummarize}
          aria-label="Summarize dashboard"
          disabled={summaryLoading}
          title="Generate a short summary from the current dashboard data"
        >
          {summaryLoading ? "Summarizing…" : "Summarize Dashboard"}
        </button>

        <button
          type="button"
          className="btn btnPrimary"
          onClick={onExecutiveSummary}
          aria-label="Open executive summary"
          disabled={execLoading}
          title="Generate an executive-level summary from the current dashboard data"
        >
          {execLoading ? "Generating…" : "Executive Summary"}
        </button>
      </div>

      <div className="grid" aria-label="Dashboard content">
        <DashboardQA snapshot={snapshot} />

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
            <LineChartPlaceholder
              title="Spending trend"
              description="Daily totals (last 30 days) • placeholder"
              data={transactions}
            />
          </Card>
          <Card title="Category mix" subtitle="Share of spend • placeholder">
            <PieChartPlaceholder
              title="Category mix"
              description="Category distribution (last 30 days) • placeholder"
              data={transactions}
            />
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

      <DashboardSummaryPanel
        open={summaryOpen}
        loading={summaryLoading}
        summary={summary}
        onClose={() => {
          setSummaryOpen(false);
          setSummaryLoading(false);
        }}
      />

      <ExecutiveSummaryPanel
        open={execOpen}
        loading={execLoading}
        bullets={execBullets}
        onClose={() => {
          setExecOpen(false);
          setExecLoading(false);
        }}
      />
    </>
  );
}
