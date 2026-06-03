import fs from "node:fs";
import path from "node:path";
import { getAllPostSlugs } from "../src/lib/blog";
import { getAllProducts, getEnabledVariants } from "../src/lib/printify";
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

  for (const slug of getAllPostSlugs()) {
    urls.push(
      urlEntry(`${SITE_URL}/writing/${slug}`, {
        changefreq: "weekly",
        priority: "0.7",
      })
    );
  }

  if (process.env.PRINTIFY_SHOP_ID && process.env.PRINTIFY_API_TOKEN) {
    try {
      const products = await getAllProducts();
      const visible = products.filter(
        (p) => p.visible && getEnabledVariants(p).length > 0
      );
      for (const product of visible) {
        urls.push(
          urlEntry(`${SITE_URL}/supply/${product.id}`, {
            lastmod: new Date(product.updated_at).toISOString(),
            changefreq: "weekly",
            priority: "0.6",
          })
        );
      }
    } catch {
      // skip supply URLs when Printify is unavailable at build time
    }
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
