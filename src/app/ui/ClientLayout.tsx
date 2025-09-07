"use client";

import React from "react";
import { motion } from 'motion/react'
import TopNav from "./TopNav";

export const sectionProps = {
    variants: {
        hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
        visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
    },
    transition: {
        duration: 0.3,
    },
}

export const VARIANTS_CONTAINER = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
        },
    },
}

type ClientLayoutProps = React.PropsWithChildren;

export default function ClientLayout({ children }: ClientLayoutProps) {
    const navRef = React.useRef<HTMLDivElement | null>(null);
    const [navHeight, setNavHeight] = React.useState(0);

    React.useEffect(() => {
        if (!navRef.current) return;
        const element = navRef.current;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setNavHeight(entry.contentRect.height);
            }
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return (
        <motion.main
            className="flex flex-col min-h-screen p-8 gap-8 max-w-3xl mx-auto"
            variants={VARIANTS_CONTAINER}
            initial="hidden"
            animate="visible"
            style={{ ['--topnav-h' as any]: `${navHeight}px` }}
        >
            <div ref={navRef}>
                <TopNav />
            </div>
            {children}
        </motion.main>
    );
}


