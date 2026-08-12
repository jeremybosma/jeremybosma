import { getSiteEmbed } from "@/lib/site-embeds";

type SiteEmbedPageProps = {
  slug: string;
};

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
    <iframe
      src={embed.url}
      title={embed.title}
      className="site-embed-iframe bg-background"
      loading="eager"
      referrerPolicy="no-referrer-when-downgrade"
      allow="fullscreen"
    />
  );
}
