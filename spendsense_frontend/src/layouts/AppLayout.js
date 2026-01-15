import React, { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { Topbar } from "../components/Topbar";
import { AIAssistantChat } from "../components/AIAssistantChat";

function pageMeta(pathname) {
  if (pathname === "/") return { title: "Dashboard", subtitle: "Your spending at a glance" };
  if (pathname.startsWith("/transactions")) return { title: "Transactions", subtitle: "Search, sort and review activity" };
  if (pathname.startsWith("/insights")) return { title: "Insights", subtitle: "Trends, categories, and opportunities" };
  if (pathname.startsWith("/alerts")) return { title: "Alerts", subtitle: "Anomalies and proactive notifications" };
  if (pathname.startsWith("/settings")) return { title: "Settings", subtitle: "Profile, preferences and controls" };
  return { title: "SpendSense", subtitle: "Analytics" };
}

// PUBLIC_INTERFACE
export function AppLayout() {
  /** Application shell layout: responsive sidebar + topbar + navbar and routed outlet. */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const location = useLocation();

  const meta = useMemo(() => pageMeta(location.pathname), [location.pathname]);

  return (
    <div className="appRoot">
      <div className="shell">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="main" aria-label="Main content">
          <div className="mobileTopRow">
            <button
              type="button"
              className="menuBtn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="brandMark" aria-hidden="true" style={{ width: 26, height: 26, borderRadius: 10 }} />
              <strong style={{ letterSpacing: "-0.02em" }}>SpendSense</strong>
            </div>
            <div style={{ width: 44 }} />
          </div>

          {/* Complementary responsive top navbar (collapsible on mobile). */}
          <Navbar />

          <Topbar title={meta.title} subtitle={meta.subtitle} searchValue={search} onSearchChange={setSearch} />

          {/* Route content */}
          <Outlet context={{ search }} />
        </main>
      </div>

      {/* Persistent AI chat entrypoint (FAB + slide-in panel) */}
      <AIAssistantChat />
    </div>
  );
}
