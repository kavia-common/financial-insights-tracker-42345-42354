import React, { useEffect, useId, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { IconBell, IconLayout, IconSettings, IconSparkles, IconWallet } from "./Icons";
import { useAuth } from "../auth/AuthProvider";

const navItems = [
  { to: "/", label: "Dashboard", Icon: IconLayout, end: true },
  { to: "/transactions", label: "Transactions", Icon: IconWallet },
  { to: "/insights", label: "Insights", Icon: IconSparkles },
  { to: "/alerts", label: "Alerts", Icon: IconBell },
  { to: "/settings", label: "Settings", Icon: IconSettings },
];

function initials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// PUBLIC_INTERFACE
export function Navbar({ brandTitle = "SpendSense" }) {
  /** Responsive top navbar: collapsible on mobile, links to main pages, and demo auth toggle. */
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const location = useLocation();
  const { isAuthenticated, toggleAuth } = useAuth();

  const user = useMemo(() => {
    // TODO: replace with real user profile
    return { name: "Jordan Smith", role: isAuthenticated ? "Signed in" : "Guest" };
  }, [isAuthenticated]);

  // Close dropdown on route change.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div className="navbar" role="navigation" aria-label="Primary navbar">
      <div className="navbarInner">
        <Link to="/" className="navbarBrand" aria-label={`${brandTitle} home`}>
          <span className="navbarBrandMark" aria-hidden="true" />
          <span className="navbarBrandText">
            <span className="navbarBrandTitle">{brandTitle}</span>
            <span className="navbarBrandSub">Ocean Professional</span>
          </span>
        </Link>

        <button
          type="button"
          className="navbarToggle"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden="true">{open ? "✕" : "☰"}</span>
        </button>

        <div className="navbarLinksDesktop" aria-label="Desktop navbar links">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) => `navbarLink ${isActive ? "navbarLinkActive" : ""}`}
            >
              <n.Icon className="navbarIcon" title={n.label} />
              <span>{n.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="navbarRight">
          <button
            type="button"
            className="navbarAuthBtn"
            onClick={toggleAuth}
            aria-label={isAuthenticated ? "Simulate logout" : "Simulate login"}
            title="Stub auth toggle (demo only)"
          >
            <span className="navbarAuthDot" aria-hidden="true" data-on={isAuthenticated ? "1" : "0"} />
            <span style={{ fontWeight: 750 }}>{isAuthenticated ? "Signed in" : "Guest"}</span>
          </button>

          <div className="navbarAvatar" aria-label="User summary">
            <span className="navbarAvatarCircle" aria-hidden="true">
              {initials(user.name)}
            </span>
            <span className="navbarAvatarMeta">
              <span className="navbarAvatarName">{user.name}</span>
              <span className="navbarAvatarRole">{user.role}</span>
            </span>
          </div>
        </div>
      </div>

      {open ? <div className="navbarOverlay" aria-label="Close navbar overlay" onClick={() => setOpen(false)} /> : null}

      <div id={panelId} className={`navbarPanel ${open ? "navbarPanelOpen" : ""}`} aria-label="Mobile navbar panel">
        {navItems.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) => `navbarPanelLink ${isActive ? "navbarPanelLinkActive" : ""}`}
          >
            <n.Icon className="navbarIcon" title={n.label} />
            <span>{n.label}</span>
          </NavLink>
        ))}

        <div className="navbarPanelFooter">
          <div style={{ color: "rgba(17,24,39,0.6)", fontSize: 12 }}>
            Protected routes demo: Insights & Alerts
          </div>
        </div>
      </div>
    </div>
  );
}
