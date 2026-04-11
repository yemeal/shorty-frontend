import React from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import NetworkActivityIndicator from "../../components/NetworkActivityIndicator";
import AuthPage from "../../pages/AuthPage";
import HomePage from "../../pages/HomePage";
import NotFoundPage from "../../pages/NotFoundPage";
import PlaceholderPage from "../../pages/PlaceholderPage";
import ProfilePage from "../../pages/ProfilePage";
import RequireAuth from "./RequireAuth";

/**
 * Central app routes and navigation redirects.
 */
const AppRouter = () => {
  return (
    <Router>
      <NetworkActivityIndicator />
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
    </Router>
  );
};

export default AppRouter;
