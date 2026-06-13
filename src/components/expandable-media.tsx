import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal, flushSync } from "react-dom";
import {
  mediaTransitionStyle,
  runLightboxViewTransition,
  supportsViewTransition,
} from "@/lib/lightbox-view-transition";

const VT_NAME = "gallery-photo";

function isVideoSrc(src: string): boolean {
  return /\.(mp4|webm|mov)(\?|$)/i.test(src);
}

type VideoSource = { src: string; type: string };

function ThumbnailVideo({
  src,
  sources,
  className = "",
  style,
  paused = false,
}: {
  src: string;
  sources?: VideoSource[];
  className?: string;
  style?: CSSProperties;
  paused?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (paused) {
      el.pause();
      el.muted = true;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.muted = true;
          void el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.45 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [paused, src, sources]);

  return (
    <video
      ref={ref}
      className={className}
      style={style}
      playsInline
      loop
      muted
      preload="metadata"
      tabIndex={-1}
      aria-hidden
    >
      {sources?.map((source) => (
        <source key={source.src} src={source.src} type={source.type} />
      ))}
      <source src={src} type="video/mp4" />
    </video>
  );
}

function LightboxVideo({
  src,
  sources,
  canPlay,
}: {
  src: string;
  sources?: VideoSource[];
  canPlay: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!canPlay) {
      el.pause();
      el.muted = true;
      return;
    }

    el.muted = false;
    void el.play().catch(() => {
      el.muted = true;
      void el.play().catch(() => {});
    });
  }, [src, canPlay]);

  useEffect(() => {
    return () => {
      ref.current?.pause();
    };
  }, []);

  return (
    <video
      ref={ref}
      className={`max-h-[85dvh] w-auto max-w-[90vw] object-contain transition-opacity duration-200 ${
        canPlay ? "opacity-100" : "opacity-0"
      }`}
      playsInline
      loop
      muted
    >
      {sources?.map((source) => (
        <source key={source.src} src={source.src} type={source.type} />
      ))}
      <source src={src} type="video/mp4" />
    </video>
  );
}

type ExpandableMediaBase = {
  className?: string;
  thumbnailClassName?: string;
};

type ExpandableImageProps = ExpandableMediaBase & {
  type?: "image";
  src: string;
  alt: string;
  width?: number;
  height?: number;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
};

type ExpandableVideoProps = ExpandableMediaBase & {
  type: "video";
  src: string;
  alt?: string;
  poster?: string;
  sources?: VideoSource[];
  autoPlayThumbnail?: boolean;
};

export type ExpandableMediaProps = ExpandableImageProps | ExpandableVideoProps;

export function ExpandableMedia(props: ExpandableMediaProps) {
  const {
    className = "",
    thumbnailClassName = "",
  } = props;

  const isVideo = props.type === "video" || isVideoSrc(props.src);
  const alt = props.type === "video" ? (props.alt ?? "Video") : props.alt;
  const poster =
    props.type === "video" ? props.poster : undefined;
  const sources = props.type === "video" ? props.sources : undefined;
  const autoPlayThumbnail = props.type === "video" && props.autoPlayThumbnail;
  const posterSrc = poster ?? (isVideo ? undefined : props.src);

  const [open, setOpen] = useState(false);
  const [vtOnThumbnail, setVtOnThumbnail] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const openLightbox = useCallback(() => {
    const enablePlayback = () => {
      if (isVideo) setCanPlay(true);
    };

    if (supportsViewTransition) {
      flushSync(() => {
        setCanPlay(false);
        setVtOnThumbnail(true);
      });
      runLightboxViewTransition(
        () => {
          flushSync(() => {
            setOpen(true);
            setVtOnThumbnail(false);
          });
        },
        undefined,
        true,
        enablePlayback
      );
    } else {
      setOpen(true);
      enablePlayback();
    }
  }, [isVideo]);

  const closeLightbox = useCallback(() => {
    if (!open) return;

    if (supportsViewTransition) {
      flushSync(() => setCanPlay(false));
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
      setCanPlay(false);
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

  const thumbnailVtName = open ? "none" : vtOnThumbnail ? VT_NAME : undefined;
  const thumbnailVtStyle = mediaTransitionStyle(thumbnailVtName);

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
          <div className="relative max-h-[85dvh] max-w-[90vw] cursor-zoom-out">
            {isVideo ? (
              <>
                {posterSrc ? (
                  <img
                    src={posterSrc}
                    alt=""
                    aria-hidden
                    className={
                      canPlay
                        ? "pointer-events-none absolute inset-0 m-auto max-h-[85dvh] w-auto max-w-[90vw] object-contain opacity-0 transition-opacity duration-200"
                        : "max-h-[85dvh] w-auto max-w-[90vw] object-contain"
                    }
                    style={mediaTransitionStyle(VT_NAME)}
                    draggable={false}
                  />
                ) : (
                  <video
                    src={props.src}
                    className={`max-h-[85dvh] w-auto max-w-[90vw] object-contain ${
                      canPlay ? "opacity-0" : ""
                    }`}
                    style={mediaTransitionStyle(VT_NAME)}
                    playsInline
                    muted
                    preload="metadata"
                    tabIndex={-1}
                    aria-hidden
                  />
                )}
                <LightboxVideo src={props.src} sources={sources} canPlay={canPlay} />
              </>
            ) : (
              <img
                src={props.src}
                alt={alt}
                className="max-h-[85dvh] w-auto max-w-[90vw] object-contain cursor-zoom-out"
                style={mediaTransitionStyle(VT_NAME)}
                draggable={false}
              />
            )}
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      <button
        type="button"
        onClick={openLightbox}
        className={`block cursor-zoom-in p-0 border-0 bg-transparent text-left ${className}`}
        aria-label={`View ${alt} fullscreen`}
      >
        {isVideo ? (
          <span
            className={`relative block overflow-hidden rounded-lg ${thumbnailClassName}`}
          >
            {autoPlayThumbnail ? (
              <ThumbnailVideo
                src={props.src}
                sources={sources}
                className="h-full w-full object-cover"
                style={thumbnailVtStyle}
                paused={open}
              />
            ) : posterSrc ? (
              <img
                src={posterSrc}
                alt={alt}
                className="w-full rounded-lg"
                style={thumbnailVtStyle}
                draggable={false}
              />
            ) : (
              <video
                src={props.src}
                className="w-full rounded-lg"
                style={thumbnailVtStyle}
                playsInline
                muted
                preload="metadata"
                tabIndex={-1}
                aria-hidden
              />
            )}
          </span>
        ) : (
          <img
            loading={props.type !== "video" ? props.loading : undefined}
            src={props.src}
            alt={alt}
            className={thumbnailClassName}
            width={props.type !== "video" ? props.width : undefined}
            height={props.type !== "video" ? props.height : undefined}
            fetchPriority={props.type !== "video" ? props.fetchPriority : undefined}
            style={thumbnailVtStyle}
            draggable={false}
          />
        )}
      </button>
      {portalReady ? createPortal(lightbox, document.body) : null}
    </>
  );
}
