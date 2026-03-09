import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PortalLayout from "../layouts/PortalLayout";
import { ProtectedRoute, PublicOnlyRoute } from "./routeGuards";

const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const TicketsPage = lazy(() => import("../pages/TicketsPage"));
const ReportsPage = lazy(() => import("../pages/ReportsPage"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const ReplyPage = lazy(() => import("../pages/ReplyPage"));
const ResetPasswordPage = lazy(() => import("../pages/ResetPasswordPage"));

function RouteFallback() {
  return <div className="routeLoadingScreen">Loading view...</div>;
}

export function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/reply" element={<ReplyPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<PortalLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
