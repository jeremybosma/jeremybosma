"use client";
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
import bijenkorf from "../../../public/gallery/bijenkorf.jpeg";
import boat2 from "../../../public/gallery/boat2.jpeg";
import bottles from "../../../public/gallery/bottles.jpeg";
import breakfast from "../../../public/gallery/breakfast.jpeg";
import business from "../../../public/gallery/business.jpeg";
import cafe from "../../../public/gallery/cafe.jpeg";
import cappucino from "../../../public/gallery/cappucino.jpeg";
import celcius from "../../../public/gallery/celcius.jpeg";
import diploma from "../../../public/gallery/diploma.jpeg";
import f1 from "../../../public/gallery/f1.jpeg";
import fit3 from "../../../public/gallery/fit3.jpeg";
import freshtaper from "../../../public/gallery/freshtaper.jpeg";
import fuelingyacht from "../../../public/gallery/fuelingyacht.jpeg";
import gym from "../../../public/gallery/gym.jpeg";
import jesussaves from "../../../public/gallery/jesussaves.jpeg";
import mediamarkt from "../../../public/gallery/mediamarkt.jpeg";
import mirror from "../../../public/gallery/mirror.jpeg";
import mirror2 from "../../../public/gallery/mirror2.jpeg";
import redbullfrance from "../../../public/gallery/redbullfrance.jpeg";
import rotterdam2 from "../../../public/gallery/rotterdam2.jpeg";
import setup from "../../../public/gallery/setup.jpeg";
import student from "../../../public/gallery/student.jpeg";
import vlog from "../../../public/gallery/vlog.jpeg";
import wave from "../../../public/gallery/wave.jpeg";
import yacht2 from "../../../public/gallery/yacht2.jpeg";
import yacht3 from "../../../public/gallery/yacht3.jpeg";
import love from "../../../public/gallery/love.jpeg";
import integrate from "../../../public/gallery/integrate.jpeg";
import taper2 from "../../../public/gallery/taper2.jpeg";


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
    { src: kaufland, alt: "fitpic" },
    { src: code, alt: "Programming" },
    { src: bijenkorf, alt: "Bijenkorf" },
    { src: thelastnight, alt: "The last night" },
    { src: boat2, alt: "Boat" },
    { src: bottles, alt: "Bottles" },
    { src: breakfast, alt: "Breakfast" },
    { src: business, alt: "Business" },
    { src: cafe, alt: "Cafe" },
    { src: cappucino, alt: "Cappuccino" },
    { src: celcius, alt: "Celsius" },
    { src: diploma, alt: "Diploma" },
    { src: f1, alt: "F1" },
    { src: fit3, alt: "fitpic" },
    { src: freshtaper, alt: "Fresh taper" },
    { src: fuelingyacht, alt: "Fueling yacht" },
    { src: gym, alt: "Gym" },
    { src: jesussaves, alt: "Jesus saves" },
    { src: mediamarkt, alt: "MediaMarkt" },
    { src: integrate, alt: "Integrate" },
    { src: taper2, alt: "Taper" },
    { src: mirror, alt: "Mirror" },
    { src: mirror2, alt: "Mirror" },
    { src: redbullfrance, alt: "Red Bull France" },
    { src: rotterdam2, alt: "Rotterdam" },
    { src: setup, alt: "Setup" },
    { src: student, alt: "Student" },
    { src: vlog, alt: "Vlog" },
    { src: wave, alt: "Wave" },
    { src: yacht2, alt: "Yacht" },
    { src: yacht3, alt: "Yacht" },
    { src: love, alt: "No comment (failed 💀)" },
];

// Removed itemVariants; using inline animation configs on elements

export default function Gallery() {
    const [loadedMap, setLoadedMap] = React.useState<Record<string, boolean>>({});

    const handleImageLoaded = React.useCallback((key: string) => {
        setLoadedMap((prev) => ({ ...prev, [key]: true }));
    }, []);

    return (
        <section className="text-[17px] sm:overflow-visible overflow-hidden">
            <div className="sm:overflow-visible sm:h-auto h-[calc(100dvh-var(--topnav-h)-3.5rem)] overflow-y-auto overscroll-contain snap-y snap-mandatory -mx-4 px-4">
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
                    {images.map((img, index) => {
                        const imageKey = img.src.src;
                        const isLoaded = loadedMap[imageKey];
                        const isFirst = index === 0;
                        return (
                            <div
                                key={imageKey}
                                className={`mb-4 break-inside-avoid snap-start transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
                            >
                                <Cambio.Root motion="smooth">
                                    <Cambio.Trigger className="block w-full text-left">
                                        <div
                                            className="relative w-full overflow-hidden rounded-md bg-secondary/60"
                                            style={{ aspectRatio: `${img.src.width} / ${img.src.height}` }}
                                        >
                                            <Image
                                                src={img.src}
                                                alt={img.alt}
                                                fill={!isFirst}
                                                width={isFirst ? img.src.width : undefined}
                                                height={isFirst ? img.src.height : undefined}
                                                sizes="(min-width: 1024px) calc(min(100vw, 48rem) / 3), (min-width: 640px) calc(min(100vw, 48rem) / 2), min(100vw, 48rem)"
                                                className="object-cover"
                                                onLoad={() => handleImageLoaded(imageKey)}
                                            />
                                        </div>
                                        <p className="mt-2 text-[13px] text-muted-foreground">
                                            {img.alt}
                                        </p>
                                    </Cambio.Trigger>
                                    <Cambio.Portal>
                                        <Cambio.Backdrop className="fixed inset-0 z-50 bg-black/20 backdrop-blur-xs" />
                                        <Cambio.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                            <Image
                                                src={img.src}
                                                alt={img.alt}
                                                width={img.src.width}
                                                height={img.src.height}
                                                className="max-w-[90vw] max-h-[85dvh] w-auto h-auto object-contain rounded-md"
                                                sizes="90vw"
                                            />
                                        </Cambio.Popup>
                                    </Cambio.Portal>
                                </Cambio.Root>
                            </div>
                        );
                    })}
                </div>
                <p className="text-sm mt-3 text-muted-foreground hidden md:block">
                    Like what you see? Check my <Link href="https://www.instagram.com/jeremybosma_/" className="underline">Instagram</Link>.
                </p>
            </div>
        </section>
    );
}