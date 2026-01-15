import React, { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { Card } from "../components/Card";
import { TransactionsTable } from "../components/TransactionsTable";
import { getMockTransactions } from "../data/mockData";

// PUBLIC_INTERFACE
export default function Transactions() {
  /** Transactions page with searchable, sortable table and pagination. */
  const { search } = useOutletContext() || { search: "" };
  const transactions = useMemo(() => getMockTransactions(), []);

  const filtered = useMemo(() => {
    const q = String(search || "").trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter((t) =>
      [t.merchant, t.category, t.status, t.date].some((v) => String(v).toLowerCase().includes(q))
    );
  }, [transactions, search]);

  return (
    <div className="grid" aria-label="Transactions content">
      <Card
        title="All transactions"
        subtitle="Sort columns and paginate through mock data"
      >
        <TransactionsTable rows={filtered} pageSize={8} />
      </Card>
    </div>
  );
}
