import React, { useMemo } from "react";
import { Card } from "../components/Card";
import { AlertList } from "../components/AlertList";
import { getMockAlerts } from "../data/mockData";

// PUBLIC_INTERFACE
export default function Alerts() {
  /** Alerts page with severity badges and placeholder rule configuration section. */
  const alerts = useMemo(() => getMockAlerts(), []);

  return (
    <div className="grid" aria-label="Alerts content">
      <div className="grid grid2">
        <Card title="Recent alerts" subtitle="Mock notifications with severity">
          <AlertList items={alerts} />
        </Card>

        <Card title="Rules (placeholder)" subtitle="Configure alert policies later">
          <div style={{ color: "rgba(17,24,39,0.75)", fontSize: 13, lineHeight: 1.6 }}>
            <div style={{ fontWeight: 750 }}>Suggested rules</div>
            <ul>
              <li>Flag transactions above <strong>$250</strong>.</li>
              <li>Notify when subscriptions exceed <strong>$100/mo</strong>.</li>
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
