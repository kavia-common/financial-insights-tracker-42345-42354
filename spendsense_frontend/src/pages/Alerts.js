import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "../components/Card";
import { AlertList } from "../components/AlertList";
import { FiltersBar } from "../components/FiltersBar";
import { EmptyState } from "../components/EmptyState";
import { CardSkeleton } from "../components/Skeletons";
import { getMockAlertSeverities, getMockAlerts } from "../data/mockData";

// PUBLIC_INTERFACE
export default function Alerts() {
  /** Alerts page with client-side filters and consistent loading/empty states. */
  const alerts = useMemo(() => getMockAlerts(), []);
  const severities = useMemo(() => getMockAlertSeverities(), []);

  const [status, setStatus] = useState("All");
  const [severity, setSeverity] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const pendingTimer = useRef(null);

  useEffect(() => {
    setIsLoading(true);
    if (pendingTimer.current) clearTimeout(pendingTimer.current);

    pendingTimer.current = setTimeout(() => {
      setIsLoading(false);
    }, 380);

    return () => {
      if (pendingTimer.current) clearTimeout(pendingTimer.current);
    };
  }, [status, severity]);

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      if (status !== "All" && String(a.status) !== status) return false;
      if (severity !== "All" && String(a.severity) !== severity) return false;
      return true;
    });
  }, [alerts, status, severity]);

  const statusText = isLoading ? "Updating…" : `${filtered.length} alert${filtered.length === 1 ? "" : "s"}`;

  return (
    <div className="grid" aria-label="Alerts content">
      <FiltersBar
        ariaLabel="Alert filters"
        statusText={statusText}
        actions={
          <button
            type="button"
            className="btn btnGhost"
            onClick={() => {
              setStatus("All");
              setSeverity("All");
            }}
            aria-label="Reset alert filters"
          >
            Reset
          </button>
        }
      >
        <div className="fieldRow" style={{ gridColumn: "span 6" }}>
          <label className="label" htmlFor="alert-status">
            Status
          </label>
          <select
            id="alert-status"
            className="select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <div className="fieldRow" style={{ gridColumn: "span 6" }}>
          <label className="label" htmlFor="alert-severity">
            Severity
          </label>
          <select
            id="alert-severity"
            className="select"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            aria-label="Filter by severity"
          >
            <option value="All">All</option>
            {severities.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </FiltersBar>

      <div className="grid grid2">
        <Card title="Recent alerts" subtitle="Filtered notifications with severity">
          {isLoading ? (
            <CardSkeleton lines={4} />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No alerts match these filters"
              description="Try switching to All status, or broaden severity to see historical items."
              actionLabel="Create alert rule"
              onAction={() => alert("Rule creation not implemented (mock).")}
              ariaLabel="No filtered alerts"
            />
          ) : (
            <AlertList items={filtered} />
          )}
        </Card>

        <Card title="Rules (placeholder)" subtitle="Configure alert policies later">
          <div style={{ color: "rgba(17,24,39,0.75)", fontSize: 13, lineHeight: 1.6 }}>
            <div style={{ fontWeight: 800 }}>Suggested rules</div>
            <ul>
              <li>
                Flag transactions above <strong>$250</strong>.
              </li>
              <li>
                Notify when subscriptions exceed <strong>$100/mo</strong>.
              </li>
              <li>Warn on new merchant categories.</li>
            </ul>
            <div style={{ marginTop: 12, color: "rgba(17,24,39,0.6)" }}>
              Later, this section can be wired to backend + notification preferences.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
