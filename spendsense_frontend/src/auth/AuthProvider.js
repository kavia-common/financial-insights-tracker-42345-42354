import React, { createContext, useContext, useMemo, useState } from "react";

/**
 * Stubbed AuthContext (rollback target).
 *
 * This is intentionally NOT connected to Supabase.
 * It provides a simple demo auth toggle so ProtectedRoute and UI scaffolding
 * can continue to work without any backend.
 */

const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Provides a stubbed auth state for demo/prototyping (no Supabase). */
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const value = useMemo(() => {
    const user = isAuthenticated
      ? {
          id: "demo-user",
          email: "demo@example.com",
          name: "Demo User",
        }
      : null;

    return {
      isAuthenticated,
      user,
      loading: false,

      // PUBLIC_INTERFACE
      signInDemo: () => {
        /** Sets demo auth to "signed in". */
        setIsAuthenticated(true);
      },

      // PUBLIC_INTERFACE
      signOutDemo: () => {
        /** Sets demo auth to "signed out". */
        setIsAuthenticated(false);
      },
    };
  }, [isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access stubbed auth context. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}
