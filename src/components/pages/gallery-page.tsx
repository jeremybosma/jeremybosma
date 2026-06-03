import React from "react";
import { createPortal, flushSync } from "react-dom";

type GalleryImage = { src: string; alt: string };
const images: GalleryImage[] = [
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

/** Wraps updates so root/main-content do not cross-fade (see globals.css). */
function runGalleryViewTransition(update: () => void, onFinished?: () => void) {
    if (!supportsViewTransition) {
        update();
        onFinished?.();
        return { finished: Promise.resolve() };
    }
    document.documentElement.classList.add(GALLERY_VT_HTML_CLASS);
    const transition = (
        document as Document & { startViewTransition: (cb: () => void) => { finished: Promise<void> } }
    ).startViewTransition(update);
    transition.finished.finally(() => {
        document.documentElement.classList.remove(GALLERY_VT_HTML_CLASS);
        onFinished?.();
    });
    return transition;
}

export default function GalleryPage() {
    const [selectedImage, setSelectedImage] = React.useState<GalleryImage | null>(null);
    /** Drives shared-element names for open/close transitions (thumbnail index). */
    const [vtFromIndex, setVtFromIndex] = React.useState<number | null>(null);
    const [portalReady, setPortalReady] = React.useState(false);
    /** When true: solid scrim only (no live backdrop-filter). When false: frosted scrim during VT morphs. */
    const [lightboxScrimSettled, setLightboxScrimSettled] = React.useState(false);

    React.useEffect(() => {
        setPortalReady(true);
    }, []);

    React.useEffect(() => {
        if (!selectedImage) {
            setLightboxScrimSettled(false);
        }
    }, [selectedImage]);

    const openLightbox = React.useCallback((img: GalleryImage, index: number) => {
        if (supportsViewTransition) {
            flushSync(() => {
                setVtFromIndex(index);
            });
            runGalleryViewTransition(() => {
                flushSync(() => {
                    setSelectedImage(img);
                    setVtFromIndex(null);
                    setLightboxScrimSettled(false);
                });
            }, () => {
                setLightboxScrimSettled(true);
            });
        } else {
            setSelectedImage(img);
            setLightboxScrimSettled(true);
        }
    }, []);

    const closeLightbox = React.useCallback(() => {
        if (!selectedImage) return;
        const idx = images.indexOf(selectedImage);
        if (idx < 0) {
            setSelectedImage(null);
            return;
        }
        if (supportsViewTransition) {
            flushSync(() => {
                setLightboxScrimSettled(false);
            });
            runGalleryViewTransition(() => {
                flushSync(() => {
                    setSelectedImage(null);
                    setVtFromIndex(idx);
                });
            }, () => {
                setVtFromIndex(null);
            });
        } else {
            setSelectedImage(null);
        }
    }, [selectedImage]);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                closeLightbox();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [closeLightbox]);

    const lightbox =
        selectedImage && portalReady ? (
            <div
                className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center"
                onClick={closeLightbox}
                role="presentation"
            >
                {/*
                  Frosted scrim only during VT: live backdrop-filter recomputes stronger when the
                  morph ends. After open, drop to solid dim so there is no extra blur on top of the
                  transition (csswg-drafts#9358).
                */}
                <div
                    className={
                        lightboxScrimSettled
                            ? "absolute inset-0 bg-black/72"
                            : "absolute inset-0 bg-black/60 backdrop-blur-md"
                    }
                    aria-hidden
                />
                <div
                    className="relative z-10 p-4"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    role="presentation"
                >
                    <img
                        src={selectedImage.src}
                        alt={selectedImage.alt}
                        className="max-h-[85dvh] w-auto max-w-[90vw] cursor-zoom-out object-contain"
                        style={{ viewTransitionName: "gallery-photo" }}
                        onClick={closeLightbox}
                    />
                    <p className="mt-3 text-center text-sm text-white/80">{selectedImage.alt}</p>
                </div>
            </div>
        ) : null;

    return (
        <>
            <section className="text-[17px]">
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map((img, index) => {
                        const imageKey = img.src;
                        const isPriority = index < 6;
                        const thumbVtName =
                            selectedImage === img
                                ? "none"
                                : vtFromIndex === index
                                  ? "gallery-photo"
                                  : undefined;
                        return (
                            <div key={imageKey}>
                                <button
                                    type="button"
                                    onClick={() => openLightbox(img, index)}
                                    className="block w-full cursor-zoom-in text-left"
                                    aria-label={`View ${img.alt} in fullscreen`}
                                >
                                    <div
                                        className="relative w-full aspect-[4/5] overflow-hidden rounded-md bg-secondary/60"
                                        style={{
                                            ...(thumbVtName !== undefined
                                                ? { viewTransitionName: thumbVtName }
                                                : {}),
                                        }}
                                    >
                                        <img
                                            src={img.src}
                                            alt={img.alt}
                                            className="h-full w-full object-cover"
                                            fetchPriority={isPriority ? "high" : "auto"}
                                            loading={isPriority ? "eager" : "lazy"}
                                        />
                                    </div>
                                    <p className="mt-2 text-[13px] text-muted-foreground">{img.alt}</p>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </section>

            {portalReady ? createPortal(lightbox, document.body) : null}
        </>
    );
}
