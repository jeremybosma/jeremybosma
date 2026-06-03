import type { ReactNode } from "react";

export function ViewTransitionContent({ children }: { children: ReactNode }) {
  return (
    <div
      className="view-transition-content flex flex-col gap-8"
      data-view-transition-content
    >
      {children}
    </div>
  );
}
