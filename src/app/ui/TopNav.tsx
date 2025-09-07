"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
    IconHouse, IconHouseFill, IconPhotoStack, IconPhotoStackFill, IconAirpodsProLeft, IconXLogo
} from "symbols-react";
import React from "react";

type NavItem = {
    label: string;
    href: string;
    external?: boolean;
    icon?: React.ElementType;
    iconActive?: React.ElementType;
};

const INTERNAL_ITEMS: NavItem[] = [
    { label: "Home", href: "/", icon: IconHouse, iconActive: IconHouseFill },
    { label: "Gallery", href: "/gallery", icon: IconPhotoStack, iconActive: IconPhotoStackFill },
    { label: "Music", href: "/music", icon: IconAirpodsProLeft, iconActive: IconAirpodsProLeft },
    // { label: "Curated", href: "/curated" },
];

const EXTERNAL_ITEM: NavItem = {
    label: "X",
    href: "https://x.com/jeremybosma_",
    external: true,
    icon: IconXLogo,
};

export default function TopNav() {
    const pathname = usePathname();

    const activeIndex = INTERNAL_ITEMS.findIndex((item) => item.href === pathname);

    const prevActiveIndexRef = React.useRef<number | null>(null);
    React.useEffect(() => {
        prevActiveIndexRef.current = activeIndex;
    }, [activeIndex]);

    return (
        <nav className="flex items-center justify-between">
            <div className="relative inline-flex items-center py-1 rounded-md">
                {INTERNAL_ITEMS.map((item, index) => {
                    const isActive = index === activeIndex;
                    const wasActive = prevActiveIndexRef.current === index;
                    const isDeactivating = wasActive && !isActive;
                    const prevIndex = prevActiveIndexRef.current;
                    const isActivating = isActive && prevIndex !== null && prevIndex !== index;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative px-3 py-1.5 text-sm rounded-xl transition-colors"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-nav-bg"
                                    className="absolute inset-0 rounded-xl bg-black/5 dark:bg-white/10"
                                    transition={{ type: "spring", stiffness: 500, damping: 40, mass: 1 }}
                                />
                            )}
                            <span className="relative z-[1] flex gap-2 items-center">
                                {item.icon && (
                                    <motion.span
                                        initial={false}
                                        animate={
                                            isDeactivating
                                                ? { filter: ["blur(2px)", "blur(0px)"] }
                                                : isActivating
                                                    ? { filter: ["blur(0px)", "blur(1px)", "blur(0px)"] }
                                                    : { filter: "blur(0px)" }
                                        }
                                        transition={
                                            isDeactivating
                                                ? { duration: 0.25, ease: "easeOut" }
                                                : isActivating
                                                    ? { duration: 0.2, ease: "easeOut" }
                                                    : { duration: 0 }
                                        }
                                        className="inline-flex"
                                    >
                                        {isActive && item.iconActive
                                            ? <item.iconActive className="w-4 h-4" />
                                            : <item.icon className="w-4 h-4" />}
                                    </motion.span>
                                )}
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>

            <Link
                href={EXTERNAL_ITEM.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-sm rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
                {EXTERNAL_ITEM.icon && (
                    <EXTERNAL_ITEM.icon className="w-4 h-4" />
                )}
                {!EXTERNAL_ITEM.icon && EXTERNAL_ITEM.label}
            </Link>
        </nav>
    );
}


