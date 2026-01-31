"use client";

import React from "react";
import { useRouter } from "next/navigation";

type ViewTransitionLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: React.ReactNode;
};

/**
 * Link that runs navigation inside the View Transitions API so only
 * the content area (with view-transition-name) animates; sidebar stays static.
 */
export function ViewTransitionLink({ href, children, className, onClick, ...rest }: ViewTransitionLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!href.startsWith("/") || typeof document === "undefined") {
      onClick?.(e);
      return;
    }
    e.preventDefault();
    onClick?.(e);
    const useViewTransition = "startViewTransition" in document;
    if (useViewTransition) {
      window.__pendingViewTransitionHref = href;
      (document as Document & { startViewTransition: (cb: () => Promise<void>) => { finished: Promise<void> } }).startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            window.__viewTransitionResolve = resolve;
            router.push(href);
          })
      );
    } else {
      router.push(href);
    }
  };

  return (
    <a href={href} className={className} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
