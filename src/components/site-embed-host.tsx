import React from "react";
import {
  SITE_EMBEDS,
  SITE_EMBED_SLUGS,
  getSiteEmbed,
  type SiteEmbedSlug,
  siteEmbedSlugFromHref,
  siteEmbedSlugFromPath,
} from "@/lib/site-embeds";
import { cn } from "@/lib/utils";

const IDLE_PRELOAD_DELAY_MS = 1200;
const IDLE_PRELOAD_GAP_MS = 1800;
const IDLE_PRELOAD_SLUGS: SiteEmbedSlug[] = ["agency", "individu", "integrate", "fulldev"];

type SiteEmbedHostProps = {
  pathname: string;
};

/**
 * Persistent iframe pool outside view-transition swaps. Frames stay mounted once
 * warmed so navigations to /agency and /site/* show content immediately.
 */
export default function SiteEmbedHost({ pathname }: SiteEmbedHostProps) {
  const activeSlug = siteEmbedSlugFromPath(pathname);
  const activeEmbed = activeSlug ? getSiteEmbed(activeSlug) : null;
  const [warmed, setWarmed] = React.useState<ReadonlySet<SiteEmbedSlug>>(() => {
    return activeSlug ? new Set<SiteEmbedSlug>([activeSlug]) : new Set();
  });

  const warm = React.useCallback((slug: SiteEmbedSlug) => {
    setWarmed((prev) => {
      if (prev.has(slug)) return prev;
      const next = new Set(prev);
      next.add(slug);
      return next;
    });
  }, []);

  React.useEffect(() => {
    if (activeSlug) warm(activeSlug);
  }, [activeSlug, warm]);

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
  }, [warm]);

  React.useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];

    const startIdlePreload = () => {
      IDLE_PRELOAD_SLUGS.forEach((slug, index) => {
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
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(startIdlePreload, { timeout: 2500 });
    } else {
      timers.push(window.setTimeout(startIdlePreload, IDLE_PRELOAD_DELAY_MS));
    }

    return () => {
      cancelled = true;
      if (idleId !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      for (const id of timers) window.clearTimeout(id);
    };
  }, [warm]);

  const warmedList = SITE_EMBED_SLUGS.filter((slug) => warmed.has(slug) && getSiteEmbed(slug)?.allowEmbed !== false);
  if (warmedList.length === 0 && activeEmbed?.allowEmbed !== false) return null;

  return (
    <div
      className={cn(
        "site-embed-host pointer-events-none fixed inset-x-0 bottom-0 top-20 z-[1] md:left-48 md:top-0",
        activeSlug && "site-embed-host--active pointer-events-auto"
      )}
      aria-hidden={activeSlug ? undefined : true}
    >
      {activeEmbed?.allowEmbed === false ? (
        <section className="flex h-full flex-col items-center justify-center gap-5 p-6 text-center md:p-8">
          <div className="max-w-sm space-y-3">
            <h1 className="text-2xl font-semibold">{activeEmbed.title}</h1>
            <p className="text-muted-foreground">{activeEmbed.description}</p>
            <p className="text-sm text-muted-foreground">{activeEmbed.title} doesn’t support viewing inside another website.</p>
          </div>
          <a href={activeEmbed.url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-foreground px-5 py-3 text-background">
            Open {activeEmbed.title}<span className="sr-only"> in a new tab</span>
          </a>
          <a href="/" className="text-sm text-muted-foreground underline underline-offset-4">Back home</a>
        </section>
      ) : null}
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
              !isActive && "invisible"
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
