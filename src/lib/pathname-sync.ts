import { useSyncExternalStore } from "react";

type PathnameSyncListener = () => void;

export const PATHNAME_SYNC_EVENT = "portfolio:pathname-sync";

let pathnameSyncListener: PathnameSyncListener | null = null;

export function registerPathnameSync(listener: PathnameSyncListener) {
  pathnameSyncListener = listener;
  return () => {
    if (pathnameSyncListener === listener) {
      pathnameSyncListener = null;
    }
  };
}

export function syncPathnameAfterNavigation() {
  pathnameSyncListener?.();
}

function subscribeToPathname(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  window.addEventListener("pageshow", onStoreChange);
  window.addEventListener(PATHNAME_SYNC_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("popstate", onStoreChange);
    window.removeEventListener("pageshow", onStoreChange);
    window.removeEventListener(PATHNAME_SYNC_EVENT, onStoreChange);
  };
}

export function usePathname(pathnameProp?: string) {
  return useSyncExternalStore(
    subscribeToPathname,
    // Back/forward changes location before the next page HTML is fetched. Keep
    // the shell and iframe host on the displayed route until the swap commits.
    () => document.documentElement.dataset.pathname ?? window.location.pathname,
    () => pathnameProp ?? "/"
  );
}
