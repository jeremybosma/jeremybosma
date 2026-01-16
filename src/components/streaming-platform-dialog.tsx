"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { IconAppleLogo, IconPlayFill, IconFilmStack, IconYoutubeLogo } from "symbols-react";

type Platform = "apple" | "spotify" | "youtube";

interface StreamingPlatformDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (platform: Platform, remember: boolean) => void;
    trackTitle: string;
    trackArtist: string;
    albumArt?: string;
}

function SpotifyIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
    );
}

export function StreamingPlatformDialog({
    isOpen,
    onClose,
    onSelect,
    trackTitle,
    trackArtist,
    albumArt,
}: StreamingPlatformDialogProps) {
    const [rememberPreference, setRememberPreference] = useState(false);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    const platforms = [
        {
            id: "apple" as Platform,
            name: "Apple Music",
            icon: IconAppleLogo,
        },
        {
            id: "spotify" as Platform,
            name: "Spotify",
            icon: SpotifyIcon,
        },
        {
            id: "youtube" as Platform,
            name: "YouTube",
            icon: IconYoutubeLogo,
        },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                    onTouchEnd={(e) => {
                        if (e.target === e.currentTarget) onClose();
                    }}
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="relative z-10 bg-background w-full max-w-sm p-6"
                        onClick={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                    >
                        {/* Track Info */}
                        <div className="flex gap-4 items-center mb-6">
                            {albumArt && (
                                <Image
                                    src={albumArt}
                                    alt={trackTitle}
                                    width={56}
                                    height={56}
                                    className="object-cover"
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate">{trackTitle}</h3>
                                <p className="text-sm text-black/60 dark:text-white/60 truncate">
                                    {trackArtist}
                                </p>
                            </div>
                        </div>

                        {/* Platform Selection */}
                        <div className="space-y-1">
                            {platforms.map((platform) => (
                                <button
                                    type="button"
                                    key={platform.id}
                                    onClick={() => onSelect(platform.id, rememberPreference)}
                                    className="w-full flex items-center gap-3 py-2.5 text-base font-medium text-muted-foreground hover:text-black dark:hover:text-white transition-colors"
                                >
                                    <platform.icon className="w-5 h-5" />
                                    {platform.name}
                                </button>
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-black/10 dark:bg-white/10 my-4" />

                        {/* Remember Preference */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="remember-preference"
                                checked={rememberPreference}
                                onChange={(e) => setRememberPreference(e.target.checked)}
                                className="w-4 h-4 accent-black dark:accent-white"
                            />
                            <label
                                htmlFor="remember-preference"
                                className="text-sm text-black/60 dark:text-white/60 cursor-pointer"
                            >
                                Remember my preference
                            </label>
                        </div>

                        {/* Cancel */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full mt-4 py-2 text-sm text-muted-foreground hover:text-black dark:hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

