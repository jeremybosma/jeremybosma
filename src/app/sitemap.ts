import type { MetadataRoute } from "next";
import { getAllPostSlugs } from "@/lib/blog";
import { getAllProducts, getEnabledVariants } from "@/lib/printify";

const siteUrl = "https://jeremybosma.nl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const writingSlugs = getAllPostSlugs();
  const writingUrls = writingSlugs.map((slug) => ({
    url: `${siteUrl}/writing/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  let supplyProductUrls: MetadataRoute.Sitemap = [];
  try {
    const products = await getAllProducts();
    const visible = products.filter(
      (p) => p.visible && getEnabledVariants(p).length > 0
    );
    supplyProductUrls = visible.map((product) => ({
      url: `${siteUrl}/supply/${product.id}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // Skip supply product URLs if Printify env is missing at build time
  }

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/writing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/supply`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/videos`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/music`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...writingUrls,
    ...supplyProductUrls,
  ];
}
