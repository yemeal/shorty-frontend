import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import NetworkActivityIndicator from "../../components/NetworkActivityIndicator";
import RequireAuth from "./RequireAuth";
import ScrollToTop from "./ScrollToTop";
import RouteFallback from "./RouteFallback";

const HomePage = lazy(() => import("../../pages/HomePage"));
const AuthPage = lazy(() => import("../../pages/AuthPage"));
const ProfilePage = lazy(() => import("../../pages/ProfilePage"));
const PlaceholderPage = lazy(() => import("../../pages/PlaceholderPage"));
const NotFoundPage = lazy(() => import("../../pages/NotFoundPage"));

/**
 * Central app routes and navigation redirects.
 * Страницы грузятся лениво — меньше начальный JS, отдельные чанки по маршрутам.
 */
const AppRouter = () => {
  return (
    <Router>
      <ScrollToTop />
      <NetworkActivityIndicator />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<AuthPage defaultTab="login" />} />
          <Route path="/register" element={<AuthPage defaultTab="register" />} />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="/profile-placeholder"
            element={<Navigate to="/placeholder" replace />}
          />
          <Route path="/placeholder" element={<PlaceholderPage />} />
          <Route path="/not-found" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRouter;
