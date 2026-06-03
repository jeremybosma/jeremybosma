import type { ReactNode } from "react";
import AnalyticsIsland from "@/components/analytics-island";
import Navigation from "@/components/navigation";
import { ViewTransitionContent } from "@/components/view-transition-content";

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

export default function ClientShell({ children, pathname }: ClientShellProps) {
  return (
    <div className="min-h-screen">
      <AnalyticsIsland />
      <div className="md:hidden flex flex-col p-6 gap-6">
        <Navigation pathname={pathname} />
        <main className="flex flex-col gap-8">
          <ViewTransitionContent>{children}</ViewTransitionContent>
        </main>
      </div>

      <div className="hidden md:block min-h-screen">
        <aside className="view-transition-sidebar fixed top-0 left-0 h-screen w-48 p-8 flex flex-col">
          <Navigation pathname={pathname} />
        </aside>
        <main className="ml-48 min-h-screen flex justify-center">
          <div className="w-full max-w-2xl p-8 flex flex-col gap-8">
            <ViewTransitionContent>{children}</ViewTransitionContent>
          </div>
        </main>
      </div>
    </div>
  );
}
