import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AppLayout } from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Insights from "./pages/Insights";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import "./App.css";

// PUBLIC_INTERFACE
function App() {
  /** App routes for SpendSense analytics UI (with auth/protected-route scaffolding). */
  return (
    <AuthProvider>
      <Routes>
        <Route element={<AppLayout />}>
          {/* Keep Dashboard public for now */}
          <Route path="/" element={<Dashboard />} />

          <Route path="/transactions" element={<Transactions />} />

          {/* Demonstrate protected route usage */}
          <Route
            path="/insights"
            element={
              <ProtectedRoute>
                <Insights />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <Alerts />
              </ProtectedRoute>
            }
          />

          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
