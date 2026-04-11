import React from "react";
import { Navigate } from "react-router-dom";
import BrandLoader from "../../components/BrandLoader";
import { useAuth } from "../../AuthContext";

/**
 * Route guard for pages that require an active session.
 */
const RequireAuth = ({ children }) => {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 dark:text-slate-300">
        <BrandLoader label="Loading session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RequireAuth;
