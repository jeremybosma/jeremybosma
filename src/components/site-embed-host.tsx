import React from "react";
import {
  SITE_EMBEDS,
  SITE_EMBED_SLUGS,
  type SiteEmbedSlug,
  siteEmbedSlugFromHref,
  siteEmbedSlugFromPath,
} from "@/lib/site-embeds";
import { cn } from "@/lib/utils";

const IDLE_PRELOAD_DELAY_MS = 1200;
const IDLE_PRELOAD_GAP_MS = 1800;

type SiteEmbedHostProps = {
  pathname: string;
};

/**
 * Persistent iframe pool outside view-transition swaps. Frames stay mounted once
 * warmed so navigations to /agency and /site/* show content immediately.
 */
export default function SiteEmbedHost({ pathname }: SiteEmbedHostProps) {
  const activeSlug = siteEmbedSlugFromPath(pathname);
  const [warmed, setWarmed] = React.useState<ReadonlySet<SiteEmbedSlug>>(() => {
    return activeSlug ? new Set<SiteEmbedSlug>([activeSlug]) : new Set();
  });

  const warm = React.useEffectEvent((slug: SiteEmbedSlug) => {
    setWarmed((prev) => {
      if (prev.has(slug)) return prev;
      const next = new Set(prev);
      next.add(slug);
      return next;
    });
  });

  React.useEffect(() => {
    if (activeSlug) warm(activeSlug);
  }, [activeSlug]);

  React.useEffect(() => {
    const onIntent = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const slug = siteEmbedSlugFromHref(anchor.getAttribute("href"));
      if (slug) warm(slug);
    };

    document.addEventListener("pointerover", onIntent, true);
    document.addEventListener("pointerdown", onIntent, true);
    document.addEventListener("focusin", onIntent, true);

    return () => {
      document.removeEventListener("pointerover", onIntent, true);
      document.removeEventListener("pointerdown", onIntent, true);
      document.removeEventListener("focusin", onIntent, true);
    };
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];

    const startIdlePreload = () => {
      SITE_EMBED_SLUGS.forEach((slug, index) => {
        const id = window.setTimeout(
          () => {
            if (!cancelled) warm(slug);
          },
          IDLE_PRELOAD_DELAY_MS + index * IDLE_PRELOAD_GAP_MS
        );
        timers.push(id);
      });
    };

    let idleId: number | undefined;
    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(startIdlePreload, { timeout: 2500 });
    } else {
      timers.push(window.setTimeout(startIdlePreload, IDLE_PRELOAD_DELAY_MS));
    }

    return () => {
      cancelled = true;
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      for (const id of timers) window.clearTimeout(id);
    };
  }, []);

  const warmedList = SITE_EMBED_SLUGS.filter((slug) => warmed.has(slug));
  if (warmedList.length === 0) return null;

  return (
    <div
      className={cn(
        "site-embed-host view-transition-chrome pointer-events-none fixed inset-0 z-[1] md:left-48",
        activeSlug && "site-embed-host--active pointer-events-auto"
      )}
      aria-hidden={activeSlug ? undefined : true}
    >
      {warmedList.map((slug) => {
        const embed = SITE_EMBEDS[slug];
        const isActive = slug === activeSlug;

        return (
          <iframe
            key={slug}
            src={embed.url}
            title={embed.title}
            className={cn(
              "site-embed-iframe absolute inset-0 h-full w-full border-0 bg-background",
              // Only hide non-active frames while one is shown; keep all visible while warming.
              activeSlug && !isActive && "invisible"
            )}
            loading="eager"
            referrerPolicy="no-referrer-when-downgrade"
            allow="fullscreen"
            tabIndex={isActive ? 0 : -1}
          />
        );
      })}
    </div>
  );
}
