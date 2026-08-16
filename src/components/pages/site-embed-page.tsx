import { getSiteEmbed } from "@/lib/site-embeds";

type SiteEmbedPageProps = {
  slug: string;
};

/** Placeholder for SSR / view transitions; the live iframe lives in SiteEmbedHost. */
export default function SiteEmbedPage({ slug }: SiteEmbedPageProps) {
  const embed = getSiteEmbed(slug);

  if (!embed) {
    return (
      <section className="text-[17px] p-8">
        <h1 className="text-2xl font-semibold">Not found</h1>
        <p className="text-muted-foreground mt-2">
          <a href="/" className="underline">
            Back home
          </a>
        </p>
      </section>
    );
  }

  return (
    <div
      className="site-embed-placeholder h-full min-h-[50dvh] w-full bg-background md:min-h-full"
      data-site-embed={slug}
      aria-hidden="true"
    />
  );
}
