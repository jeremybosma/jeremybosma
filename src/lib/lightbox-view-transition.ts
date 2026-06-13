import type { CSSProperties } from "react";

export const LIGHTBOX_VT_HTML_CLASS = "gallery-lightbox-vt";

export const supportsViewTransition =
  typeof document !== "undefined" && "startViewTransition" in document;

export function mediaTransitionStyle(
  name: string | undefined
): CSSProperties | undefined {
  if (!name) return undefined;
  return { viewTransitionName: name };
}

type ViewTransitionResult = {
  finished: Promise<void>;
  ready: Promise<void>;
};

export function runLightboxViewTransition(
  update: () => void,
  onFinished?: () => void,
  waitForPaint = false,
  onReady?: () => void
) {
  if (!supportsViewTransition) {
    update();
    onReady?.();
    onFinished?.();
    return;
  }

  const start = (): ViewTransitionResult => {
    document.documentElement.classList.add(LIGHTBOX_VT_HTML_CLASS);
    const transition = (
      document as Document & {
        startViewTransition: (cb: () => void) => ViewTransitionResult;
      }
    ).startViewTransition(update);

    if (onReady) {
      void transition.ready.then(onReady).catch(() => onReady());
    }

    void transition.finished.finally(() => {
      document.documentElement.classList.remove(LIGHTBOX_VT_HTML_CLASS);
      onFinished?.();
    });
  };

  if (waitForPaint) {
    requestAnimationFrame(() => {
      requestAnimationFrame(start);
    });
    return;
  }

  start();
}
