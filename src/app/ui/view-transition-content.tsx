"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    __pendingViewTransitionHref?: string | null;
    __viewTransitionResolve?: (() => void) | null;
  }
}

/**
 * Wraps page content so only this area participates in view transitions.
 * Resolves the transition when pathname matches the pending navigation.
 */
export function ViewTransitionContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const pending = window.__pendingViewTransitionHref;
    if (pending != null && pathname === pending) {
      window.__viewTransitionResolve?.();
      window.__viewTransitionResolve = null;
      window.__pendingViewTransitionHref = null;
    }
  }, [pathname]);

  return (
    <div className="view-transition-content flex flex-col gap-8" data-view-transition-content>
      {children}
    </div>
  );
}
