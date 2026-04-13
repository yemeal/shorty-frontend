import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls the document to the top on pathname changes (in-app navigation).
 * Search params alone do not reset scroll so profile list pagination/filter URL stays usable.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}
