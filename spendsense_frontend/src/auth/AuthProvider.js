import React, { createContext, useContext, useMemo, useState } from "react";

/**
 * Lightweight auth context stub.
 * This is intentionally NOT wired to any backend or identity provider yet.
 */

const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Provides a stub auth state and actions for route protection scaffolding. */
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // In a real app, these would call backend/Supabase/OAuth etc.
  const value = useMemo(() => {
    return {
      isAuthenticated,

      // PUBLIC_INTERFACE
      login: async () => {
        /** Simulates login. TODO: wire to real auth. */
        setIsAuthenticated(true);
      },

      // PUBLIC_INTERFACE
      logout: async () => {
        /** Simulates logout. TODO: wire to real auth. */
        setIsAuthenticated(false);
      },

      // PUBLIC_INTERFACE
      toggleAuth: () => {
        /** Convenience helper for local demos. TODO: remove when real auth is wired. */
        setIsAuthenticated((v) => !v);
      },
    };
  }, [isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access the AuthProvider value. */
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider />");
  }
  return ctx;
}
