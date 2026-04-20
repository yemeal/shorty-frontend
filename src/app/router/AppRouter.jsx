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
import CookieNotice from "../../shared/ui/CookieNotice";

const HomePage = lazy(() => import("../../pages/HomePage"));
const AuthPage = lazy(() => import("../../pages/AuthPage"));
const ProfilePage = lazy(() => import("../../pages/ProfilePage"));
const ProfileEditPage = lazy(() => import("../../pages/ProfileEditPage"));
const PlaceholderPage = lazy(() => import("../../pages/PlaceholderPage"));
const NotFoundPage = lazy(() => import("../../pages/NotFoundPage"));
const LegalPage = lazy(() => import("../../pages/LegalPage"));

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
            path="/profile/edit"
            element={
              <RequireAuth>
                <ProfileEditPage />
              </RequireAuth>
            }
          />
          <Route
            path="/profile-placeholder"
            element={<Navigate to="/placeholder" replace />}
          />
          <Route path="/placeholder" element={<PlaceholderPage />} />
          <Route path="/legal/privacy" element={<LegalPage docKey="privacy" />} />
          <Route path="/legal/terms" element={<LegalPage docKey="terms" />} />
          <Route path="/legal/cookies" element={<LegalPage docKey="cookies" />} />
          <Route path="/legal/contacts" element={<LegalPage docKey="contacts" />} />
          <Route path="/not-found" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </Suspense>
      <CookieNotice />
    </Router>
  );
};

export default AppRouter;
