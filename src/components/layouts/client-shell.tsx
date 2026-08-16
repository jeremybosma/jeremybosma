import React, { type ReactNode } from "react";
import AnalyticsIsland from "@/components/analytics-island";
import Navigation from "@/components/navigation";
import SiteEmbedHost from "@/components/site-embed-host";
import { ViewTransitionContent } from "@/components/view-transition-content";
import { scheduleHoverSlideLists } from "@/lib/hover-slide-list-dom";
import { registerPathnameSync, usePathname } from "@/lib/pathname-sync";
import { isSiteEmbedPath } from "@/lib/site-embeds";
import { installViewTransitionNavigation } from "@/lib/view-transition-navigation";
import { cn } from "@/lib/utils";

export const sectionProps = {
  variants: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  transition: {
    duration: 0.3,
  },
  style: {
    WebkitBackfaceVisibility: "hidden" as const,
    WebkitTransform: "translate3d(0, 0, 0)",
    backfaceVisibility: "hidden" as const,
    transform: "translate3d(0, 0, 0)",
    willChange: "opacity" as const,
  },
};

export const VARIANTS_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

type ClientShellProps = {
  children: ReactNode;
  pathname?: string;
};

/**
 * Page content inside view-transition slots is swapped imperatively after the
 * first load. Keep the initial React tree frozen so pathname sync re-renders
 * don't reconcile stale children over swapped HTML.
 */
const StableMobileContent = React.memo(
  function StableMobileContent({ children }: { children: ReactNode }) {
    return <ViewTransitionContent variant="mobile">{children}</ViewTransitionContent>;
  },
  () => true
);

const StableDesktopContent = React.memo(
  function StableDesktopContent({ children }: { children: ReactNode }) {
    return <ViewTransitionContent variant="desktop">{children}</ViewTransitionContent>;
  },
  () => true
);

export default function ClientShell({ children, pathname: pathnameProp }: ClientShellProps) {
  const [, syncNavigation] = React.useReducer((count: number) => count + 1, 0);
  const pathname = usePathname(pathnameProp);
  const isEmbed = isSiteEmbedPath(pathname);

  React.useEffect(() => installViewTransitionNavigation(), []);
  React.useEffect(() => registerPathnameSync(syncNavigation), []);
  React.useEffect(() => {
    scheduleHoverSlideLists();
  }, []);

  return (
    <div className={cn("min-h-screen", isEmbed && "h-dvh overflow-hidden")}>
      <AnalyticsIsland />
      <SiteEmbedHost pathname={pathname} />
      <div
        className={cn(
          "view-transition-chrome md:hidden flex flex-col",
          isEmbed ? "h-dvh p-0" : "p-6 gap-6"
        )}
      >
        <div className={cn("relative z-[2]", isEmbed && "px-6 pt-6 bg-background")}>
          <Navigation pathname={pathnameProp} />
        </div>
        <main
          className={cn(
            "flex flex-col",
            isEmbed ? "min-h-0 flex-1" : "gap-8"
          )}
        >
          <StableMobileContent>{children}</StableMobileContent>
        </main>
      </div>

      <div className={cn("hidden md:block", isEmbed ? "h-dvh" : "min-h-screen")}>
        <aside className="view-transition-chrome view-transition-sidebar fixed top-0 left-0 z-[2] h-screen w-48 p-8 flex flex-col bg-background">
          <Navigation pathname={pathnameProp} />
        </aside>
        <main
          className={cn(
            "ml-48",
            isEmbed ? "h-dvh" : "min-h-screen flex justify-center"
          )}
        >
          <div
            className={cn(
              "w-full flex flex-col min-h-0",
              isEmbed ? "h-full max-w-none p-0" : "max-w-2xl p-8 gap-8"
            )}
          >
            <StableDesktopContent>{children}</StableDesktopContent>
          </div>
        </main>
      </div>
    </div>
  );
}
