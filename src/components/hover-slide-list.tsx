import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function HoverSlideList({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("hover-slide-list", className)}>
      <div className="hover-slide-highlight" aria-hidden="true" />
      {children}
    </div>
  );
}

type HoverSlideItemProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function HoverSlideItem<T extends ElementType = "a">({
  as,
  className,
  children,
  ...props
}: HoverSlideItemProps<T>) {
  const Component = (as ?? "a") as ElementType;

  return (
    <Component className={cn("hover-slide-item", className)} {...props}>
      {children}
    </Component>
  );
}
