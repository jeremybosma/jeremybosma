"use client";

import { motion } from "motion/react";
import { sectionProps } from "../ui/ClientLayout";
// import Image from "next/image";

const music = [
    {
        title: "What Did I Miss?",
        author: "Drake",
        image: "https://lastfm.freetls.fastly.net/i/u/300x300/5ad5a7cbecc4e485797fc0201120de26.jpg",
        type: "single",
    },
    {
        title: "Donda (Deluxe)",
        author: "Kanye West",
        image: "https://lastfm.freetls.fastly.net/i/u/500x500/3951c3cc05c2015a171f6ffe95b833e7.jpg",
        type: "album",
    },
    {
        title: "Man Of The Year",
        author: "PlaqueBoyMax, UnoTheActivist",
        image: "https://lastfm.freetls.fastly.net/i/u/500x500/019735a7751741eff87e5a76b8408291.jpg",
        type: "single",
    },
    {
        title: "Wheels Fall Off",
        author: "Ty dolla $ign, Kanye West",
        image: "https://lastfm.freetls.fastly.net/i/u/500x500/cbb528cf12d731a7f10604f79e70d2ed.jpg",
        type: "single",
    },
    {
        title: "Enjoy The Show",
        author: "The Weeknd, Future",
        image: "https://lastfm.freetls.fastly.net/i/u/500x500/9b8a478ffae99410468b2e1935f07601.jpg",
        type: "single",
    },
    {
        title: "Banking On Me",
        author: "Gunna",
        image: "https://lastfm.freetls.fastly.net/i/u/500x500/294fba26bf26ce84bf121865b085b633.jpg",
        type: "single",
    },
    {
        title: "The College Dropout",
        author: "Kanye West",
        image: "https://lastfm.freetls.fastly.net/i/u/500x500/61d5e94c9aa712b29e283325bc5ae87f.jpg",
        type: "album",
    },
    {
        title: "Uuugly",
        author: "Drake",
        image: "https://lastfm.freetls.fastly.net/i/u/500x500/53487851a61d3e680b940dead7031dbd.jpg",
        type: "single",
    },
    {
        title: "act ii: date @ 8",
        author: "4batz & Drake",
        image: "https://lastfm.freetls.fastly.net/i/u/500x500/1e5757789b12375655dd6a01aed4fc16.jpg",
        type: "single",
    },
    {
        title: "Jesus Is King",
        author: "Kanye West",
        image: "https://lastfm.freetls.fastly.net/i/u/500x500/7477ac60ea2d22a4ec2281ae917d2d36.jpg",
        type: "album",
    },
    {
        title: "Xscape (Deluxe)",
        author: "Michael Jackson",
        image: "https://lastfm.freetls.fastly.net/i/u/500x500/c6ade3b17a4b43b9c3622f9f4e576fc6.jpg",
        type: "album",
    },
    {
        title: "Figure It Out",
        author: "Ian",
        image: "https://lastfm.freetls.fastly.net/i/u/500x500/f10df30d391b438ff053f1d8f31328ec.jpg",
        type: "single",
    },
];

const itemVariants = {
    hidden: { opacity: 0 },
    visible: (delay: number) => ({
        opacity: 1,
        transition: { duration: 0.35, ease: "easeOut", delay },
    }),
};

export default function Music() {
    return (
        <>
            <motion.section
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                {...sectionProps}
            >
                {music.map((music, index) => (
                    <motion.div
                        className="flex gap-4 items-center p-4"
                        key={music.title}
                        variants={itemVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false, amount: 0.2 }}
                        custom={index * 0.08}
                    >
                        <img src={music.image} alt={music.title} className="w-12 h-12 object-cover" loading="lazy" />
                        <div className="flex flex-col">
                            <h2>{music.title}</h2>
                            <p className="text-sm text-muted-foreground">{music.author}</p>
                            <p className="text-sm flex text-muted-foreground/80 gap-1 items-center">
                                {/* {music.unreleased && <span>unreleased</span>}{" "} */}
                                {music.type.charAt(0).toUpperCase() + music.type.slice(1)}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </motion.section>
        </>
    );
}