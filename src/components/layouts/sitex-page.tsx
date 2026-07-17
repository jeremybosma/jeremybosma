import type { ReactNode } from "react";
import BaseLayout from "@/components/layouts/base";
import ClientShell from "@/components/layouts/client-shell";
import "@/styles/globals.css";

type SitexPageShellProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  path: string;
  icon?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
};

export function SitexPageShell({
  children,
  title,
  description,
  path,
  icon,
  noIndex,
  jsonLd,
}: SitexPageShellProps) {
  return (
    <BaseLayout
      title={title}
      description={description}
      pathname={path}
      icon={icon}
      noIndex={noIndex}
      jsonLd={jsonLd}
    >
      <ClientShell client:load pathname={path}>
        {children}
      </ClientShell>
    </BaseLayout>
  );
}
