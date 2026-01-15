import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

// PUBLIC_INTERFACE
export function ProtectedRoute({ children }) {
  /** Simple placeholder route guard. TODO: replace redirect/UX once auth flows exist. */
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // For now, keep Dashboard public and treat it as the "landing" destination.
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return children;
}
