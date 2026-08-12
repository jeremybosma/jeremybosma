import type { LayoutProps } from "@fulldotdev/sitex";
import { SitexPageShell } from "@/components/layouts/sitex-page";
import SiteEmbedPage from "@/components/pages/site-embed-page";
import { getSiteEmbed } from "@/lib/site-embeds";

type SiteEmbedLayoutProps = LayoutProps<{ slug: string }>;

export default function SiteEmbedLayout({
  slug,
  title,
  description,
  path,
}: SiteEmbedLayoutProps) {
  const embed = getSiteEmbed(slug);

  return (
    <SitexPageShell
      title={title ?? embed?.title}
      description={description ?? embed?.description}
      path={path}
    >
      <SiteEmbedPage slug={slug} />
    </SitexPageShell>
  );
}
