export type VideoSource = {
  src: string;
  type: string;
};

export type VideoItem = {
  id: string;
  src: string;
  title: string;
  poster?: string;
  sources: VideoSource[];
};

export const videos: VideoItem[] = [
  {
    id: "sohereweare",
    src: "/videos/sohereweare.mp4",
    title: "So here we are",
    poster: "/videos/sohereweare-poster.jpg",
    sources: [
      { src: "/videos/sohereweare.webm", type: "video/webm" },
      { src: "/videos/sohereweare.mp4", type: "video/mp4" },
    ],
  },
];
