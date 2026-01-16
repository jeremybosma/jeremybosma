"use client";

import React from "react";
import Navigation from "./navigation";

export const sectionProps = {
    variants: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    },
    transition: {
        duration: 0.3,
    },
    style: {
        WebkitBackfaceVisibility: 'hidden' as const,
        WebkitTransform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden' as const,
        transform: 'translate3d(0, 0, 0)',
        willChange: 'opacity' as const,
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
    return (
        <div className="min-h-screen">
            {/* Mobile Layout */}
            <div className="md:hidden flex flex-col p-6 gap-6">
                <Navigation />
                <main className="flex flex-col gap-8">{children}</main>
            </div>

            {/* Desktop Layout - Sidebar on left, content centered */}
            <div className="hidden md:block min-h-screen">
                <aside className="fixed top-0 left-0 h-screen w-48 p-8 flex flex-col">
                    <Navigation />
                </aside>
                <main className="ml-48 min-h-screen flex justify-center">
                    <div className="w-full max-w-2xl p-8 flex flex-col gap-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
