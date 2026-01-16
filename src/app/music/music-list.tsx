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

    const openInPlatform = async (track: FetchedMusicData, platform: Platform) => {
        try {
            const params = new URLSearchParams({
                artist: track.author,
                track: track.title,
                type: track.type,
                platform,
            });

            const response = await fetch(`/api/music/streaming-url?${params}`);
            const data = await response.json();

            if (data.url) {
                window.open(data.url, "_blank");
            } else {
                // Fallback: construct a basic search URL
                const searchQuery = encodeURIComponent(`${track.author} ${track.title}`);
                let fallbackUrl = "";

                if (platform === "apple") {
                    fallbackUrl = `https://music.apple.com/us/search?term=${searchQuery}`;
                } else if (platform === "youtube") {
                    fallbackUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
                } else if (platform === "spotify") {
                    fallbackUrl = `https://open.spotify.com/search/${searchQuery}`;
                }

                if (fallbackUrl) {
                    window.open(fallbackUrl, "_blank");
                }
            }
        } catch (error) {
            console.error("Error opening track:", error);
            // Still try to open a search as fallback
            const searchQuery = encodeURIComponent(`${track.author} ${track.title}`);
            window.open(`https://www.google.com/search?q=${searchQuery}+music`, "_blank");
        }
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
                    <motion.button
                        type="button"
                        className="flex gap-4 items-center p-4 group cursor-pointer hover:bg-muted/50 rounded-lg transition-colors text-left w-full"
                        key={item.title}
                        onClick={() => handleTrackClick(item)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                        style={{
                            WebkitBackfaceVisibility: 'hidden',
                            WebkitTransform: 'translate3d(0, 0, 0)',
                            backfaceVisibility: 'hidden',
                            transform: 'translate3d(0, 0, 0)',
                            willChange: 'opacity',
                        }}
                    >
                        <Image
                            src={item.image}
                            alt={item.title}
                            loading="eager"
                            className="w-12 h-12 object-cover group-hover:scale-90 group-hover:rotate-3 transition-all duration-300"
                            width={100}
                            height={100}
                            style={{
                                WebkitBackfaceVisibility: 'hidden',
                                backfaceVisibility: 'hidden',
                            }}
                        />
                        <div className="flex flex-col">
                            <h2>{item.title}</h2>
                            <p className="text-sm text-muted-foreground">{item.author}</p>
                            <p className="text-sm flex text-muted-foreground/80 gap-1 items-center">
                                {item.unreleased && <span>Unreleased</span>}{" "}
                                {item.unreleased
                                    ? item.type
                                    : item.type.charAt(0).toUpperCase() + item.type.slice(1)
                                }
                            </p>
                        </div>
                    </motion.button>
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

