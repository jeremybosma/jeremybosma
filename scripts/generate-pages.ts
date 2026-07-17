/**
 * Generates static SiteX route files for blog posts and supply products.
 */
import fs from "node:fs";
import path from "node:path";
import { getAllPostSlugs, getPostMeta } from "../src/lib/blog";
import { getCachedPublishedProducts } from "../src/lib/supply-products";

const WRITING_DIR = path.join(process.cwd(), "src/pages/writing");
const SUPPLY_DIR = path.join(process.cwd(), "src/pages/supply");

function sanitizeFileSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function cleanDir(dir: string) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function writeWritingPostPage(slug: string) {
  const post = getPostMeta(slug);
  const file = path.join(WRITING_DIR, `${sanitizeFileSegment(slug)}.mdx`);
  const noindexLine = post.draft ? "noindex: true\n" : "";
  const content = `---
layout: writing-post
title: ${JSON.stringify(post.title)}
description: ${JSON.stringify(post.description)}
slug: ${JSON.stringify(slug)}
${noindexLine}---
`;
  fs.writeFileSync(file, content);
}

function writeSupplyProductPage(productId: string) {
  const products = getCachedPublishedProducts();
  const product = products.find((item) => item.id === productId);
  const file = path.join(SUPPLY_DIR, `${sanitizeFileSegment(productId)}.mdx`);
  const title = product?.title ?? "Product";
  const description = product?.description
    ? product.description.replace(/<[^>]*>/g, "").slice(0, 160)
    : "Jeremy's Supply product.";
  const content = `---
layout: supply-product
title: ${JSON.stringify(title)}
description: ${JSON.stringify(description)}
productId: ${JSON.stringify(productId)}
---
`;
  fs.writeFileSync(file, content);
}

async function main() {
  cleanDir(WRITING_DIR);
  cleanDir(SUPPLY_DIR);

  const slugs = getAllPostSlugs();
  for (const slug of slugs) {
    writeWritingPostPage(slug);
  }
  console.log(`Generated ${slugs.length} writing route(s)`);

  const products = getCachedPublishedProducts();
  for (const product of products) {
    writeSupplyProductPage(product.id);
  }
  const productCount = products.length;
  console.log(`Generated ${productCount} supply product route(s)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
