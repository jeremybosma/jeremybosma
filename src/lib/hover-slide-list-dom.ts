import { useEffect } from "react";

const boundLists = new WeakSet<HTMLElement>();

type HoverSlideVars = {
  "--hover-slide-x": string;
  "--hover-slide-y": string;
  "--hover-slide-w": string;
  "--hover-slide-h": string;
  "--hover-slide-opacity": string;
};

const initialVars: HoverSlideVars = {
  "--hover-slide-x": "0px",
  "--hover-slide-y": "0px",
  "--hover-slide-w": "0px",
  "--hover-slide-h": "0px",
  "--hover-slide-opacity": "0",
};

let observerStarted = false;

function applyVars(list: HTMLElement, vars: HoverSlideVars) {
  for (const [key, value] of Object.entries(vars)) {
    list.style.setProperty(key, value);
  }
}

function bindHoverSlideList(list: HTMLElement) {
  if (boundLists.has(list)) return;

  boundLists.add(list);

  let activeElement: HTMLElement | null = null;

  const setActiveItem = (element: HTMLElement | null) => {
    if (element === activeElement) return;

    activeElement = element;

    if (!element) {
      applyVars(list, initialVars);
      return;
    }

    const listRect = list.getBoundingClientRect();
    const itemRect = element.getBoundingClientRect();
    const wasHidden = list.style.getPropertyValue("--hover-slide-opacity") !== "1";

    if (wasHidden) {
      list.classList.add("hover-slide-list--instant");
    }

    applyVars(list, {
      "--hover-slide-x": `${itemRect.left - listRect.left + list.scrollLeft}px`,
      "--hover-slide-y": `${itemRect.top - listRect.top + list.scrollTop}px`,
      "--hover-slide-w": `${itemRect.width}px`,
      "--hover-slide-h": `${itemRect.height}px`,
      "--hover-slide-opacity": "1",
    });

    if (wasHidden) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          list.classList.remove("hover-slide-list--instant");
        });
      });
    }
  };

  const onMouseOver = (event: MouseEvent) => {
    const item = (event.target as Element | null)?.closest(".hover-slide-item");
    if (item instanceof HTMLElement && list.contains(item)) {
      setActiveItem(item);
    }
  };

  const onMouseLeave = (event: MouseEvent) => {
    const related = event.relatedTarget;
    if (related instanceof Node && list.contains(related)) return;
    setActiveItem(null);
  };

  const onFocusIn = (event: FocusEvent) => {
    const item = (event.target as Element | null)?.closest(".hover-slide-item");
    if (item instanceof HTMLElement && list.contains(item)) {
      setActiveItem(item);
    }
  };

  const onFocusOut = (event: FocusEvent) => {
    const related = event.relatedTarget;
    if (related instanceof Node && list.contains(related)) return;
    setActiveItem(null);
  };

  list.addEventListener("mouseover", onMouseOver);
  list.addEventListener("mouseleave", onMouseLeave);
  list.addEventListener("focusin", onFocusIn);
  list.addEventListener("focusout", onFocusOut);
}

function startHoverSlideObserver() {
  if (observerStarted || typeof MutationObserver === "undefined") return;

  observerStarted = true;

  const observer = new MutationObserver((mutations) => {
    let needsInstall = false;

    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (
          node.classList.contains("hover-slide-list") ||
          node.querySelector(".hover-slide-list")
        ) {
          needsInstall = true;
          break;
        }
      }
      if (needsInstall) break;
    }

    if (needsInstall) {
      installHoverSlideLists();
    }
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
}

export function installHoverSlideLists(root: ParentNode = document) {
  startHoverSlideObserver();

  for (const list of root.querySelectorAll(".hover-slide-list")) {
    if (list instanceof HTMLElement) {
      bindHoverSlideList(list);
    }
  }
}

export function scheduleHoverSlideLists() {
  installHoverSlideLists();
  requestAnimationFrame(() => {
    installHoverSlideLists();
    requestAnimationFrame(() => installHoverSlideLists());
  });
}

export function useInstallHoverSlideLists() {
  useEffect(() => {
    scheduleHoverSlideLists();
  }, []);
}
