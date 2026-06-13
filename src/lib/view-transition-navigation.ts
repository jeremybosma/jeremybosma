import { scheduleHoverSlideLists } from "@/lib/hover-slide-list-dom";
import { PATHNAME_SYNC_EVENT, syncPathnameAfterNavigation } from "@/lib/pathname-sync";
import { rehydrateSitexIslands } from "@/lib/sitex-rehydrate";
import { flushSync } from "react-dom";

const PAGE_VT_CLASS = "page-vt";

const supportsViewTransition =
  typeof document !== "undefined" && "startViewTransition" in document;

let navigationGeneration = 0;
let installed = false;

function isInternalPath(pathname: string): boolean {
  return pathname === "/" || /^\/(writing|supply|gallery|videos|music)(\/|$)/.test(pathname);
}

function isInternalLink(anchor: HTMLAnchorElement): boolean {
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) return false;

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  if (url.pathname.startsWith("/api/")) return false;

  return isInternalPath(url.pathname);
}

function shouldInterceptClick(event: MouseEvent): boolean {
  if (event.defaultPrevented) return false;
  if (event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  return true;
}

function syncDocumentHead(doc: Document) {
  const nextIcon = doc.querySelector('link[rel="icon"]');
  const currentIcon = document.querySelector('link[rel="icon"]');

  if (nextIcon && currentIcon) {
    currentIcon.setAttribute("href", nextIcon.getAttribute("href") ?? "/favicon.ico");
  }
}

function applyNavigationUpdate(
  doc: Document,
  url: string,
  options?: { history?: "push" | "replace" | "none" }
) {
  const title = doc.title;
  const pathname = new URL(url, window.location.href).pathname;

  swapViewTransitionContent(doc);
  document.title = title;
  document.documentElement.dataset.pathname = pathname;
  syncDocumentHead(doc);

  if (options?.history === "replace") {
    window.history.replaceState({ viewTransitionNavigation: true }, "", url);
  } else if (options?.history !== "none") {
    window.history.pushState({ viewTransitionNavigation: true }, "", url);
  }

  window.dispatchEvent(new Event(PATHNAME_SYNC_EVENT));

  flushSync(() => {
    syncPathnameAfterNavigation();
  });
}

function swapViewTransitionContent(doc: Document) {
  const currentContainers = document.querySelectorAll("[data-view-transition-content]");

  for (const current of currentContainers) {
    const variant = current.classList.contains("view-transition-content--mobile")
      ? "mobile"
      : "desktop";
    const next = doc.querySelector(
      `[data-view-transition-content].view-transition-content--${variant}`
    );

    if (!next) {
      throw new Error("Missing view transition content in fetched page");
    }

    current.innerHTML = next.innerHTML;
    revealMotionSsrContent(current);
  }
}

/** Motion SSR leaves opacity:0 inline; reveal so VT snapshots and pre-hydration paint aren't blank. */
function revealMotionSsrContent(root: ParentNode) {
  for (const el of root.querySelectorAll<HTMLElement>("[style]")) {
    if (el.style.opacity === "0") {
      el.style.opacity = "1";
    }
  }
}

function runPageViewTransition(update: () => void): Promise<void> {
  if (!supportsViewTransition) {
    update();
    return Promise.resolve();
  }

  document.documentElement.classList.add(PAGE_VT_CLASS);

  const transition = (
    document as Document & {
      startViewTransition: (cb: () => void) => { finished: Promise<void> };
    }
  ).startViewTransition(() => {
    update();
    window.scrollTo(0, 0);
  });

  return transition.finished.finally(() => {
    document.documentElement.classList.remove(PAGE_VT_CLASS);
  });
}

async function navigateToUrl(
  url: string,
  options?: { history?: "push" | "replace" | "none" }
): Promise<void> {
  const generation = ++navigationGeneration;
  const response = await fetch(url, {
    headers: { Accept: "text/html" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  const html = await response.text();
  if (generation !== navigationGeneration) return;

  const doc = new DOMParser().parseFromString(html, "text/html");

  const update = () => {
    applyNavigationUpdate(doc, url, options);
  };

  // Hydrate only after the view transition finishes. Rehydrating during the
  // transition gets overwritten when the browser commits the captured snapshot
  // (SSR motion markup keeps opacity:0), leaving a blank page and dead islands.
  await runPageViewTransition(update);

  const containers = document.querySelectorAll("[data-view-transition-content]");
  await Promise.all(
    [...containers].map((container) => rehydrateSitexIslands(container, { fresh: true }))
  );

  scheduleHoverSlideLists();
}

async function onDocumentClick(event: MouseEvent) {
  if (!shouldInterceptClick(event)) return;

  const anchor = (event.target as Element | null)?.closest("a");
  if (!(anchor instanceof HTMLAnchorElement) || !isInternalLink(anchor)) return;

  const targetPath = new URL(anchor.href, window.location.href).pathname;
  const currentPath = window.location.pathname;

  if (!isInternalPath(currentPath) || !isInternalPath(targetPath)) return;
  if (targetPath === currentPath) return;

  event.preventDefault();

  try {
    await navigateToUrl(targetPath);
  } catch {
    window.location.assign(anchor.href);
  }
}

function onPopState() {
  const path = window.location.pathname;
  if (!isInternalPath(path)) {
    window.location.reload();
    return;
  }

  void navigateToUrl(path, { history: "none" }).catch(() => {
    window.location.reload();
  });
}

export function installViewTransitionNavigation(): () => void {
  if (installed || typeof window === "undefined") return () => {};

  installed = true;
  document.addEventListener("click", onDocumentClick);
  window.addEventListener("popstate", onPopState);

  return () => {
    installed = false;
    navigationGeneration += 1;
    document.removeEventListener("click", onDocumentClick);
    window.removeEventListener("popstate", onPopState);
  };
}
