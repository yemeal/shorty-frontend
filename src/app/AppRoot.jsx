import React from "react";
import AppProviders from "./providers/AppProviders";
import AppRouter from "./router/AppRouter";

/**
 * Top-level app composition root.
 */
const AppRoot = () => {
  return (
    <AppProviders>
      <div className="relative w-full min-h-screen">
        <AppRouter />
      </div>
    </AppProviders>
  );
};

export default AppRoot;
