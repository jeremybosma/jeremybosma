import { motion } from "motion/react";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { HoverSlideItem, HoverSlideList } from "@/components/hover-slide-list";
import {
  scheduleHoverSlideLists,
  useInstallHoverSlideLists,
} from "@/lib/hover-slide-list-dom";
import type { FetchedMusicData } from "@/lib/music-api";
import {
  buildMusicListItems,
  type MusicAlbumGroup,
  type MusicListItem,
} from "@/lib/music-list-groups";
import { orderMusicByPlaylist } from "@/lib/music-playlist-order";
import type { AppleMusicPlaylistTrack } from "@/lib/apple-music-playlist";
import { StreamingPlatformDialog } from "@/components/streaming-platform-dialog";
import { useSkipViewTransitionEntrance } from "@/lib/view-transition-entrance";

interface MusicListProps {
  music: FetchedMusicData[];
}

type Platform = "apple" | "spotify" | "youtube";

const PREFERENCE_KEY = "preferred-music-platform";

function trackTypeLabel(track: FetchedMusicData): string {
  if (track.unreleased) {
    return track.type;
  }

  return track.type.charAt(0).toUpperCase() + track.type.slice(1);
}

function AlbumArt({
  src,
  alt,
  eager,
  className = "w-12 h-12 object-cover group-hover:scale-90 group-hover:rotate-3 transition-all duration-300 pointer-events-none",
}: {
  src: string;
  alt: string;
  eager?: boolean;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      className={className}
      width={100}
      height={100}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = "/music/covers/placeholder.svg";
      }}
    />
  );
}

function TrackCard({
  track,
  eager,
  onClick,
  animateIn = false,
  animationDelay = 0,
}: {
  track: FetchedMusicData;
  eager?: boolean;
  onClick: (track: FetchedMusicData) => void;
  animateIn?: boolean;
  animationDelay?: number;
}) {
  return (
    <div
      className={
        animateIn
          ? "opacity-0 animate-[gallery-fade-in_0.45s_ease-out_forwards]"
          : undefined
      }
      style={animateIn ? { animationDelay: `${animationDelay}ms` } : undefined}
    >
      <HoverSlideItem
        as="button"
        type="button"
        className="flex gap-4 items-center p-4 group cursor-pointer rounded-lg text-left w-full touch-manipulation"
        onClick={() => onClick(track)}
        aria-label={`Play ${track.title} by ${track.author}`}
      >
        <AlbumArt
          src={track.image}
          alt={`Album art for ${track.title} by ${track.author}`}
          eager={eager}
        />
        <div className="flex flex-col pointer-events-none min-w-0">
          <h2 className="hover-slide-title truncate">{track.title}</h2>
          <p className="hover-slide-muted text-sm text-muted-foreground truncate">
            {track.author}
          </p>
          <p className="hover-slide-muted text-sm flex text-muted-foreground gap-1 items-center">
            {track.unreleased ? <span>Unreleased</span> : null}
            {trackTypeLabel(track)}
          </p>
        </div>
      </HoverSlideItem>
    </div>
  );
}

function AlbumGroupCard({
  group,
  isExpanded,
  eager,
  onToggle,
}: {
  group: MusicAlbumGroup;
  isExpanded: boolean;
  eager?: boolean;
  onToggle: () => void;
}) {
  return (
    <HoverSlideItem
      as="button"
      type="button"
      aria-expanded={isExpanded}
      className={`flex gap-4 items-center p-4 group cursor-zoom-in rounded-lg text-left w-full touch-manipulation ${
        isExpanded
          ? "hover-slide-item--pinned ring-2 ring-foreground/20 ring-offset-2 ring-offset-background"
          : ""
      }`}
      onClick={onToggle}
      aria-label={`${isExpanded ? "Collapse" : "Expand"} ${group.album} by ${group.author}, ${group.tracks.length} tracks`}
    >
      <AlbumArt
        src={group.image}
        alt={`Album art for ${group.album} by ${group.author}`}
        eager={eager}
      />
      <div className="flex flex-col pointer-events-none min-w-0">
        <h2 className="hover-slide-title truncate">
          {group.album}
          <span className="text-muted-foreground font-normal">
            {` (${group.tracks.length})`}
          </span>
        </h2>
        <p className="hover-slide-muted text-sm text-muted-foreground truncate">
          {group.author}
        </p>
        <p className="hover-slide-muted text-sm text-muted-foreground">Album</p>
      </div>
    </HoverSlideItem>
  );
}

function MusicGridItem({
  item,
  index,
  skipEntrance,
  expandedGroupKeys,
  onTrackClick,
  onToggleGroup,
}: {
  item: MusicListItem;
  index: number;
  skipEntrance: boolean;
  expandedGroupKeys: ReadonlySet<string>;
  onTrackClick: (track: FetchedMusicData) => void;
  onToggleGroup: (key: string) => void;
}) {
  return (
    <motion.div
      initial={skipEntrance ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: skipEntrance ? 0 : index * 0.03 }}
    >
      {item.kind === "album-group" ? (
        <AlbumGroupCard
          group={item}
          isExpanded={expandedGroupKeys.has(item.key)}
          eager={index < 10}
          onToggle={() => onToggleGroup(item.key)}
        />
      ) : (
        <TrackCard
          track={item.track}
          eager={index < 10}
          onClick={onTrackClick}
        />
      )}
    </motion.div>
  );
}

export function MusicList({ music: initialMusic }: MusicListProps) {
  useInstallHoverSlideLists();
  const [music, setMusic] = useState(initialMusic);
  const [selectedTrack, setSelectedTrack] = useState<FetchedMusicData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedGroupKeys, setExpandedGroupKeys] = useState<ReadonlySet<string>>(
    () => new Set()
  );
  const skipEntrance = useSkipViewTransitionEntrance();

  useEffect(() => {
    setMusic(initialMusic);
  }, [initialMusic]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/music/playlist-order")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Playlist sync failed (${response.status})`);
        }
        return response.json() as Promise<{ tracks?: AppleMusicPlaylistTrack[] }>;
      })
      .then((data) => {
        if (cancelled || !data.tracks?.length) return;
        setMusic(orderMusicByPlaylist(initialMusic, data.tracks));
      })
      .catch((error) => {
        console.error("Failed to sync music order with Apple Music playlist:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [initialMusic]);

  const listItems = useMemo(() => buildMusicListItems(music), [music]);

  useEffect(() => {
    scheduleHoverSlideLists();
  }, [expandedGroupKeys, listItems]);

  const openInPlatform = useCallback((track: FetchedMusicData, platform: Platform) => {
    const searchQuery = encodeURIComponent(`${track.author} ${track.title}`);
    const fallbackUrl =
      platform === "apple"
        ? `https://music.apple.com/us/search?term=${searchQuery}`
        : platform === "youtube"
          ? `https://www.youtube.com/results?search_query=${searchQuery}`
          : platform === "spotify"
            ? `https://open.spotify.com/search/${searchQuery}`
            : `https://www.google.com/search?q=${searchQuery}+music`;

    const newWindow = window.open(fallbackUrl, "_blank");

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
      });
  }, []);

  const handleTrackClick = useCallback(
    (track: FetchedMusicData) => {
      if (track.unreleased) {
        openInPlatform(track, "youtube");
        return;
      }

      const savedPlatform = localStorage.getItem(PREFERENCE_KEY) as Platform | null;

      if (savedPlatform) {
        openInPlatform(track, savedPlatform);
      } else {
        setSelectedTrack(track);
        setDialogOpen(true);
      }
    },
    [openInPlatform]
  );

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

  const toggleGroup = useCallback((key: string) => {
    setExpandedGroupKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpandedGroupKeys((current) => (current.size > 0 ? new Set() : current));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <HoverSlideList className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {listItems.map((item, index) => (
          <Fragment key={item.key}>
            <MusicGridItem
              item={item}
              index={index}
              skipEntrance={skipEntrance}
              expandedGroupKeys={expandedGroupKeys}
              onTrackClick={handleTrackClick}
              onToggleGroup={toggleGroup}
            />
            {item.kind === "album-group" && expandedGroupKeys.has(item.key)
              ? item.tracks.map((track, trackIndex) => (
                  <TrackCard
                    key={`${item.key}:${track.title}`}
                    track={track}
                    onClick={handleTrackClick}
                    animateIn
                    animationDelay={Math.min(trackIndex, 12) * 25}
                  />
                ))
              : null}
          </Fragment>
        ))}
      </HoverSlideList>

      {selectedTrack ? (
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
      ) : null}
    </>
  );
}

export default MusicList;
