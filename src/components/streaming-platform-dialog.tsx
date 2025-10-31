"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { IconAppleLogo, IconSpotifyLogo, IconYoutubeLogo } from "symbols-react";

type Platform = "apple" | "spotify" | "youtube";

interface StreamingPlatformDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (platform: Platform, remember: boolean) => void;
    trackTitle: string;
    trackArtist: string;
    albumArt?: string;
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

    if (!isOpen) return null;

    const platforms = [
        {
            id: "apple" as Platform,
            name: "Apple Music",
            icon: <IconAppleLogo className="size-5" fill="white" />,
            color: "bg-red-500 hover:bg-red-600",
        },
        {
            id: "spotify" as Platform,
            name: "Spotify",
            icon: <IconSpotifyLogo className="size-5" fill="white" />,
            color: "bg-green-500 hover:bg-green-600",
        },
        {
            id: "youtube" as Platform,
            name: "YouTube",
            icon: <IconYoutubeLogo className="size-5" fill="white" />,
            color: "bg-red-600 hover:bg-red-700",
        },
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-background border rounded-lg shadow-lg max-w-md w-full p-6 space-y-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Track Info */}
                <div className="flex gap-4 items-center pb-4 border-b">
                    {albumArt && (
                        <Image
                            src={albumArt}
                            alt={trackTitle}
                            width={60}
                            height={60}
                            className="rounded object-cover"
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{trackTitle}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                            {trackArtist}
                        </p>
                    </div>
                </div>

                {/* Platform Selection */}
                <div>
                    <p className="text-sm font-medium mb-3">Open in:</p>
                    <div className="space-y-2">
                        {platforms.map((platform) => (
                            <button
                                key={platform.id}
                                onClick={() => onSelect(platform.id, rememberPreference)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg ${platform.color} text-white transition-colors`}
                            >
                                <span className="text-2xl">{platform.icon}</span>
                                <span className="font-medium">{platform.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Remember Preference */}
                <div className="flex items-center gap-2 pt-2">
                    <input
                        type="checkbox"
                        id="remember-preference"
                        checked={rememberPreference}
                        onChange={(e) => setRememberPreference(e.target.checked)}
                        className="w-4 h-4 rounded accent-black"
                    />
                    <label
                        htmlFor="remember-preference"
                        className="text-sm text-muted-foreground cursor-pointer"
                    >
                        Remember my preference
                    </label>
                </div>

                {/* Cancel Button */}
                <button
                    onClick={onClose}
                    className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

