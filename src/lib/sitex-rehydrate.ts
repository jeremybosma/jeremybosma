import { scheduleHoverSlideLists } from "@/lib/hover-slide-list-dom";
import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot, hydrateRoot } from "react-dom/client";
import { islands } from "virtual:sitex-islands";

const hydrationAttributes = {
  island: "data-sitex-island",
  mode: "data-sitex-mode",
  props: "data-sitex-props",
  staticChildren: "data-sitex-static-children",
} as const;

const CLIENT_SHELL_ISLAND = "/src/components/layouts/client-shell:default";

const freshRoots = new WeakMap<Element, ReturnType<typeof createRoot>>();
const hydratedRoots = new WeakMap<Element, ReturnType<typeof hydrateRoot>>();

function unmountIslandRoot(element: HTMLElement) {
  const freshRoot = freshRoots.get(element);
  if (freshRoot) {
    freshRoot.unmount();
    freshRoots.delete(element);
  }

  const hydratedRoot = hydratedRoots.get(element);
  if (hydratedRoot) {
    hydratedRoot.unmount();
    hydratedRoots.delete(element);
  }
}

function isHydrationMode(value: string | null): value is "load" | "only" {
  return value === "load" || value === "only";
}

function parseHydrationProps(value: string | null): Record<string, unknown> {
  return value ? JSON.parse(value) : {};
}

function isReactMounted(element: Element): boolean {
  return Object.keys(element).some((key) => key.startsWith("__reactContainer"));
}

function readStaticChildren(element: HTMLElement) {
  const staticChildrenElement = Array.from(element.children).find((child) =>
    child.hasAttribute(hydrationAttributes.staticChildren)
  );
  const staticChildrenHtml = staticChildrenElement?.innerHTML;
  staticChildrenElement?.remove();
  return staticChildrenElement
    ? createElement("div", {
        [hydrationAttributes.staticChildren]: "",
        dangerouslySetInnerHTML: { __html: staticChildrenHtml },
      })
    : undefined;
}

async function bootHydrationEntry(element: HTMLElement, fresh = false) {
  const id = element.getAttribute(hydrationAttributes.island);
  const mode = element.getAttribute(hydrationAttributes.mode);

  if (!id || id === CLIENT_SHELL_ISLAND || !isHydrationMode(mode)) {
    return;
  }

  if (!fresh && isReactMounted(element)) {
    return;
  }

  const loadEntry = islands[id];
  if (!loadEntry) {
    console.warn(`[sitex] No client island registered for "${id}".`);
    return;
  }

  const mod = await loadEntry();
  const Component = mod.default;
  const props = parseHydrationProps(element.getAttribute(hydrationAttributes.props));
  const staticChildren = readStaticChildren(element);

  if (mode === "only" || fresh) {
    unmountIslandRoot(element);

    flushSync(() => {
      const elementTree = createElement(Component, props, staticChildren);
      if (fresh && element.childNodes.length > 0) {
        const root = hydrateRoot(element, elementTree);
        hydratedRoots.set(element, root);
        return;
      }

      const root = createRoot(element);
      freshRoots.set(element, root);
      root.render(elementTree);
    });
    queueMicrotask(() => scheduleHoverSlideLists());
    return;
  }

  unmountIslandRoot(element);
  const root = hydrateRoot(element, createElement(Component, props, staticChildren));
  hydratedRoots.set(element, root);
  queueMicrotask(() => scheduleHoverSlideLists());
}

export async function rehydrateSitexIslands(
  root: ParentNode = document,
  options?: { fresh?: boolean }
) {
  const elements = root.querySelectorAll(`[${hydrationAttributes.island}]`);

  await Promise.all(
    [...elements].map((element) =>
      bootHydrationEntry(element as HTMLElement, options?.fresh)
    )
  );
}
