export type GalleryMedia = {
  src: string;
  alt: string;
  type?: "image" | "video";
  /** First-frame JPG for video view-transition morphs (from sync:instagram). */
  poster?: string;
};

export type GalleryHighlight = {
  id: string;
  /** Instagram highlight reel id (stable across emoji-only titles). */
  instagramId?: string;
  title: string;
  cover: string;
  images: GalleryMedia[];
};

export type GalleryHighlightsData = {
  username: string;
  syncedAt: string | null;
  highlights: GalleryHighlight[];
};
