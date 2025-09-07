"use client";
import { motion } from "motion/react";
import React from "react";

import { Cambio as CambioRaw } from "cambio";
import Link from "next/link";
const Cambio: any = CambioRaw as any;

const images = [
    { src: "/gallery/rotterdam.jpeg", alt: "Rotterdam" },
    { src: "/gallery/fit2.jpeg", alt: "fitpic" },
    { src: "/gallery/boat.jpeg", alt: "Boat" },
    { src: "/gallery/france3.jpeg", alt: "Working even in the car" },
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
    { src: "/gallery/thelastnight.jpeg", alt: "The last night" },
    { src: "/gallery/kaufland.jpeg", alt: "fitpic" },
    { src: "/gallery/code.jpeg", alt: "Programming" },
    // { src: "/gallery/love.jpeg", alt: "Tried love (Failed 💀)" },
];

const itemVariants = {
    hidden: { opacity: 0 },
    visible: (delay: number) => ({ opacity: 1, transition: { duration: 0.35, ease: "easeOut", delay } }),
};

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
    const columns: { src: string; alt: string }[][] = Array.from({ length: colCount }, () => []);
    images.forEach((img, i) => {
        columns[i % colCount].push(img);
    });

    return (
        <>
            <section className="text-[17px] sm:overflow-visible overflow-hidden">
                <div className="sm:overflow-visible sm:h-auto h-[calc(100svh-var(--topnav-h)-6rem)] overflow-y-auto overscroll-contain snap-y snap-mandatory -mx-4 px-4">
                    <div className="flex gap-4">
                        {columns.map((col, cIdx) => (
                            <div key={cIdx} className="shrink-0 grow-0 basis-full sm:basis-1/2 lg:basis-1/3 space-y-4">
                                {col.map((img) => (
                                    <motion.figure
                                        key={img.src}
                                        variants={itemVariants}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: false, amount: 0.2 }}
                                        custom={cIdx * 0.08}
                                        className="break-inside-avoid snap-start"
                                    >
                                        <Cambio.Root motion="smooth">
                                            <Cambio.Trigger className="rounded-md overflow-hidden block group">
                                                <div className="relative w-full">
                                                    <img
                                                        src={img.src}
                                                        alt={img.alt}
                                                        loading="lazy"
                                                        className="w-full h-auto object-cover"
                                                    />
                                                </div>
                                                <figcaption className="mt-2 text-[13px] text-muted-foreground">
                                                    {img.alt}
                                                </figcaption>
                                            </Cambio.Trigger>
                                            <Cambio.Portal>
                                                <Cambio.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
                                                <Cambio.Popup className="relative z-50 max-w-[90vw] max-h-[90vh] md:max-w-3xl p-2">
                                                    <img
                                                        src={img.src}
                                                        alt={img.alt}
                                                        className="max-w-full max-h-[85vh] w-auto h-auto object-contain"
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
        </>
    );
}