import React, { useMemo, useState } from "react";

function compare(a, b) {
  if (a === b) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

function formatMoney(amount) {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  return `${sign}$${abs.toFixed(2)}`;
}

function categoryPillClass(category) {
  const c = String(category || "").toLowerCase();
  if (c.includes("income") || c.includes("salary")) return "pill pillGood";
  if (c.includes("subscription") || c.includes("utilities")) return "pill pillWarn";
  if (c.includes("transfer")) return "pill";
  return "pill";
}

// PUBLIC_INTERFACE
export function TransactionsTable({ rows, pageSize = 8 }) {
  /** Sortable + paginated table for transactions (mock data friendly). */
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((r1, r2) => {
      const v = compare(r1[sortKey], r2[sortKey]);
      return sortDir === "asc" ? v : -v;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageClamped = Math.min(page, totalPages);

  const pageRows = useMemo(() => {
    const start = (pageClamped - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, pageClamped, pageSize]);

  const toggleSort = (key) => {
    setPage(1);
    setSortKey((prevKey) => {
      if (prevKey !== key) {
        setSortDir("asc");
        return key;
      }
      setSortDir((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
      return prevKey;
    });
  };

  const sortLabel = (key, label) => {
    const active = sortKey === key;
    const arrow = active ? (sortDir === "asc" ? "↑" : "↓") : "↕";
    return (
      <button
        type="button"
        className="sortBtn"
        onClick={() => toggleSort(key)}
        aria-label={`Sort by ${label} ${active ? (sortDir === "asc" ? "ascending" : "descending") : ""}`}
      >
        <span>{label}</span>
        <span aria-hidden="true" style={{ color: "rgba(17,24,39,0.55)" }}>
          {arrow}
        </span>
      </button>
    );
  };

  return (
    <div>
      <div className="tableWrap" role="region" aria-label="Transactions table">
        <table className="table">
          <thead>
            <tr>
              <th className="th">{sortLabel("date", "Date")}</th>
              <th className="th">{sortLabel("merchant", "Merchant")}</th>
              <th className="th">{sortLabel("category", "Category")}</th>
              <th className="th">{sortLabel("amount", "Amount")}</th>
              <th className="th">{sortLabel("status", "Status")}</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r) => (
              <tr key={r.id}>
                <td className="td">{r.date}</td>
                <td className="td" style={{ fontWeight: 650 }}>{r.merchant}</td>
                <td className="td">
                  <span className={categoryPillClass(r.category)}>{r.category}</span>
                </td>
                <td className="td" style={{ fontWeight: 750, color: r.amount < 0 ? "rgba(17,24,39,1)" : "#065f46" }}>
                  {formatMoney(r.amount)}
                </td>
                <td className="td">
                  <span className={`pill ${r.status === "Flagged" ? "pillBad" : r.status === "Pending" ? "pillWarn" : "pillGood"}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
            {pageRows.length === 0 ? (
              <tr>
                <td className="td" colSpan={5} style={{ color: "rgba(17,24,39,0.6)" }}>
                  No transactions.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="tableFooter" aria-label="Table pagination">
        <div style={{ fontSize: 12, color: "rgba(17,24,39,0.6)" }}>
          Showing {(pageClamped - 1) * pageSize + 1}-{Math.min(pageClamped * pageSize, sorted.length)} of {sorted.length}
        </div>

        <div className="pagination">
          <button
            type="button"
            className="btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={pageClamped <= 1}
            aria-label="Previous page"
          >
            Prev
          </button>
          <span style={{ fontSize: 12, color: "rgba(17,24,39,0.65)" }}>
            Page <strong>{pageClamped}</strong> / {totalPages}
          </span>
          <button
            type="button"
            className="btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={pageClamped >= totalPages}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
