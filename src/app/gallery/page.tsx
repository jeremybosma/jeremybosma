"use client";
import { AnimatePresence, motion } from "motion/react";
import React from "react";

import { Cambio as CambioRaw } from "cambio";
import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
const Cambio: any = CambioRaw as any;

import rotterdam from "../../../public/gallery/rotterdam.jpeg";
import fit2 from "../../../public/gallery/fit2.jpeg";
import boat from "../../../public/gallery/boat.jpeg";
import france3 from "../../../public/gallery/france3.jpeg";
import fit from "../../../public/gallery/fit.jpeg";
import polaroid from "../../../public/gallery/polaroid.jpeg";
import flowers from "../../../public/gallery/flowers.jpeg";
import conference from "../../../public/gallery/conference.jpeg";
import yacht from "../../../public/gallery/yacht.jpeg";
import dusseldorf from "../../../public/gallery/dusseldorf.jpeg";
import paper from "../../../public/gallery/paper.jpeg";
import france2 from "../../../public/gallery/france2.jpeg";
import goodeats from "../../../public/gallery/goodeats.jpeg";
import bag from "../../../public/gallery/bag.jpeg";
import groningen from "../../../public/gallery/groningen.jpeg";
import rip200 from "../../../public/gallery/rip200.jpeg";
import france from "../../../public/gallery/france.jpeg";
import doweevernotwork from "../../../public/gallery/doweevernotwork.jpeg";
import thelastnight from "../../../public/gallery/thelastnight.jpeg";
import kaufland from "../../../public/gallery/kaufland.jpeg";
import code from "../../../public/gallery/code.jpeg";

type GalleryImage = { src: StaticImageData; alt: string };
const images: GalleryImage[] = [
    { src: rotterdam, alt: "Rotterdam" },
    { src: fit2, alt: "fitpic" },
    { src: boat, alt: "Boat" },
    { src: france3, alt: "Working from the car" },
    { src: fit, alt: "fitflick" },
    { src: polaroid, alt: "Polaroid" },
    { src: flowers, alt: "Mother's day" },
    { src: conference, alt: "Conference ✝" },
    { src: yacht, alt: "Yacht" },
    { src: dusseldorf, alt: "Düsseldorf" },
    { src: paper, alt: "@jeremyssupply" },
    { src: france2, alt: "Working from Céreste" },
    { src: goodeats, alt: "Steak is my favorite" },
    { src: bag, alt: "Bag" },
    { src: groningen, alt: "Groningen Central 2025" },
    { src: rip200, alt: "RIP $200" },
    { src: france, alt: "Céreste" },
    { src: doweevernotwork, alt: "College" },
    { src: thelastnight, alt: "The last night" },
    { src: kaufland, alt: "fitpic" },
    { src: code, alt: "Programming" },
    // { src: love, alt: "Tried love (Failed 💀)" },
];

// Removed itemVariants; using inline animation configs on elements

function useColumnCount() {
    const [count, setCount] = React.useState(1);
    React.useEffect(() => {
        const sm = window.matchMedia("(min-width: 640px)");
        const lg = window.matchMedia("(min-width: 1024px)");
        const compute = () => setCount(lg.matches ? 3 : sm.matches ? 2 : 1);
        compute();
        const onChange = () => compute();
        sm.addEventListener("change", onChange);
        lg.addEventListener("change", onChange);
        return () => {
            sm.removeEventListener("change", onChange);
            lg.removeEventListener("change", onChange);
        };
    }, []);
    return count;
}

export default function Gallery() {
    const colCount = useColumnCount();
    const columns: GalleryImage[][] = Array.from({ length: colCount }, () => []);
    images.forEach((img, i) => {
        columns[i % colCount].push(img);
    });

    return (
        <AnimatePresence>
            <section className="text-[17px] sm:overflow-visible overflow-hidden">
                <div className="sm:overflow-visible sm:h-auto h-[calc(100vh-var(--topnav-h)-4rem)] overflow-y-auto overscroll-contain snap-y snap-mandatory -mx-4 px-4">
                    <div className="flex gap-4">
                        {columns.map((col, cIdx) => (
                            <div key={cIdx} className="shrink-0 grow-0 basis-full sm:basis-1/2 lg:basis-1/3 space-y-4">
                                {col.map((img, imgIdx) => (
                                    <motion.figure
                                        key={`${img.src.src}-${imgIdx}`}
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: cIdx * 0.08 } }}
                                        viewport={{ once: true, amount: 0.2 }}
                                        className="break-inside-avoid snap-start"
                                    >
                                        <Cambio.Root motion="smooth">
                                            <Cambio.Trigger className="block">
                                                <Image
                                                    src={img.src}
                                                    alt={img.alt}
                                                    placeholder="blur"
                                                    width={img.src.width}
                                                    height={img.src.height}
                                                    className="w-full h-auto object-cover rounded-md"
                                                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                                                    priority={cIdx === 0 && imgIdx === 0}
                                                />
                                            </Cambio.Trigger>
                                            <figcaption className="mt-2 text-[13px] text-muted-foreground">
                                                {img.alt}
                                            </figcaption>
                                            <Cambio.Portal>
                                                <Cambio.Backdrop className="fixed inset-0 z-50 bg-black/20 backdrop-blur-xs" />
                                                <Cambio.Popup className="z-50">
                                                    <Image
                                                        src={img.src}
                                                        alt={img.alt}
                                                        placeholder="blur"
                                                        width={img.src.width}
                                                        height={img.src.height}
                                                        className="w-full h-auto object-contain rounded-md max-w-[90vw] md:max-w-3xl max-h-[85vh]"
                                                        sizes="90vw"
                                                    />
                                                </Cambio.Popup>
                                            </Cambio.Portal>
                                        </Cambio.Root>
                                    </motion.figure>
                                ))}
                            </div>
                        ))}
                    </div>
                    <span className="text-sm mt-3 text-muted-foreground hidden md:block">Like what you see? Check my <Link href="https://www.instagram.com/jeremybosma_/" className="underline">Instagram</Link>.</span>
                </div>
            </section>
        </AnimatePresence>
    );
}