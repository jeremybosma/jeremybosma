import { useEffect, useState } from "react";

/** Skip Motion entrance animations after client-side view-transition navigation. */
export function shouldSkipViewTransitionEntrance(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.history.state?.viewTransitionNavigation);
}

/** Defer entrance-skip checks until after hydration so SSR and client markup match. */
export function useSkipViewTransitionEntrance(): boolean {
  const [skipEntrance, setSkipEntrance] = useState(false);

  useEffect(() => {
    setSkipEntrance(shouldSkipViewTransitionEntrance());
  }, []);

  return skipEntrance;
}
