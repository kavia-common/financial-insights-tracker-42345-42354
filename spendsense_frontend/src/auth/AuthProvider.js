import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getClient } from "../lib/supabaseClient";

/**
 * Supabase-backed AuthContext.
 *
 * Provides:
 *  - reactive session/user state (persisted across reloads by supabase-js)
 *  - auth actions (signIn, signOut, signUp, resetPassword, signInWithOtp, signInWithOAuth)
 *  - getSupabase() accessor (singleton client; token management handled by supabase-js)
 */

const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Provides global Supabase auth state (session/user/loading) and auth actions. */
  const supabase = getClient();

  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);

  // While we resolve initial session from storage and subscribe to auth events.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;

        if (error) {
          // Keep state null but stop loading; downstream UI can show fallback.
          // eslint-disable-next-line no-console
          console.error("Supabase getSession() failed:", error);
          setSession(null);
          setUser(null);
        } else {
          setSession(data?.session || null);
          setUser(data?.session?.user || null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    bootstrap();

    // Keep local state in sync with Supabase auth changes.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession || null);
      setUser(newSession?.user || null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, [supabase]);

  const value = useMemo(() => {
    return {
      user,
      session,
      loading,

      /**
       * PUBLIC_INTERFACE
       * signIn
       * Email/password sign-in.
       */
      signIn: async ({ email, password }) => {
        /** Signs in with email/password via Supabase auth. */
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
      },

      /**
       * PUBLIC_INTERFACE
       * signOut
       */
      signOut: async () => {
        /** Signs out via Supabase auth. */
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },

      /**
       * PUBLIC_INTERFACE
       * signUp
       * Email/password sign-up.
       *
       * NOTE: If you use email confirmations, ensure your Supabase auth settings are configured
       * and the redirect site URL matches your deployment.
       */
      signUp: async ({ email, password, options }) => {
        /** Signs up with email/password via Supabase auth. */
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Respect caller options, but always provide a redirect target when available.
            ...(options || {}),
            emailRedirectTo:
              options?.emailRedirectTo ||
              process.env.REACT_APP_FRONTEND_URL ||
              window.location.origin,
          },
        });
        if (error) throw error;
        return data;
      },

      /**
       * PUBLIC_INTERFACE
       * resetPassword
       */
      resetPassword: async ({ email, redirectTo } = {}) => {
        /** Sends a password reset email via Supabase auth. */
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectTo || process.env.REACT_APP_FRONTEND_URL || window.location.origin,
        });
        if (error) throw error;
      },

      /**
       * PUBLIC_INTERFACE
       * signInWithOtp
       * Magic-link / OTP sign-in.
       */
      signInWithOtp: async ({ email, options } = {}) => {
        /** Initiates OTP/magic-link sign-in via Supabase auth. */
        const { data, error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            ...(options || {}),
            emailRedirectTo:
              options?.emailRedirectTo ||
              process.env.REACT_APP_FRONTEND_URL ||
              window.location.origin,
          },
        });
        if (error) throw error;
        return data;
      },

      /**
       * PUBLIC_INTERFACE
       * signInWithOAuth
       * OAuth provider sign-in (e.g., google, github).
       */
      signInWithOAuth: async ({ provider, options } = {}) => {
        /** Initiates OAuth sign-in via Supabase auth. */
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            ...(options || {}),
            redirectTo: options?.redirectTo || process.env.REACT_APP_FRONTEND_URL || window.location.origin,
          },
        });
        if (error) throw error;
        return data;
      },

      /**
       * PUBLIC_INTERFACE
       * getSupabase
       * Returns the singleton Supabase client.
       *
       * IMPORTANT: Do not manually attach Authorization headers; supabase-js handles tokens.
       */
      getSupabase: () => {
        /** Returns the singleton Supabase client used by the AuthProvider. */
        return supabase;
      },
    };
  }, [loading, session, supabase, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access Supabase-backed auth context. */
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider />");
  }
  return ctx;
}
