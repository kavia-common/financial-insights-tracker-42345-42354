import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

function LoadingGate() {
  return (
    <div
      className="card"
      role="status"
      aria-label="Checking authentication"
      style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
    >
      <div>
        <div style={{ fontWeight: 800 }}>Checking auth…</div>
        <div style={{ marginTop: 6, color: "rgba(17,24,39,0.65)", fontSize: 13 }}>
          Please wait while we verify your authentication status.
        </div>
      </div>
      <div className="skeleton" style={{ width: 96, height: 12, borderRadius: 999 }} aria-hidden="true" />
    </div>
  );
}

// PUBLIC_INTERFACE
export function ProtectedRoute({ children }) {
  /** Route guard based on stubbed demo auth state. */
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingGate />;

  if (!isAuthenticated) {
    // Keep Dashboard public and treat it as the "landing" destination.
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return children;
}
