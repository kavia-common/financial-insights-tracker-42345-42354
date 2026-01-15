import React, { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card } from "../components/Card";
import { TransactionsTable } from "../components/TransactionsTable";
import { FiltersBar } from "../components/FiltersBar";
import { EmptyState } from "../components/EmptyState";
import { DateRangePicker } from "../components/DateRangePicker";
import { TableRowSkeleton } from "../components/Skeletons";
import { getMockCategories, getMockTransactions } from "../data/mockData";

function parseMoneyInput(v) {
  const s = String(v || "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function inDateRange(iso, from, to) {
  if (!iso) return false;
  if (from && iso < from) return false;
  if (to && iso > to) return false;
  return true;
}

// PUBLIC_INTERFACE
export default function Transactions() {
  /** Transactions page with filterable, sortable table and pagination (client-side mock filtering). */
  const { search: topbarSearch } = useOutletContext() || { search: "" };

  const categories = useMemo(() => getMockCategories(), []);
  const transactions = useMemo(() => getMockTransactions(), []);

  const [filters, setFilters] = useState(() => ({
    dateFrom: "",
    dateTo: "",
    category: "All",
    amountMin: "",
    amountMax: "",
    search: "",
  }));

  const [isLoading, setIsLoading] = useState(false);
  const pendingTimer = useRef(null);

  // Keep a sensible default: Topbar search feeds the page filter search, but the user can override it.
  useEffect(() => {
    setFilters((f) => ({ ...f, search: String(topbarSearch || "") }));
  }, [topbarSearch]);

  // Simulated loading when filters change (cancellable).
  useEffect(() => {
    setIsLoading(true);
    if (pendingTimer.current) clearTimeout(pendingTimer.current);

    pendingTimer.current = setTimeout(() => {
      setIsLoading(false);
    }, 420);

    return () => {
      if (pendingTimer.current) clearTimeout(pendingTimer.current);
    };
  }, [filters.dateFrom, filters.dateTo, filters.category, filters.amountMin, filters.amountMax, filters.search]);

  const filtered = useMemo(() => {
    const q = String(filters.search || "").trim().toLowerCase();
    const min = parseMoneyInput(filters.amountMin);
    const max = parseMoneyInput(filters.amountMax);

    return transactions.filter((t) => {
      if (!inDateRange(t.date, filters.dateFrom || "", filters.dateTo || "")) return false;

      if (filters.category !== "All" && t.category !== filters.category) return false;

      if (min != null && t.amount < min) return false;
      if (max != null && t.amount > max) return false;

      if (q) {
        const hay = [t.merchant, t.category, t.status, t.date, String(t.amount)].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [transactions, filters]);

  const statusText = isLoading ? "Updating…" : `${filtered.length} result${filtered.length === 1 ? "" : "s"}`;

  return (
    <div className="grid" aria-label="Transactions content">
      <FiltersBar
        ariaLabel="Transaction filters"
        statusText={statusText}
        actions={
          <>
            <button
              type="button"
              className="btn btnGhost"
              onClick={() =>
                setFilters({
                  dateFrom: "",
                  dateTo: "",
                  category: "All",
                  amountMin: "",
                  amountMax: "",
                  search: String(topbarSearch || ""),
                })
              }
              aria-label="Reset filters"
            >
              Reset
            </button>
          </>
        }
      >
        <DateRangePicker
          label="Date range"
          from={filters.dateFrom}
          to={filters.dateTo}
          onChange={({ from, to }) => setFilters((f) => ({ ...f, dateFrom: from || "", dateTo: to || "" }))}
          gridSpan={6}
        />

        <div className="fieldRow" style={{ gridColumn: "span 3" }}>
          <label className="label" htmlFor="tx-category">
            Category
          </label>
          <select
            id="tx-category"
            className="select"
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            aria-label="Filter by category"
          >
            <option value="All">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="fieldRow" style={{ gridColumn: "span 3" }}>
          <label className="label" htmlFor="tx-search">
            Search
          </label>
          <input
            id="tx-search"
            className="input"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            placeholder="Merchant, category, status…"
            aria-label="Search transactions"
          />
        </div>

        <div className="fieldRow" style={{ gridColumn: "span 3" }}>
          <label className="label" htmlFor="tx-min">
            Amount min
          </label>
          <input
            id="tx-min"
            className="input"
            inputMode="decimal"
            value={filters.amountMin}
            onChange={(e) => setFilters((f) => ({ ...f, amountMin: e.target.value }))}
            placeholder="-100"
            aria-label="Minimum amount"
          />
          <div className="helper">Tip: use negatives for spend.</div>
        </div>

        <div className="fieldRow" style={{ gridColumn: "span 3" }}>
          <label className="label" htmlFor="tx-max">
            Amount max
          </label>
          <input
            id="tx-max"
            className="input"
            inputMode="decimal"
            value={filters.amountMax}
            onChange={(e) => setFilters((f) => ({ ...f, amountMax: e.target.value }))}
            placeholder="500"
            aria-label="Maximum amount"
          />
          <div className="helper">Example: 0–500 to see small items.</div>
        </div>
      </FiltersBar>

      <Card title="All transactions" subtitle="Client-side filters with simulated loading (mock data)">
        {isLoading ? (
          <div className="tableWrap" role="region" aria-label="Transactions table loading">
            <table className="table">
              <thead>
                <tr>
                  <th className="th">Date</th>
                  <th className="th">Merchant</th>
                  <th className="th">Category</th>
                  <th className="th">Amount</th>
                  <th className="th">Status</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableRowSkeleton key={i} columns={5} />
                ))}
              </tbody>
            </table>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No transactions match these filters"
            description="Try broadening the date range, clearing the category filter, or searching for a different merchant."
            actionLabel="Import transactions"
            onAction={() => alert("Import flow not implemented (mock).")}
            ariaLabel="No filtered transactions"
          />
        ) : (
          <TransactionsTable rows={filtered} pageSize={8} />
        )}
      </Card>
    </div>
  );
}
