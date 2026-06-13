import type { ReactNode } from "react";

type ViewTransitionContentProps = {
  children: ReactNode;
  variant: "mobile" | "desktop";
};

export function ViewTransitionContent({
  children,
  variant,
}: ViewTransitionContentProps) {
  return (
    <div
      className={`view-transition-content view-transition-content--${variant} flex flex-col gap-8`}
      data-view-transition-content
    >
      {children}
    </div>
  );
}
