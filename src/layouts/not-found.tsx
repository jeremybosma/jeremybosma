import type { LayoutProps } from "@fulldotdev/sitex";
import { SitexPageShell } from "@/components/layouts/sitex-page";
import StaticProsePage from "@/components/pages/static-prose-page";
import { getAgentPage } from "@/lib/agent-content";
import { markdownToHtml } from "@/lib/markdown";

export default async function NotFoundLayout({
  title,
  description,
  path,
}: LayoutProps) {
  const page = getAgentPage("/404");
  const html = page ? await markdownToHtml(page.markdown) : "";

  return (
    <SitexPageShell
      title={page?.title ?? title}
      description={page?.description ?? description}
      path={path}
      noIndex
    >
      <StaticProsePage html={html} />
    </SitexPageShell>
  );
}
