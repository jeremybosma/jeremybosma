"use client";

import { motion } from "motion/react";
import { sectionProps } from "../ui/ClientLayout";
import Image from "next/image";

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
        title: "Xscape (Deluxe)",
        author: "Michael Jackson",
        image: "https://lastfm.freetls.fastly.net/i/u/500x500/c6ade3b17a4b43b9c3622f9f4e576fc6.jpg",
        type: "album",
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
        title: "Figure It Out",
        author: "Ian",
        image: "https://lastfm.freetls.fastly.net/i/u/500x500/f10df30d391b438ff053f1d8f31328ec.jpg",
        type: "single",
    },
    {
        title: "NOKIA",
        author: "Drake",
        image: "https://lastfm.freetls.fastly.net/i/u/500x500/bb5d2b034becb58b049c47a357d4c7ab.jpg",
        type: "single",
    },
    {
        title: "Donda 2",
        author: "Kanye West",
        image: "https://lastfm.freetls.fastly.net/i/u/500x500/cee50b7f4762d19b6df5f6a62920dc85.jpg",
        type: "album",
    },
    {
        title: "HIM ALL ALONG",
        author: "Gunna",
        image: "https://lastfm.freetls.fastly.net/i/u/300x300/c6d4bb6eb6dc821bfd97fbbe4b6e00c3.jpg",
        type: "single",
    },
    {
        title: "Views",
        author: "Drake",
        image: "https://lastfm.freetls.fastly.net/i/u/500x500/99e7715edfbd4c4519e3483a1779d574.jpg",
        type: "album",
    },
    {
        title: "back in the a",
        author: "Gunna",
        image: "https://lastfm.freetls.fastly.net/i/u/500x500/ddf416e359672be8a0c31c9a663acd79.jpg",
        type: "single",
    },
    {
        title: "Scorpion",
        author: "Drake",
        image: "https://lastfm.freetls.fastly.net/i/u/500x500/b42f8bf1987f3e1e4dc55d46d9c7bc3d.jpg",
        type: "album",
    },
    {
        title: "All To Myself,",
        author: "Future, Metro Boomin, The Weeknd",
        image: "https://lastfm.freetls.fastly.net/i/u/500x500/6a3dd879bb20457745a12ac0872c8821.jpg",
        type: "single",
    },
    {
        title: "Draft Day",
        author: "Drake",
        image: "https://lastfm.freetls.fastly.net/i/u/500x500/e569dbdf0ec2f74660e00f74f724ff32.jpg",
        type: "single",
    },
    {
        title: "Can't Tell Me Nothing",
        author: "Kanye West",
        image: "https://lastfm.freetls.fastly.net/i/u/500x500/8ddd1959a2bef460a5149b3e0cf5e18a.jpg",
        type: "single",
    },
    {
        title: "today i did good",
        author: "Gunna",
        image: "https://lastfm.freetls.fastly.net/i/u/500x500/ddf416e359672be8a0c31c9a663acd79.jpg",
        type: "single",
    },
    {
        title: "2 Mazza",
        author: "Smiley, Drake",
        image: "https://lastfm.freetls.fastly.net/i/u/500x500/90b17c8ecfd29b65b5011bdd325de1fa.jpg",
        type: "single",
    },
    {
        title: "Blue Green Red",
        author: "Drake",
        image: "https://lastfm.freetls.fastly.net/i/u/500x500/d67665dd545b647a6da55370931d0791.jpg",
        type: "single",
        unreleased: true,
    }
];

// Removed itemVariants; using inline animation configs on elements

export default function Music() {
    return (
        <>
            <motion.section
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                {...sectionProps}
            >
                {music.map((music, index) => (
                    <motion.div
                        className="flex gap-4 items-center p-4 transition-all duration-300 group"
                        key={music.title}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 } }}
                        viewport={{ once: false, amount: 0.2 }}
                    >
                        <Image src={music.image} alt={music.title} loading="eager" className="w-12 h-12 object-cover group-hover:scale-90 group-hover:rotate-3 transition-all duration-300" width={100} height={100} />
                        <div className="flex flex-col">
                            <h2>{music.title}</h2>
                            <p className="text-sm text-muted-foreground">{music.author}</p>
                            <p className="text-sm flex text-muted-foreground/80 gap-1 items-center">
                                {music.unreleased && <span>Unreleased</span>}{" "}
                                {music.unreleased
                                    ? music.type
                                    : music.type.charAt(0).toUpperCase() + music.type.slice(1)
                                }
                            </p>
                        </div>
                    </motion.div>
                ))}
            </motion.section>
        </>
    );
}