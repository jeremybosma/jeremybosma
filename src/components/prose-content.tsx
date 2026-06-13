"use client";

import { useEffect, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ExpandableMedia } from "@/components/expandable-media";

type ProseContentProps = {
  html: string;
  className?: string;
};

export function ProseContent({ html, className = "prose" }: ProseContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const roots: Root[] = [];

    for (const img of container.querySelectorAll("img")) {
      const src = img.getAttribute("src");
      if (!src) continue;

      const mountPoint = document.createElement("span");
      mountPoint.className = "block";
      img.replaceWith(mountPoint);

      const root = createRoot(mountPoint);
      root.render(
        <ExpandableMedia
          src={src}
          alt={img.getAttribute("alt") ?? ""}
          className="w-full"
          thumbnailClassName={img.className || "rounded-lg my-4"}
          width={parseOptionalInt(img.getAttribute("width"))}
          height={parseOptionalInt(img.getAttribute("height"))}
        />
      );
      roots.push(root);
    }

    for (const video of container.querySelectorAll("video")) {
      const src = video.getAttribute("src") ?? video.querySelector("source")?.getAttribute("src");
      if (!src) continue;

      const mountPoint = document.createElement("span");
      mountPoint.className = "block my-4";
      video.replaceWith(mountPoint);

      const root = createRoot(mountPoint);
      root.render(
        <ExpandableMedia
          type="video"
          src={src}
          alt={video.getAttribute("aria-label") ?? video.getAttribute("title") ?? "Video"}
          poster={video.getAttribute("poster") ?? undefined}
          className="w-full"
          thumbnailClassName={video.className || "rounded-lg"}
        />
      );
      roots.push(root);
    }

    return () => {
      for (const root of roots) {
        root.unmount();
      }
    };
  }, [html]);

  return (
    <div
      ref={containerRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function parseOptionalInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}
