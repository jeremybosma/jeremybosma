import React, { type ReactNode } from "react";
import AnalyticsIsland from "@/components/analytics-island";
import Navigation from "@/components/navigation";
import { ViewTransitionContent } from "@/components/view-transition-content";
import { scheduleHoverSlideLists } from "@/lib/hover-slide-list-dom";
import { registerPathnameSync } from "@/lib/pathname-sync";
import { installViewTransitionNavigation } from "@/lib/view-transition-navigation";

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

export default function ClientShell({ children, pathname }: ClientShellProps) {
  const [, syncNavigation] = React.useReducer((count: number) => count + 1, 0);

  React.useEffect(() => installViewTransitionNavigation(), []);
  React.useEffect(() => registerPathnameSync(syncNavigation), []);
  React.useEffect(() => {
    scheduleHoverSlideLists();
  }, []);

  return (
    <div className="min-h-screen">
      <AnalyticsIsland />
      <div className="view-transition-chrome md:hidden flex flex-col p-6 gap-6">
        <Navigation pathname={pathname} />
        <main className="flex flex-col gap-8">
          <StableMobileContent>{children}</StableMobileContent>
        </main>
      </div>

      <div className="hidden md:block min-h-screen">
        <aside className="view-transition-chrome view-transition-sidebar fixed top-0 left-0 h-screen w-48 p-8 flex flex-col">
          <Navigation pathname={pathname} />
        </aside>
        <main className="ml-48 min-h-screen flex justify-center">
          <div className="w-full max-w-2xl p-8 flex flex-col gap-8">
            <StableDesktopContent>{children}</StableDesktopContent>
          </div>
        </main>
      </div>
    </div>
  );
}
