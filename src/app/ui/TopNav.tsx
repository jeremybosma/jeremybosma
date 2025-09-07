"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

type NavItem = {
    label: string;
    href: string;
    external?: boolean;
};

const INTERNAL_ITEMS: NavItem[] = [
    { label: "Home", href: "/" },
    { label: "Gallery", href: "/gallery" },
    { label: "Music", href: "/music" },
    { label: "Curated", href: "/curated" },
];

const EXTERNAL_ITEM: NavItem = {
    label: "X",
    href: "https://x.com/jeremybosma_",
    external: true,
};

export default function TopNav() {
    const pathname = usePathname();

    const activeIndex = INTERNAL_ITEMS.findIndex((item) => item.href === pathname);

    return (
        <nav className="flex items-center justify-between">
            <div className="relative inline-flex items-center py-1 rounded-md">
                {INTERNAL_ITEMS.map((item, index) => {
                    const isActive = index === activeIndex;
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
                            <span className="relative z-[1]">
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
                {EXTERNAL_ITEM.label}
            </Link>
        </nav>
    );
}


