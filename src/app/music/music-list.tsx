"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import type { FetchedMusicData } from "@/lib/music-api";
import { StreamingPlatformDialog } from "@/components/streaming-platform-dialog";

interface MusicListProps {
    music: FetchedMusicData[];
}

type Platform = "apple" | "spotify" | "youtube";

const PREFERENCE_KEY = "preferred-music-platform";

export function MusicList({ music }: MusicListProps) {
    const [selectedTrack, setSelectedTrack] = useState<FetchedMusicData | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleTrackClick = (track: FetchedMusicData) => {
        // If unreleased, automatically use YouTube
        if (track.unreleased) {
            openInPlatform(track, "youtube");
            return;
        }

        // Check if user has a saved preference
        const savedPlatform = localStorage.getItem(PREFERENCE_KEY) as Platform | null;

        if (savedPlatform) {
            // Open directly in preferred platform
            openInPlatform(track, savedPlatform);
        } else {
            // Show platform selection dialog
            setSelectedTrack(track);
            setDialogOpen(true);
        }
    };

    const getFallbackUrl = (track: FetchedMusicData, platform: Platform) => {
        const searchQuery = encodeURIComponent(`${track.author} ${track.title}`);
        if (platform === "apple") {
            return `https://music.apple.com/us/search?term=${searchQuery}`;
        } else if (platform === "youtube") {
            return `https://www.youtube.com/results?search_query=${searchQuery}`;
        } else if (platform === "spotify") {
            return `https://open.spotify.com/search/${searchQuery}`;
        }
        return `https://www.google.com/search?q=${searchQuery}+music`;
    };

    const openInPlatform = (track: FetchedMusicData, platform: Platform) => {
        // Open window immediately to preserve user gesture (required for mobile browsers)
        const newWindow = window.open(getFallbackUrl(track, platform), "_blank");

        // Then try to get the exact URL and update the window location
        const params = new URLSearchParams({
            artist: track.author,
            track: track.title,
            type: track.type,
            platform,
        });

        fetch(`/api/music/streaming-url?${params}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.url && newWindow) {
                    newWindow.location.href = data.url;
                }
            })
            .catch((error) => {
                console.error("Error fetching streaming URL:", error);
                // Window already opened with fallback, so nothing more to do
            });
    };

    const handlePlatformSelect = (platform: Platform, remember: boolean) => {
        if (remember) {
            localStorage.setItem(PREFERENCE_KEY, platform);
        }

        if (selectedTrack) {
            openInPlatform(selectedTrack, platform);
        }

        setDialogOpen(false);
        setSelectedTrack(null);
    };

    return (
        <>
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {music.map((item, index) => (
                    <motion.div
                        key={item.title}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                    >
                        <button
                            type="button"
                            className="flex gap-4 items-center p-4 group cursor-pointer hover:bg-muted/50 rounded-lg transition-colors text-left w-full touch-manipulation"
                            onClick={() => handleTrackClick(item)}
                            aria-label={`Play ${item.title} by ${item.author}`}
                        >
                            <Image
                                src={item.image}
                                alt={`Album art for ${item.title} by ${item.author}`}
                                loading={index < 10 ? "eager" : "lazy"}
                                priority={index < 10}
                                className="w-12 h-12 object-cover group-hover:scale-90 group-hover:rotate-3 transition-all duration-300 pointer-events-none"
                                width={100}
                                height={100}
                                sizes="48px"
                                unoptimized={item.image.startsWith("data:")}
                                onError={(e) => {
                                    // Fallback to placeholder if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='12' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                                }}
                            />
                            <div className="flex flex-col pointer-events-none">
                                <h2>{item.title}</h2>
                                <p className="text-sm text-muted-foreground">{item.author}</p>
                                <p className="text-sm flex text-muted-foreground gap-1 items-center">
                                    {item.unreleased && <span>Unreleased</span>}{" "}
                                    {item.unreleased
                                        ? item.type
                                        : item.type.charAt(0).toUpperCase() + item.type.slice(1)
                                    }
                                </p>
                            </div>
                        </button>
                    </motion.div>
                ))}
            </section>

            {selectedTrack && (
                <StreamingPlatformDialog
                    isOpen={dialogOpen}
                    onClose={() => {
                        setDialogOpen(false);
                        setSelectedTrack(null);
                    }}
                    onSelect={handlePlatformSelect}
                    trackTitle={selectedTrack.title}
                    trackArtist={selectedTrack.author}
                    albumArt={selectedTrack.image}
                />
            )}
        </>
    );
}

