import type { LayoutProps } from "@fulldotdev/sitex";
import { SitexPageShell } from "@/components/layouts/sitex-page";
import StaticProsePage from "@/components/pages/static-prose-page";
import { getAgentPage, normalizeAgentPath } from "@/lib/agent-content";
import { markdownToHtml } from "@/lib/markdown";
import { personJsonLd } from "@/lib/seo";

export default async function ProseLayout({
  title,
  description,
  path,
}: LayoutProps) {
  const page = getAgentPage(normalizeAgentPath(path));
  const html = page ? await markdownToHtml(page.markdown) : "";
  const isAbout = normalizeAgentPath(path) === "/about";

  return (
    <SitexPageShell
      title={page?.title ?? title}
      description={page?.description ?? description}
      path={path}
      jsonLd={isAbout ? personJsonLd() : undefined}
    >
      <StaticProsePage html={html} />
    </SitexPageShell>
  );
}
