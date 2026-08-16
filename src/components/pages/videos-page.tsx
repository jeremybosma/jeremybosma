import { ExpandableMedia } from "@/components/expandable-media";
import { videos, type VideoItem } from "@/lib/videos";

const SHOW_VIDEOS_COMING_SOON = false;

function VideoGridItem({
  src,
  title,
  poster,
  sources,
}: {
  src: string;
  title: string;
  poster?: string;
  sources: VideoItem["sources"];
}) {
  return (
    <figure className="flex min-w-0 w-full flex-col gap-2">
      <ExpandableMedia
        type="video"
        src={src}
        sources={sources}
        poster={poster}
        alt={title}
        autoPlayThumbnail
        className="w-full min-w-0"
        thumbnailClassName="relative aspect-video w-full overflow-hidden rounded-md bg-secondary/60"
      />
      <figcaption className="text-[12px] leading-tight text-muted-foreground">{title}</figcaption>
    </figure>
  );
}

export default function VideosPageContent() {
  if (videos.length === 0) {
    if (SHOW_VIDEOS_COMING_SOON) {
      return (
        <section className="page-panel-vt text-[17px] flex flex-col items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">Coming Soon</h1>
              <p className="text-muted-foreground max-w-sm">
                I&apos;m working on bringing you some video content. Check back later.
              </p>
            </div>
          </div>
        </section>
      );
    }

    return <section className="page-panel-vt text-[17px]" />;
  }

  return (
    <section className="page-panel-vt text-[17px]">
      <div className="grid w-full grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-[repeat(auto-fit,minmax(min(100%,max(24rem,calc((100%-3rem)/4))),1fr))]">
        {videos.map((video) => (
          <VideoGridItem
            key={video.id}
            src={video.src}
            title={video.title}
            poster={video.poster}
            sources={video.sources}
          />
        ))}
      </div>
    </section>
  );
}
