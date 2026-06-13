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
