import React, { useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { IconBell, IconLayout, IconSettings, IconSparkles, IconWallet } from "./Icons";

const navItems = [
  { to: "/", title: "Dashboard", desc: "Overview & KPIs", Icon: IconLayout, end: true },
  { to: "/transactions", title: "Transactions", desc: "Search & review", Icon: IconWallet },
  { to: "/insights", title: "Insights", desc: "Patterns & trends", Icon: IconSparkles },
  { to: "/alerts", title: "Alerts", desc: "Anomalies & rules", Icon: IconBell },
  { to: "/settings", title: "Settings", desc: "Profile & preferences", Icon: IconSettings },
];

// PUBLIC_INTERFACE
export function Sidebar({ isOpen, onClose }) {
  /** Left navigation sidebar with active route highlighting and mobile drawer mode. */
  const location = useLocation();

  // Close sidebar on route change (mobile UX).
  useEffect(() => {
    if (isOpen) onClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <>
      {isOpen ? <div className="mobileOverlay" onClick={onClose} aria-label="Close menu overlay" /> : null}
      <aside className={`sidebar ${isOpen ? "sidebarOpen" : ""}`} aria-label="Sidebar navigation">
        <div className="brandRow">
          <Link to="/" className="brand" aria-label="SpendSense home">
            <div className="brandMark" aria-hidden="true" />
            <div className="brandText">
              <div className="brandTitle">SpendSense</div>
              <div className="brandSub">Analytics Dashboard</div>
            </div>
          </Link>

          <button type="button" className="menuBtn" onClick={onClose} aria-label="Close sidebar">
            ✕
          </button>
        </div>

        <nav className="nav" aria-label="Primary">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) => `navLink ${isActive ? "navLinkActive" : ""}`}
            >
              <n.Icon className="navIcon" title={n.title} />
              <span className="navMeta">
                <span className="navTitle">{n.title}</span>
                <span className="navDesc">{n.desc}</span>
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebarFooter">
          <div style={{ fontWeight: 700, color: "rgba(17,24,39,0.75)" }}>Ocean Professional</div>
          <div style={{ marginTop: 6 }}>Mock data • No backend wired</div>
        </div>
      </aside>
    </>
  );
}
