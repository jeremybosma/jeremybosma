/** Skip Motion entrance animations after client-side view-transition navigation. */
export function shouldSkipViewTransitionEntrance(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.history.state?.viewTransitionNavigation);
}
