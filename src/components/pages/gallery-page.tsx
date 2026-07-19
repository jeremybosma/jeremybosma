import React from "react";
import { createPortal, flushSync } from "react-dom";
import type { GalleryHighlight, GalleryMedia } from "@/lib/gallery-highlights";

type GalleryImage = GalleryMedia;

/** Legacy flat gallery (used until `bun run sync:instagram` populates highlights). */
const legacyImages: GalleryImage[] = [
    { src: "/gallery/rotterdam.jpeg", alt: "Rotterdam" },
    { src: "/gallery/fit2.jpeg", alt: "fitpic" },
    { src: "/gallery/boat.jpeg", alt: "Boat" },
    { src: "/gallery/france3.jpeg", alt: "Working from the car" },
    { src: "/gallery/fit.jpeg", alt: "fitflick" },
    { src: "/gallery/polaroid.jpeg", alt: "Polaroid" },
    { src: "/gallery/flowers.jpeg", alt: "Mother's day" },
    { src: "/gallery/conference.jpeg", alt: "Conference ✝" },
    { src: "/gallery/yacht.jpeg", alt: "Yacht" },
    { src: "/gallery/dusseldorf.jpeg", alt: "Düsseldorf" },
    { src: "/gallery/paper.jpeg", alt: "@jeremyssupply" },
    { src: "/gallery/france2.jpeg", alt: "Working from Céreste" },
    { src: "/gallery/goodeats.jpeg", alt: "Steak is my favorite" },
    { src: "/gallery/bag.jpeg", alt: "Bag" },
    { src: "/gallery/groningen.jpeg", alt: "Groningen Central 2025" },
    { src: "/gallery/rip200.jpeg", alt: "RIP $200" },
    { src: "/gallery/france.jpeg", alt: "Céreste" },
    { src: "/gallery/doweevernotwork.jpeg", alt: "College" },
    { src: "/gallery/kaufland.jpeg", alt: "fitpic" },
    { src: "/gallery/code.jpeg", alt: "Programming" },
    { src: "/gallery/bijenkorf.jpeg", alt: "Bijenkorf" },
    { src: "/gallery/boat2.jpeg", alt: "Boat" },
    { src: "/gallery/bottles.jpeg", alt: "Bottles" },
    { src: "/gallery/breakfast.jpeg", alt: "Breakfast" },
    { src: "/gallery/business.jpeg", alt: "Business" },
    { src: "/gallery/cafe.jpeg", alt: "Cafe" },
    { src: "/gallery/cappucino.jpeg", alt: "Cappuccino" },
    { src: "/gallery/celcius.jpeg", alt: "Celsius" },
    { src: "/gallery/diploma.jpeg", alt: "Diploma" },
    { src: "/gallery/f1.jpeg", alt: "F1" },
    { src: "/gallery/fit3.jpeg", alt: "fitpic" },
    { src: "/gallery/freshtaper.jpeg", alt: "Fresh taper" },
    { src: "/gallery/fuelingyacht.jpeg", alt: "Fueling yacht" },
    { src: "/gallery/gym.jpeg", alt: "Gym" },
    { src: "/gallery/jesussaves.jpeg", alt: "Jesus saves" },
    { src: "/gallery/mediamarkt.jpeg", alt: "MediaMarkt" },
    { src: "/gallery/integrate.jpeg", alt: "Integrate" },
    { src: "/gallery/taper2.jpeg", alt: "Taper" },
    { src: "/gallery/mirror.jpeg", alt: "Mirror" },
    { src: "/gallery/mirror2.jpeg", alt: "Mirror" },
    { src: "/gallery/redbullfrance.jpeg", alt: "Red Bull France" },
    { src: "/gallery/rotterdam2.jpeg", alt: "Rotterdam" },
    { src: "/gallery/setup.jpeg", alt: "Setup" },
    { src: "/gallery/student.jpeg", alt: "Student" },
    { src: "/gallery/vlog.jpeg", alt: "Vlog" },
    { src: "/gallery/wave.jpeg", alt: "Wave" },
    { src: "/gallery/yacht2.jpeg", alt: "Yacht" },
    { src: "/gallery/yacht3.jpeg", alt: "Yacht" },
];

const supportsViewTransition =
    typeof document !== "undefined" && "startViewTransition" in document;

const GALLERY_VT_HTML_CLASS = "gallery-lightbox-vt";
const GALLERY_EXPAND_VT_HTML_CLASS = "gallery-expand-vt";

const PREVIEW_SLOTS = [
    {
        position:
            "left-[8%] top-1/2 -translate-y-1/2 -rotate-[10deg] group-hover/preview:-translate-x-2 group-hover/preview:-rotate-[16deg]",
    },
    {
        position:
            "right-[8%] top-1/2 -translate-y-1/2 rotate-[10deg] group-hover/preview:translate-x-2 group-hover/preview:rotate-[16deg]",
    },
    {
        position:
            "left-1/2 top-[10%] -translate-x-1/2 -rotate-[4deg] group-hover/preview:-translate-y-2 group-hover/preview:-rotate-[10deg]",
    },
] as const;

const GRID_COLS =
    "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6";

function hashString(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
        hash = (hash * 31 + value.charCodeAt(i)) | 0;
    }
    return hash;
}

function pickPreviewIndices(images: GalleryMedia[], highlightId: string, count = 3): number[] {
    const indexed = images.map((img, index) => ({ img, index }));
    if (indexed.length <= count) {
        return indexed.map(({ index }) => index);
    }
    return [...indexed]
        .sort(
            (a, b) =>
                hashString(`${highlightId}:${a.img.src}`) - hashString(`${highlightId}:${b.img.src}`)
        )
        .slice(0, count)
        .map(({ index }) => index);
}

function mediaVtName(highlightId: string, index: number): string {
    const safeId = highlightId.replace(/[^a-zA-Z0-9-]/g, "") || "hl";
    return `gallery-item-${safeId}-${index}`;
}

function isVideoMedia(img: GalleryImage): boolean {
    return img.type === "video" || img.src.endsWith(".mp4");
}

function mediaPosterSrc(img: GalleryImage, fallbackCover?: string): string {
    if (img.poster) return img.poster;
    if (!isVideoMedia(img)) return img.src;
    return fallbackCover ?? img.src;
}

function highlightCoverForSourceKey(
    highlights: GalleryHighlight[],
    sourceKey: string | null
): string | undefined {
    if (!sourceKey) return undefined;
    const [highlightId] = sourceKey.split(":");
    return highlights.find((h) => h.id === highlightId)?.cover;
}

function mediaTransitionStyle(
    name: string | undefined
): React.CSSProperties | undefined {
    if (!name) return undefined;
    return { viewTransitionName: name };
}

type ViewTransitionResult = {
    finished: Promise<void>;
    ready: Promise<void>;
};

function runGalleryViewTransition(
    update: () => void,
    onFinished?: () => void,
    htmlClass = GALLERY_VT_HTML_CLASS,
    waitForPaint = false,
    onReady?: () => void
) {
    if (!supportsViewTransition) {
        update();
        onReady?.();
        onFinished?.();
        return { finished: Promise.resolve(), ready: Promise.resolve() };
    }

    const start = (): ViewTransitionResult => {
        document.documentElement.classList.add(htmlClass);
        const transition = (
            document as Document & {
                startViewTransition: (cb: () => void) => ViewTransitionResult;
            }
        ).startViewTransition(update);

        if (onReady) {
            void transition.ready.then(onReady).catch(() => onReady());
        }

        void transition.finished.finally(() => {
            document.documentElement.classList.remove(htmlClass);
            onFinished?.();
        });

        return transition;
    };

    if (waitForPaint) {
        requestAnimationFrame(() => {
            requestAnimationFrame(start);
        });
        return { finished: Promise.resolve(), ready: Promise.resolve() };
    }

    return start();
}

type GalleryPageProps = {
    highlights?: GalleryHighlight[];
};

/** Static tile for collapsed fan: no playback or sound controls. */
function PreviewMedia({
    img,
    className = "",
    fallbackCover,
}: {
    img: GalleryImage;
    className?: string;
    fallbackCover?: string;
}) {
    if (isVideoMedia(img)) {
        return (
            <img
                src={mediaPosterSrc(img, fallbackCover)}
                alt=""
                className={`pointer-events-none h-full w-full object-cover ${className}`}
                loading="lazy"
                aria-hidden
            />
        );
    }

    return (
        <img
            src={img.src}
            alt=""
            className={`pointer-events-none h-full w-full object-cover ${className}`}
            loading="lazy"
            aria-hidden
        />
    );
}

/** Muted autoplay in the grid; sound is only in the lightbox. */
function StoryVideo({
    src,
    className = "",
    paused = false,
}: {
    src: string;
    className?: string;
    paused?: boolean;
}) {
    const ref = React.useRef<HTMLVideoElement>(null);

    React.useEffect(() => {
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
    }, [paused]);

    return (
        <video
            ref={ref}
            src={src}
            className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${className}`}
            playsInline
            loop
            muted
            preload="metadata"
            tabIndex={-1}
            aria-hidden
        />
    );
}

function LightboxVideo({ src, canPlay }: { src: string; canPlay: boolean }) {
    const ref = React.useRef<HTMLVideoElement>(null);

    React.useEffect(() => {
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

    React.useEffect(() => {
        return () => {
            ref.current?.pause();
        };
    }, []);

    return (
        <video
            ref={ref}
            src={src}
            className={`max-h-[85dvh] w-auto max-w-[90vw] object-contain transition-opacity duration-200 ${
                canPlay ? "opacity-100" : "opacity-0"
            }`}
            playsInline
            loop
            muted
        />
    );
}

function VtPoster({
    src,
    alt,
    transitionStyle,
    className = "",
    contain = false,
}: {
    src: string;
    alt: string;
    transitionStyle?: React.CSSProperties;
    className?: string;
    contain?: boolean;
}) {
    return (
        <img
            src={src}
            alt={alt}
            className={
                contain
                    ? `max-h-[85dvh] w-auto max-w-[90vw] object-contain ${className}`
                    : `h-full w-full object-cover ${className}`
            }
            style={transitionStyle}
            draggable={false}
        />
    );
}

function MediaCell({
    img,
    highlightId,
    index,
    lightboxOpen,
    lightboxSourceKey,
    vtFromIndex,
    globalIndex,
    onOpenMedia,
    morphTransition = false,
    fallbackCover,
    className = "",
}: {
    img: GalleryImage;
    highlightId: string;
    index: number;
    lightboxOpen: boolean;
    lightboxSourceKey: string | null;
    vtFromIndex: number | null;
    globalIndex: number;
    onOpenMedia: (img: GalleryImage, index: number, cellKey: string) => void;
    morphTransition?: boolean;
    fallbackCover?: string;
    className?: string;
}) {
    const cellKey = `${highlightId}:${index}`;
    const isVideo = isVideoMedia(img);
    const isLightboxSource = lightboxOpen && lightboxSourceKey === cellKey;

    // Source tile must lose gallery-photo before the lightbox gets it. Duplicate
    // names abort the open morph (close still works). See WICG/view-transitions.
    const lightboxVtName = isLightboxSource
        ? "none"
        : vtFromIndex === globalIndex
          ? "gallery-photo"
          : undefined;

    const lightboxVtStyle = mediaTransitionStyle(lightboxVtName);
    const posterSrc = isVideo ? mediaPosterSrc(img, fallbackCover) : img.src;

    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onOpenMedia(img, globalIndex, cellKey);
            }}
            className="block w-full cursor-zoom-in text-left"
            aria-label={`View ${img.alt} fullscreen`}
        >
            <div
                className={`relative w-full aspect-[9/16] overflow-hidden rounded-md bg-secondary/60 ${className}`}
                style={
                    morphTransition && !lightboxOpen
                        ? mediaTransitionStyle(mediaVtName(highlightId, index))
                        : undefined
                }
            >
                <VtPoster
                    src={posterSrc}
                    alt={img.alt}
                    transitionStyle={lightboxVtStyle}
                    className={isVideo ? "relative z-[1]" : undefined}
                />
                {isVideo ? (
                    <StoryVideo src={img.src} paused={lightboxOpen} />
                ) : null}
            </div>
        </button>
    );
}

function CollapsedHighlightCard({
    highlight,
    isActive,
    previewIndices,
    lightboxOpen,
    onToggle,
}: {
    highlight: GalleryHighlight;
    isActive: boolean;
    previewIndices: number[];
    lightboxOpen: boolean;
    onToggle: () => void;
}) {
    const showPreviews = !isActive;

    return (
        <button
            type="button"
            onClick={onToggle}
            aria-expanded={isActive}
            className={`group/preview relative mx-auto flex w-full max-w-[220px] flex-col items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                isActive ? "ring-2 ring-foreground/20 ring-offset-2 ring-offset-background" : ""
            }`}
        >
            <div className="relative h-[200px] w-full pointer-events-none">
                {showPreviews
                    ? previewIndices.map((imageIndex, slotIndex) => {
                          const img = highlight.images[imageIndex];
                          const slot = PREVIEW_SLOTS[slotIndex];
                          if (!img || !slot) return null;
                          return (
                              <div
                                  key={img.src}
                                  className={`absolute w-[38%] aspect-[9/16] overflow-hidden rounded-lg bg-secondary/60 shadow-md transition-transform duration-300 ease-out ${slot.position}`}
                                  style={
                                      lightboxOpen
                                          ? undefined
                                          : mediaTransitionStyle(
                                                mediaVtName(highlight.id, imageIndex)
                                            )
                                  }
                              >
                                  <PreviewMedia img={img} fallbackCover={highlight.cover} />
                              </div>
                          );
                      })
                    : null}
                <div
                    className="absolute left-1/2 top-1/2 z-10 size-[88px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border-2 border-background bg-secondary shadow-lg ring-1 ring-border/40 transition-transform duration-300 group-hover/preview:scale-[1.03]"
                    style={
                        lightboxOpen
                            ? undefined
                            : mediaTransitionStyle(
                                  `gallery-cover-${highlight.id.replace(/[^a-zA-Z0-9-]/g, "") || "hl"}`
                              )
                    }
                >
                    <img
                        src={highlight.cover}
                        alt=""
                        className="h-full w-full object-cover"
                        width={88}
                        height={88}
                    />
                </div>
            </div>
            <span className="text-[12px] leading-tight text-muted-foreground transition-colors group-hover/preview:text-foreground">
                {highlight.title}
            </span>
        </button>
    );
}

function ExpandedHighlightGrid({
    highlight,
    previewIndices,
    globalOffset,
    lightboxOpen,
    lightboxSourceKey,
    vtFromIndex,
    onOpenMedia,
}: {
    highlight: GalleryHighlight;
    previewIndices: number[];
    globalOffset: number;
    lightboxOpen: boolean;
    lightboxSourceKey: string | null;
    vtFromIndex: number | null;
    onOpenMedia: (img: GalleryImage, index: number, cellKey: string) => void;
}) {
    const previewSet = new Set(previewIndices);

    return (
        <div className={`grid ${GRID_COLS} gap-2 sm:gap-3`}>
            {highlight.images.map((img, index) => {
                const globalIndex = globalOffset + index;
                const isPreview = previewSet.has(index);
                return (
                    <div
                        key={`${highlight.id}-${img.src}`}
                        className={isPreview ? "contents" : "opacity-0 animate-[gallery-fade-in_0.45s_ease-out_forwards]"}
                        style={
                            isPreview ? undefined : { animationDelay: `${Math.min(index, 12) * 25}ms` }
                        }
                    >
                        <MediaCell
                            img={img}
                            highlightId={highlight.id}
                            index={index}
                            lightboxOpen={lightboxOpen}
                            lightboxSourceKey={lightboxSourceKey}
                            vtFromIndex={vtFromIndex}
                            globalIndex={globalIndex}
                            onOpenMedia={onOpenMedia}
                            morphTransition={isPreview}
                            fallbackCover={highlight.cover}
                        />
                    </div>
                );
            })}
        </div>
    );
}

function GalleryThumb({
    img,
    globalIndex,
    lightboxOpen,
    lightboxSourceKey,
    vtFromIndex,
    onOpen,
}: {
    img: GalleryImage;
    globalIndex: number;
    lightboxOpen: boolean;
    lightboxSourceKey: string | null;
    vtFromIndex: number | null;
    onOpen: (img: GalleryImage, index: number, cellKey: string) => void;
}) {
    return (
        <MediaCell
            img={img}
            highlightId="legacy"
            index={globalIndex}
            lightboxOpen={lightboxOpen}
            lightboxSourceKey={lightboxSourceKey}
            vtFromIndex={vtFromIndex}
            globalIndex={globalIndex}
            onOpenMedia={onOpen}
        />
    );
}

export default function GalleryPage({ highlights = [] }: GalleryPageProps) {
    const useHighlights = highlights.length > 0;

    const [selectedMedia, setSelectedMedia] = React.useState<GalleryImage | null>(null);
    const [lightboxSourceKey, setLightboxSourceKey] = React.useState<string | null>(null);
    const [lightboxFromIndex, setLightboxFromIndex] = React.useState<number | null>(null);
    const [vtFromIndex, setVtFromIndex] = React.useState<number | null>(null);
    const [portalReady, setPortalReady] = React.useState(false);
    const [expandedHighlightId, setExpandedHighlightId] = React.useState<string | null>(null);
    const [lightboxCanPlay, setLightboxCanPlay] = React.useState(false);

    const previewIndicesByHighlight = React.useMemo(() => {
        const map = new Map<string, number[]>();
        for (const highlight of highlights) {
            map.set(
                highlight.id,
                pickPreviewIndices(highlight.images, highlight.id)
            );
        }
        return map;
    }, [highlights]);

    const expandedHighlight = highlights.find((h) => h.id === expandedHighlightId) ?? null;
    const expandedGlobalOffset = React.useMemo(() => {
        if (!expandedHighlight) return 0;
        let offset = 0;
        for (const h of highlights) {
            if (h.id === expandedHighlight.id) return offset;
            offset += h.images.length;
        }
        return 0;
    }, [expandedHighlight, highlights]);

    React.useEffect(() => {
        setPortalReady(true);
    }, []);

    const toggleHighlight = React.useCallback((highlightId: string) => {
        const next = expandedHighlightId === highlightId ? null : highlightId;
        runGalleryViewTransition(
            () => {
                flushSync(() => {
                    setExpandedHighlightId(next);
                });
            },
            undefined,
            GALLERY_EXPAND_VT_HTML_CLASS
        );
    }, [expandedHighlightId]);

    const openLightbox = React.useCallback((img: GalleryImage, index: number, cellKey: string) => {
        const enablePlayback = () => {
            if (isVideoMedia(img)) {
                setLightboxCanPlay(true);
            }
        };

        if (supportsViewTransition) {
            flushSync(() => {
                setLightboxCanPlay(false);
                setVtFromIndex(index);
                setLightboxFromIndex(index);
            });
            runGalleryViewTransition(
                () => {
                    flushSync(() => {
                        setSelectedMedia(img);
                        setLightboxSourceKey(cellKey);
                        setVtFromIndex(null);
                    });
                },
                undefined,
                GALLERY_VT_HTML_CLASS,
                true,
                enablePlayback
            );
        } else {
            setLightboxSourceKey(cellKey);
            setLightboxFromIndex(index);
            setSelectedMedia(img);
            enablePlayback();
        }
    }, []);

    const closeLightbox = React.useCallback(() => {
        if (!selectedMedia || lightboxFromIndex === null) return;

        const returnIndex = lightboxFromIndex;

        if (supportsViewTransition) {
            flushSync(() => setLightboxCanPlay(false));
            runGalleryViewTransition(() => {
                flushSync(() => {
                    setSelectedMedia(null);
                    setLightboxSourceKey(null);
                    setVtFromIndex(returnIndex);
                });
            }, () => {
                setVtFromIndex(null);
                setLightboxFromIndex(null);
                setLightboxCanPlay(false);
            });
        } else {
            setLightboxCanPlay(false);
            setSelectedMedia(null);
            setLightboxSourceKey(null);
            setLightboxFromIndex(null);
        }
    }, [selectedMedia, lightboxFromIndex]);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (selectedMedia) {
                    closeLightbox();
                    return;
                }
                if (expandedHighlightId) {
                    runGalleryViewTransition(
                        () => {
                            flushSync(() => {
                                setExpandedHighlightId(null);
                            });
                        },
                        undefined,
                        GALLERY_EXPAND_VT_HTML_CLASS
                    );
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [closeLightbox, selectedMedia, expandedHighlightId]);

    const lightboxOpen = selectedMedia !== null;

    const lightbox =
        selectedMedia && portalReady ? (
            <div
                className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center"
                onClick={closeLightbox}
                role="dialog"
                aria-modal="true"
                aria-label={selectedMedia.alt}
            >
                <div
                    className="absolute inset-0 bg-black/75"
                    style={{ viewTransitionName: "gallery-scrim" }}
                    aria-hidden
                />
                <div
                    className="relative z-10 p-4"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    role="presentation"
                >
                    <div className="relative max-h-[85dvh] max-w-[90vw] cursor-zoom-out">
                        {isVideoMedia(selectedMedia) ? (
                            <>
                                <VtPoster
                                    src={mediaPosterSrc(
                                        selectedMedia,
                                        highlightCoverForSourceKey(highlights, lightboxSourceKey)
                                    )}
                                    alt={selectedMedia.alt}
                                    contain
                                    transitionStyle={mediaTransitionStyle("gallery-photo")}
                                    className={
                                        lightboxCanPlay
                                            ? "pointer-events-none absolute inset-0 m-auto opacity-0 transition-opacity duration-200"
                                            : undefined
                                    }
                                />
                                <LightboxVideo
                                    src={selectedMedia.src}
                                    canPlay={lightboxCanPlay}
                                />
                            </>
                        ) : (
                            <VtPoster
                                src={selectedMedia.src}
                                alt={selectedMedia.alt}
                                contain
                                transitionStyle={mediaTransitionStyle("gallery-photo")}
                            />
                        )}
                    </div>
                </div>
            </div>
        ) : null;

    return (
        <>
            <section className="page-panel-vt text-[17px] flex flex-col gap-8">
                {useHighlights ? (
                    <>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {highlights.map((highlight) => (
                                <CollapsedHighlightCard
                                    key={highlight.instagramId ?? highlight.id}
                                    highlight={highlight}
                                    isActive={expandedHighlightId === highlight.id}
                                    previewIndices={
                                        previewIndicesByHighlight.get(highlight.id) ?? []
                                    }
                                    lightboxOpen={lightboxOpen}
                                    onToggle={() => toggleHighlight(highlight.id)}
                                />
                            ))}
                        </div>

                        {expandedHighlight ? (
                            <div className="w-full">
                                <ExpandedHighlightGrid
                                    highlight={expandedHighlight}
                                    previewIndices={
                                        previewIndicesByHighlight.get(expandedHighlight.id) ?? []
                                    }
                                    globalOffset={expandedGlobalOffset}
                                    lightboxOpen={lightboxOpen}
                                    lightboxSourceKey={lightboxSourceKey}
                                    vtFromIndex={vtFromIndex}
                                    onOpenMedia={openLightbox}
                                />
                            </div>
                        ) : null}
                    </>
                ) : (
                    <div className={`grid ${GRID_COLS} gap-2 sm:gap-3`}>
                        {legacyImages.map((img, index) => (
                            <GalleryThumb
                                key={img.src}
                                img={img}
                                globalIndex={index}
                                lightboxOpen={lightboxOpen}
                                lightboxSourceKey={lightboxSourceKey}
                                vtFromIndex={vtFromIndex}
                                onOpen={openLightbox}
                            />
                        ))}
                    </div>
                )}
            </section>

            {portalReady ? createPortal(lightbox, document.body) : null}
        </>
    );
}
