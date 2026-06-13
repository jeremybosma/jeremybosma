import { useCallback, useEffect, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import type { CSSProperties } from "react";

const supportsViewTransition =
  typeof document !== "undefined" && "startViewTransition" in document;

const LIGHTBOX_VT_CLASS = "gallery-lightbox-vt";

function mediaTransitionStyle(name: string | undefined): CSSProperties | undefined {
  if (!name) return undefined;
  return { viewTransitionName: name };
}

type ViewTransitionResult = {
  finished: Promise<void>;
  ready: Promise<void>;
};

function runLightboxViewTransition(
  update: () => void,
  onFinished?: () => void,
  waitForPaint = false
) {
  if (!supportsViewTransition) {
    update();
    onFinished?.();
    return;
  }

  const start = (): ViewTransitionResult => {
    document.documentElement.classList.add(LIGHTBOX_VT_CLASS);
    const transition = (
      document as Document & {
        startViewTransition: (cb: () => void) => ViewTransitionResult;
      }
    ).startViewTransition(update);

    void transition.finished.finally(() => {
      document.documentElement.classList.remove(LIGHTBOX_VT_CLASS);
      onFinished?.();
    });

    return transition;
  };

  if (waitForPaint) {
    requestAnimationFrame(() => {
      requestAnimationFrame(start);
    });
    return;
  }

  start();
}

type ExpandablePhotoProps = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
};

export function ExpandablePhoto({
  src,
  alt,
  className = "",
  width,
  height,
  loading,
  fetchPriority,
}: ExpandablePhotoProps) {
  const [open, setOpen] = useState(false);
  const [vtOnThumbnail, setVtOnThumbnail] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const openLightbox = useCallback(() => {
    if (supportsViewTransition) {
      flushSync(() => setVtOnThumbnail(true));
      runLightboxViewTransition(
        () => {
          flushSync(() => {
            setOpen(true);
            setVtOnThumbnail(false);
          });
        },
        undefined,
        true
      );
    } else {
      setOpen(true);
    }
  }, []);

  const closeLightbox = useCallback(() => {
    if (!open) return;

    if (supportsViewTransition) {
      runLightboxViewTransition(
        () => {
          flushSync(() => {
            setOpen(false);
            setVtOnThumbnail(true);
          });
        },
        () => setVtOnThumbnail(false)
      );
    } else {
      setOpen(false);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) closeLightbox();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, closeLightbox]);

  const thumbnailVtName = open ? "none" : vtOnThumbnail ? "gallery-photo" : undefined;

  const lightbox =
    open && portalReady ? (
      <div
        className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center"
        onClick={closeLightbox}
        role="dialog"
        aria-modal="true"
        aria-label={alt}
      >
        <div
          className="absolute inset-0 bg-black/75"
          style={{ viewTransitionName: "gallery-scrim" }}
          aria-hidden
        />
        <div
          className="relative z-10 p-4"
          onClick={(e) => e.stopPropagation()}
          role="presentation"
        >
          <img
            src={src}
            alt={alt}
            className="max-h-[85dvh] w-auto max-w-[90vw] object-contain cursor-zoom-out"
            style={mediaTransitionStyle("gallery-photo")}
            draggable={false}
          />
        </div>
      </div>
    ) : null;

  return (
    <>
      <button
        type="button"
        onClick={openLightbox}
        className="block shrink-0 cursor-zoom-in p-0 border-0 bg-transparent"
        aria-label={`View ${alt} fullscreen`}
      >
        <img
          loading={loading}
          src={src}
          alt={alt}
          className={className}
          width={width}
          height={height}
          fetchPriority={fetchPriority}
          style={mediaTransitionStyle(thumbnailVtName)}
          draggable={false}
        />
      </button>
      {portalReady ? createPortal(lightbox, document.body) : null}
    </>
  );
}
