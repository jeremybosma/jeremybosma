import fs from "node:fs";
import path from "node:path";
import { getAllPosts } from "../src/lib/blog";
import { getCachedPublishedProducts } from "../src/lib/supply-products";
import { SITE_URL } from "../src/lib/site";

function urlEntry(
  loc: string,
  options?: { lastmod?: string; changefreq?: string; priority?: string }
) {
  const lastmod = options?.lastmod
    ? `\n    <lastmod>${options.lastmod}</lastmod>`
    : "";
  const changefreq = options?.changefreq
    ? `\n    <changefreq>${options.changefreq}</changefreq>`
    : "";
  const priority = options?.priority
    ? `\n    <priority>${options.priority}</priority>`
    : "";
  return `  <url>\n    <loc>${loc}</loc>${lastmod}${changefreq}${priority}\n  </url>`;
}

async function main() {
  const urls: string[] = [
    urlEntry(SITE_URL, { changefreq: "weekly", priority: "1.0" }),
    urlEntry(`${SITE_URL}/writing`, { changefreq: "weekly", priority: "0.8" }),
    urlEntry(`${SITE_URL}/supply`, { changefreq: "weekly", priority: "0.8" }),
    urlEntry(`${SITE_URL}/gallery`, { changefreq: "monthly", priority: "0.7" }),
    urlEntry(`${SITE_URL}/videos`, { changefreq: "monthly", priority: "0.7" }),
    urlEntry(`${SITE_URL}/music`, { changefreq: "weekly", priority: "0.7" }),
  ];

  for (const post of getAllPosts()) {
    if (post.draft) continue;

    urls.push(
      urlEntry(`${SITE_URL}/writing/${post.slug}`, {
        changefreq: "weekly",
        priority: "0.7",
      })
    );
  }

  for (const product of getCachedPublishedProducts()) {
    urls.push(
      urlEntry(`${SITE_URL}/supply/${product.id}`, {
        lastmod: new Date(product.updated_at).toISOString(),
        changefreq: "weekly",
        priority: "0.6",
      })
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

  const outPath = path.join(process.cwd(), "public/sitemap.xml");
  fs.writeFileSync(outPath, xml);
  console.log(`Wrote sitemap with ${urls.length} URLs to public/sitemap.xml`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
