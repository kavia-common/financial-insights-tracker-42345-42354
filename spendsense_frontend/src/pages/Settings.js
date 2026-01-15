import React, { useState } from "react";
import { Card } from "../components/Card";

function noopSubmit(e) {
  e.preventDefault();
  // Intentionally no backend wiring in this task.
  alert("Saved (mock). No backend connected yet.");
}

// PUBLIC_INTERFACE
export default function Settings() {
  /** Settings page with profile, preferences and notification sections. */
  const [profile, setProfile] = useState({ name: "Jordan Smith", email: "jordan@example.com" });
  const [prefs, setPrefs] = useState({ currency: "USD", startOfWeek: "Mon" });
  const [notifs, setNotifs] = useState({ critical: true, warnings: true, weeklyDigest: false });

  return (
    <div className="grid" aria-label="Settings content">
      <form onSubmit={noopSubmit} aria-label="Settings form">
        <Card title="Profile" subtitle="Basic account information">
          <div className="formGrid">
            <div className="field">
              <label className="label" htmlFor="name">Full name</label>
              <input
                id="name"
                className="input"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                aria-label="Full name"
              />
              <div className="helper">Shown on reports and exports.</div>
            </div>

            <div className="field">
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                aria-label="Email"
              />
              <div className="helper">Used for notifications and alerts.</div>
            </div>
          </div>

          <hr className="hr" />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="submit" className="btn btnPrimary" aria-label="Save profile">Save changes</button>
          </div>
        </Card>

        <div style={{ height: 16 }} />

        <Card title="Preferences" subtitle="Customize how SpendSense behaves">
          <div className="formGrid">
            <div className="field">
              <label className="label" htmlFor="currency">Currency</label>
              <select
                id="currency"
                className="select"
                value={prefs.currency}
                onChange={(e) => setPrefs((p) => ({ ...p, currency: e.target.value }))}
                aria-label="Currency"
              >
                <option value="USD">USD — $</option>
                <option value="EUR">EUR — €</option>
                <option value="GBP">GBP — £</option>
              </select>
              <div className="helper">Used in dashboard totals and analytics.</div>
            </div>

            <div className="field">
              <label className="label" htmlFor="week">Start of week</label>
              <select
                id="week"
                className="select"
                value={prefs.startOfWeek}
                onChange={(e) => setPrefs((p) => ({ ...p, startOfWeek: e.target.value }))}
                aria-label="Start of week"
              >
                <option value="Mon">Monday</option>
                <option value="Sun">Sunday</option>
              </select>
              <div className="helper">Affects weekly summaries and charts.</div>
            </div>
          </div>

          <hr className="hr" />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="submit" className="btn btnPrimary" aria-label="Save preferences">Save changes</button>
          </div>
        </Card>

        <div style={{ height: 16 }} />

        <Card title="Notifications" subtitle="Control alert delivery">
          <div className="grid" style={{ gap: 12 }}>
            <label className="field" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox"
                checked={notifs.critical}
                onChange={(e) => setNotifs((n) => ({ ...n, critical: e.target.checked }))}
                aria-label="Enable critical alerts"
              />
              <div>
                <div style={{ fontWeight: 750 }}>Critical alerts</div>
                <div className="helper">Unusual spending, possible fraud, and large transactions.</div>
              </div>
            </label>

            <label className="field" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox"
                checked={notifs.warnings}
                onChange={(e) => setNotifs((n) => ({ ...n, warnings: e.target.checked }))}
                aria-label="Enable warning alerts"
              />
              <div>
                <div style={{ fontWeight: 750 }}>Warnings</div>
                <div className="helper">Budget drift, subscription creep, and category changes.</div>
              </div>
            </label>

            <label className="field" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox"
                checked={notifs.weeklyDigest}
                onChange={(e) => setNotifs((n) => ({ ...n, weeklyDigest: e.target.checked }))}
                aria-label="Enable weekly digest"
              />
              <div>
                <div style={{ fontWeight: 750 }}>Weekly digest</div>
                <div className="helper">Summary email every week with insights and top categories.</div>
              </div>
            </label>
          </div>

          <hr className="hr" />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="submit" className="btn btnPrimary" aria-label="Save notification settings">Save changes</button>
          </div>
        </Card>
      </form>
    </div>
  );
}
