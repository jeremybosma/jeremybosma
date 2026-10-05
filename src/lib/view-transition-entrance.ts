import { useState } from "react";

// Runtime state resets on a full load, unlike history.state, which survives reloads.
let clientNavigated = false;

export function markViewTransitionNavigation() {
  clientNavigated = true;
}

/** Skip Motion entrance animations after client-side view-transition navigation. */
export function shouldSkipViewTransitionEntrance(): boolean {
  return clientNavigated;
}

/** Decide before the first render so Motion never starts a second entrance. */
export function useSkipViewTransitionEntrance(): boolean {
  const [skipEntrance] = useState(shouldSkipViewTransitionEntrance);
  return skipEntrance;
}
